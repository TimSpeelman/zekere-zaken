import debug from "debug";
import { DomainEvent, NegotiationCompleted } from "../../../commands/Event";
import { Hook } from "../../../util/Hook";
import { Envelope, ISendMessages } from "../../messaging/types";
import { MsgAcceptVerification, MsgOfferVerification, MsgRejectVerification, VerificationMessage, VerificationSpec, VerificationTransaction, VerifyDraft } from "./types";

export enum VerificationStatus {
    Negotiating = "Negotiating",
    Verifying = "Verifying",
    Rejected = "Rejected",
    Failed = "Failed",
}

const log = debug("oa:verify-session");

export class VerifySession {
    iVerify = false;
    myId = ""; // FIXME

    public status: VerificationStatus = VerificationStatus.Negotiating;
    public spec?: Partial<VerificationSpec>;

    public eventHook: Hook<DomainEvent> = new Hook('verify-session:event');
    public newDraftHook: Hook<VerifyDraft> = new Hook('verify-session:draft');

    constructor(
        readonly peerId: string,
        readonly id: string,
        protected sender: ISendMessages<VerificationMessage>,
    ) { }

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
        this.notifyOfNewDraft();
    }

    /** Accept the current offer. */
    public accept() {
        this.sender.send<MsgAcceptVerification>(this.peerId, {
            type: "AcceptVerification",
            sessionId: this.id,
        });
        this.complete();
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
        log("received offer", msg.spec);
        // TODO Check that it matches the reqs
        this.spec = msg.spec;
        this.notifyOfNewDraft();

        if (this.iVerify && specIsComplete(msg.spec)) {
            this.accept();
        }
    }

    /** When the offer is accepted, the Verifier starts the procedure. */
    protected receiveAcceptVerification(senderId: string, msg: MsgAcceptVerification) {
        log("received accept", msg.sessionId);

        this.setStatus(VerificationStatus.Verifying);

        this.complete();
    }

    /** When the offer is rejected, we notify and close. */
    protected receiveRejectVerification(senderId: string, msg: MsgRejectVerification) {
        log("received reject", msg.sessionId);

        this.setStatus(VerificationStatus.Rejected);
    }


    public getTransaction(): VerificationTransaction | undefined {
        if (specIsComplete(this.spec)) {
            return {
                sessionId: this.id,
                spec: this.spec!,
                subjectId: this.subjectId,
                verifierId: this.verifierId,
            };
        } else {
            return undefined;
        }
    }

    protected complete() {
        this.eventHook.fire(NegotiationCompleted({ transaction: this.getTransaction()! }))
    }

    /** Set and notify status */
    protected setStatus(status: VerificationStatus) {
        this.status = status;
    }

    protected notifyOfNewDraft() {
        this.newDraftHook.fire({
            draftId: this.id,
            spec: this.spec!,
            subjectId: this.subjectId,
            verifierId: this.verifierId,
        });
    }
}

function specIsComplete(spec: Partial<VerificationSpec> | undefined): spec is VerificationSpec {
    return !!spec && !!spec.authority && !!spec.legalEntity;
}
