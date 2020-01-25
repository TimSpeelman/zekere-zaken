import uuid from "uuid/v4";
import { Dict } from "../../../types/Dict";
import { Hook } from "../../../util/Hook";
import { Envelope, IReceiveMessages, ISendMessages } from "../messaging/types";
import { MsgAcceptVerification, MsgOfferVerification, MsgRejectVerification, VerificationMessage, VerificationSpec, VerifyDraft } from "./types";
import { Verifiee } from "./Verifiee";
import { Verifier } from "./Verifier";

/** VerifyManager wraps together all verification logic */
export class VerifyManager implements IReceiveMessages<VerificationMessage> {

    public myId = ""; // FIXME

    public newDraftHook: Hook<VerifyDraft> = new Hook();

    protected sessions: Dict<Dict<VerificationSession>> = {};

    constructor(
        private sender: ISendMessages<VerificationMessage>,
        private verifier: Verifier,
        private verifiee: Verifiee) { }

    receive(envelope: Envelope<VerificationMessage>): boolean {
        const { message, senderId, } = envelope;
        const knownTypes = ["OfferVerification", "AcceptVerification", "RejectVerification"];

        // Discard other messages
        if (knownTypes.indexOf(message.type) < 0) return false;

        const session = this.getOrCreateSession(senderId, message.sessionId);
        if (session) {
            session.receive(envelope);
        } else {
            console.warn("Could not create session for some reason");
        }

        return true;
    }

    /** Start a verification negotiation */
    startVerify(subjectId: string, spec: Partial<VerificationSpec>, reference?: string) {
        const session = this.createSession(subjectId, uuid());
        session.offer(spec, reference);
        return session;
    }

    protected getOrCreateSession(peerId: string, sessionId: string) {
        if (!sessionId) return;

        const session = (this.sessions[peerId] || {})[sessionId];

        return !!session ? session : this.createSession(peerId, sessionId);
    }

    protected createSession(peerId: string, sessionId: string) {
        const session = new VerificationSession(peerId, sessionId, this.sender, this.verifier, this.verifiee);
        this.sessions = {
            ...this.sessions,
            [peerId]: {
                ...this.sessions[peerId],
                [sessionId]: session
            },
        };
        session.myId = this.myId;
        session.newDraftHook.pipe(this.newDraftHook);
        return session;
    }
}

export enum VerificationStatus {
    Negotiating = "Negotiating",
    Verifying = "Verifying",
    Rejected = "Rejected",
    Failed = "Failed",
}

class VerificationSession {
    iVerify = false;
    myId = ""; // FIXME

    public status: VerificationStatus = VerificationStatus.Negotiating;
    public spec?: Partial<VerificationSpec>;

    public newDraftHook: Hook<VerifyDraft> = new Hook();

    constructor(
        readonly peerId: string,
        readonly id: string,
        protected sender: ISendMessages<VerificationMessage>,
        protected verifier: Verifier,
        protected verifiee: Verifiee) { }

    get verifierId() {
        return this.iVerify ? this.myId : this.peerId;
    }

    get subjectId() {
        return this.iVerify ? this.peerId : this.myId;
    }

    public offer(spec: Partial<VerificationSpec>, reference?: string) {
        this.spec = spec;
        this.sender.send<MsgOfferVerification>(this.peerId, {
            type: "OfferVerification",
            sessionId: this.id,
            spec
        }, reference);
    }

    /** Accept the current offer. */
    public accept() {
        this.sender.send<MsgAcceptVerification>(this.peerId, {
            type: "AcceptVerification",
            sessionId: this.id,
        });
    }

    /** Reject the session. */
    public reject() {
        this.sender.send<MsgRejectVerification>(this.peerId, {
            type: "RejectVerification",
            sessionId: this.id,
        });
    }

    /** Inject messages that are meant for this session */
    public receive({ message, senderId }: Envelope<VerificationMessage>) {
        switch (message.type) {
            case "OfferVerification": return this.receiveOfferVerification(senderId, message);
            case "AcceptVerification": return this.receiveAcceptVerification(senderId, message);
            case "RejectVerification": return this.receiveRejectVerification(senderId, message);
        }
    }

    /** When we receive a Verification offer, we notify through our hook. */
    protected receiveOfferVerification(senderId: string, msg: MsgOfferVerification) {
        this.spec = msg.spec;
        this.newDraftHook.fire({
            draftId: `${this.peerId}:${this.id}`,
            spec: this.spec,
            subjectId: this.subjectId,
            verifierId: this.verifierId,
        });
    }

    /** When the offer is accepted, the Verifier starts the procedure. */
    protected receiveAcceptVerification(senderId: string, msg: MsgAcceptVerification) {
        this.setStatus(VerificationStatus.Verifying);
        if (this.iVerify) {
            this.triggerIPv8Verification();
        } else {
            this.allowIPv8Verification();
        }
    }

    /** When the offer is rejected, we notify and close. */
    protected receiveRejectVerification(senderId: string, msg: MsgRejectVerification) {
        this.setStatus(VerificationStatus.Rejected);
    }

    /** Trigger a VerifyTransaction. */
    protected triggerIPv8Verification() {
        if (specIsComplete(this.spec)) {
            this.verifier.verify({
                sessionId: this.id,
                spec: this.spec,
                subjectId: this.peerId,
                verifierId: "FIXME",
            });
        }
    }

    /** Allow a VerifyTransaction. */
    protected allowIPv8Verification() {
        if (specIsComplete(this.spec)) {
            this.verifiee.allowToVerify({
                sessionId: this.id,
                spec: this.spec,
                subjectId: this.peerId,
                verifierId: "FIXME",
            })
        }
    }

    /** Set and notify status */
    protected setStatus(status: VerificationStatus) {
        this.status = status;
    }
}

function specIsComplete(spec: Partial<VerificationSpec> | undefined): spec is VerificationSpec {
    return !!spec && !!spec.authority && !!spec.legalEntity;
}
