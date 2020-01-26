import { Hook } from "../../../util/Hook";
import { Envelope, ISendMessages } from "../messaging/types";
import { IVerifiee, IVerifier, MsgAcceptVerification, MsgOfferVerification, MsgRejectVerification, VerificationMessage, VerificationSpec, VerifyDraft } from "./types";

export enum VerificationStatus {
    Negotiating = "Negotiating",
    Verifying = "Verifying",
    Rejected = "Rejected",
    Failed = "Failed",
}

export class VerifySession {
    iVerify = false;
    myId = ""; // FIXME

    public status: VerificationStatus = VerificationStatus.Negotiating;
    public spec?: Partial<VerificationSpec>;

    public newDraftHook: Hook<VerifyDraft> = new Hook();

    constructor(
        readonly peerId: string,
        readonly id: string,
        protected sender: ISendMessages<VerificationMessage>,
        protected verifier: IVerifier,
        protected verifiee: IVerifiee) { }

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
        // TODO Check that it matches the reqs
        this.spec = msg.spec;
        this.notifyOfNewDraft();

        if (this.iVerify && specIsComplete(msg.spec)) {
            this.accept();
        }
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
                subjectId: this.subjectId,
                verifierId: this.verifierId,
            });
        }
    }

    /** Allow a VerifyTransaction. */
    protected allowIPv8Verification() {
        if (specIsComplete(this.spec)) {
            this.verifiee.allowToVerify({
                sessionId: this.id,
                spec: this.spec,
                subjectId: this.subjectId,
                verifierId: this.verifierId,
            })
        }
    }

    /** Set and notify status */
    protected setStatus(status: VerificationStatus) {
        this.status = status;
    }

    protected notifyOfNewDraft() {
        this.newDraftHook.fire({
            draftId: `${this.peerId}:${this.id}`,
            spec: this.spec!,
            subjectId: this.subjectId,
            verifierId: this.verifierId,
        });
    }
}

function specIsComplete(spec: Partial<VerificationSpec> | undefined): spec is VerificationSpec {
    return !!spec && !!spec.authority && !!spec.legalEntity;
}
