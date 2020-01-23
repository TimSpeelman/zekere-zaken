import { Dict } from "@tsow/ow-attest/dist/types/ipv8/types/Dict";
import debug from "debug";
import uuid from "uuid/v4";
import { Agent, IPv8VerifReq, Me } from "../shared/Agent";
import { Envelope, Msg, MsgProfile, MsgReplyToVerifReq, MsgResolveReference, MsgSendVerificationRequestDetails } from "../shared/PeerMessaging";
import { Profile, VerificationRequest } from "../types/State";
import { Hook } from "../util/Hook";
import { Timer } from "../util/timer";
import { AuthorizationSpec, BroadcastReference, IdentityGatewayInterface, InMsg, ResolveOptions, Result } from "./IdentityGatewayInterface";

/**
 * Verification Messaging Procedure:
 *
 * - [Verifier] creates VerificationRequest
 * - [Verifier] broadcasts [ZZ:BroadcastReference] (pointing to the request) via QR.
 * - [Subject] scans the QR -> BroadcastReference.
 * - [Subject] sends [ZZ:ResolveReference] message with the scanned reference.
 * - [Verifier] answers with [ZZ:SendVerificationRequestDetails] message.
 * - [Subject], upon end-user consent, sends [ZZ:AcceptVerificationRequest] message.
 * - [Verifier] sends [IPv8:VerifyRequest]
 * - [Subject] sends [IPv8:VerifyACK] to its Agent, triggering the IPv8 Verification procedure.
 * - [Verifier] receives [IPv8:VerifyResult] from its Agent.
 */

const log = debug('oa:IDGateway');

interface AllowedVerif {
    requestId: string;
    peerId: string;
    spec: VerificationRequest;
    expireMillis: number;
}

interface AllowedAuth {
    peerId: string;
    spec: AuthorizationSpec;
}


interface InVer {
    peerId: string;
    request: VerificationRequest;
}

interface VerifReport {
    subjectId: string;
    verifierId: string;
    request: VerificationRequest;
    result: Result;
}

/** Mocking the ID Gateway using a client-server model */
export class SocketServerIDGateway implements IdentityGatewayInterface {

    private allowedVerifs: AllowedVerif[] = [];
    private sentRefs: Dict<VerificationRequest> = {};
    private waitingForRefs: Dict<(req: VerificationRequest) => void> = {};

    public me?: Me;
    private profile?: Profile;
    private profileSharedWith: string[] = [];

    /** When a peer sends a message to us, this hook fires */
    incomingMessageHook: Hook<InMsg> = new Hook();
    verifiedProfileHook: Hook<{ peerId: string, profile: Profile }> = new Hook();

    incomingVerifReqHook: Hook<InVer> = new Hook();
    completedVerifHook: Hook<VerifReport> = new Hook();

    constructor(private agent: Agent) {
        this.agent.setVerificationRequestHandler(this.handleIPv8VerificationRequest.bind(this));
        this.agent.setIncomingMessageHandler(this.handleIncomingMessage.bind(this));
    }

    get isConnected() {
        return !!this.me;
    }

    connect() {
        return this.agent.connect().then(me => {
            this.me = me;
            return me;
        });
    }

    public setProfile(profile: Profile) {
        this.profile = profile;
    }

    /**
     * When the Verifier wishes to verify a Subject, he will create a VerificationRequest
     * and communicate this with the Subject. Instead of the entire request, only a 
     * reference to it will be sent. Hence, the Verifier will store its request associated
     * with the created reference string. The Subject will later call the Verifier to
     * resolve this reference.
     */
    public makeReferenceToVerificationRequest(req: VerificationRequest): BroadcastReference {
        this.assertConnected();

        // Map the reference to the request for subsequent resolution.
        const reference = uuid();
        this.sentRefs[reference] = { ...req, id: reference }; // TOOD is this safe?

        // This will be sent to the Subject:
        return { senderId: this.me!.id, reference };
    }

    /** 
     * The Subject gets a reference via QR or another channel, which decodes to a
     * BroadcastReference. It will try to resolve this by calling the sender. 
     */
    public requestToResolveBroadcast(ref: BroadcastReference, options: ResolveOptions = {}): Promise<VerificationRequest> {
        const msg: MsgResolveReference = {
            type: "ResolveReference",
            ref: ref.reference,
        }

        // Upon receiving the answer, resolve the returned promise.
        const success = new Promise<VerificationRequest>((resolve) => {
            this.waitingForRefs[ref.reference] = (req: VerificationRequest) => {
                resolve(req);
            };

            this.sendMessageToPeer(ref.senderId, msg);
        });

        const millis = options?.timeout || 20 * 1000;
        const timeout: Promise<false> = new Timer(() => false, millis).promise().then(() => false);

        return Promise.race([success, timeout]).then((result) => {
            if (!result) {
                throw new Error("Resolve timed out");
            } else {
                return result;
            }
        });

    }

    /**
     * When our User has decided whether to allow the Verification, we communicate
     * this to the Verifier. We also store the request for the subsequent Verification
     * procedure that will be triggered by the Verifier.
     */
    public answerVerificationRequest(peerId: string, requestId: string, req: VerificationRequest, accept: boolean) {
        // If true, whitelist this request for when the invokes
        // the IPv8 Verification Procedure
        if (accept) {
            this.allowedVerifs.push({
                requestId,
                peerId,
                spec: req,
                expireMillis: 10000,
            })
        }

        const msg: MsgReplyToVerifReq = {
            type: "ReplyToVerifReq",
            requestId,
            accept,
        }

        this.sendMessageToPeer(peerId, msg);
        this.sendProfile(peerId);
    }

    /** We send a message directly to a peer. */
    protected sendMessageToPeer(peerId: string, message: Msg): Promise<void> {
        this.assertConnected();

        const envelope: Envelope = {
            messageId: uuid(),
            message,
            senderId: this.me!.id,
        }

        log("Sending to peer", peerId, ":", envelope);

        const encodedMessage = JSON.stringify(envelope);

        return this.agent.sendMessage(peerId, encodedMessage);
    }

    /** When we receive a message from a peer */
    protected handleIncomingMessage(senderId: string, encodedMessage: string) {

        const envelope: Envelope = JSON.parse(encodedMessage); // TODO VALIDATE

        switch (envelope.message.type) {
            case "ResolveReference": this.receiveResolveReference(senderId, envelope.message); break;
            case "SendVerificationRequestDetails": this.receiveVerificationRequest(senderId, envelope.message); break;
            case "ReplyToVerifReq": this.receiveVerificationResponse(senderId, envelope.message); break;
            case "Profile": this.receiveProfile(senderId, envelope.message); break;
            default: console.warn("Unknown incoming message type:", envelope);
        }
    }

    protected sendProfile(peerId: string, ignoreCache?: boolean) {
        if (!ignoreCache && this.profileSharedWith.indexOf(peerId) >= 0) {
            return;
        }
        const message: MsgProfile = {
            type: "Profile",
            profile: this.profile!,
        }
        this.profileSharedWith.push(peerId);
        this.sendMessageToPeer(peerId, message);
    }

    /**
     * When a Peer sends a ResolveReference message, we will look up
     * the request that we have registered earlier with that reference
     * and send it to the Peer.
     */
    protected receiveResolveReference(peerId: string, incomingMessage: MsgResolveReference) {
        const verifReq: VerificationRequest = this.sentRefs[incomingMessage.ref];

        if (!verifReq) {
            console.warn(`Could not resolve reference ${incomingMessage.ref} as asked by peer ${peerId}!`);
            return;
        }

        const requestId = uuid();
        const message: MsgSendVerificationRequestDetails = {
            type: "SendVerificationRequestDetails",
            reference: incomingMessage.ref,
            requestId,
            request: { ...verifReq }
        }

        this.sendMessageToPeer(peerId, message);
        this.sendProfile(peerId);
    }

    /**
     * When we receive a VerificationRequest from a Peer, we only accept it
     * if it corresponds to a reference we asked for. This is to avoid
     * spamming.
     * 
     * We notify the user and store the incoming request. Later the user will
     * accept or deny it. We will communicate this back to the requester using
     * the ID stored in the request.
     */
    protected receiveVerificationRequest(peerId: string, msg: MsgSendVerificationRequestDetails) {

        if (msg.reference && msg.reference in this.waitingForRefs) {
            // Call the callback
            this.waitingForRefs[msg.reference](msg.request);

            // Remove the reference, as we no longer wait for its resolution.
            delete this.waitingForRefs[msg.reference];

            // Nofity the user of the incoming request.
            this.incomingVerifReqHook.fire({ peerId, request: msg.request });
            return;
        }

        console.warn("Ignored incoming Verification Request");
    }

    /**
     * When a Subject answers to our request for Verification, we will
     * start the verification procedure through the IPv8 layer.
     */
    protected receiveVerificationResponse(senderId: string, msg: MsgReplyToVerifReq) {
        const request = this.sentRefs[msg.requestId];
        if (!request) {
            return console.warn(`Received a response to an unknown request with ID '${msg.requestId}'`);
        }
        if (msg.accept) {
            this.verifyPeerOverIPv8(senderId, request)
        }
    }

    protected receiveProfile(senderId: string, message: MsgProfile) {
        log("received profile", senderId, message.profile);
        this.verifiedProfileHook.fire({ peerId: senderId, profile: message.profile });
    }

    /** Verify a peer over IPv8 */
    protected verifyPeerOverIPv8(peerId: string, request: VerificationRequest) {
        const req: IPv8VerifReq = {
            credentials: [],
            meta: request.id,
            verifierId: this.me!.id,
        }
        this.agent.verifyPeer(peerId, req).then((result) => {
            const report: VerifReport = {
                request,
                result,
                subjectId: peerId,
                verifierId: this.me!.id,
            }
            this.completedVerifHook.fire(report);
        }).catch((e) => {
            console.warn("Verification yielded error", e)
        })
    }

    /** 
     * When the Peer invokes the IPv8 Verification Request,
     * it will come back to us. We will accept it only if it was
     * white listed before. This means we need some mapping between
     * IPv8 requests and earlier negotiations. I assume we pass some
     * reference in the IPv8 meta.
     */
    protected handleIPv8VerificationRequest(req: IPv8VerifReq): Promise<boolean> {
        this.assertConnected();
        // TODO allow or deny
        const reference = req.meta;
        const allowed = this.allowedVerifs.find(v => v.requestId === reference);
        if (!allowed) {
            console.warn(`Incoming IPv8 Request ignored, unknown reference '${reference}'`);
            return Promise.resolve(false);
        }
        const vReq: VerificationRequest = allowed.spec;
        const v: VerifReport = {
            request: vReq,
            result: Result.Succeeded,
            subjectId: this.me!.id,
            verifierId: req.verifierId,
        };
        this.completedVerifHook.fire(v);
        return Promise.resolve(true);
    }

    protected assertConnected() {
        if (!this.me) {
            throw new Error("Not connected to agent yet!");
        }
    }

    protected assertProfileSet() {
        if (!this.profile) {
            throw new Error("Profile not yet set!");
        }
    }

}
