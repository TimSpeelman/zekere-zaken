import debug from "debug";
import uuid from "uuid/v4";
import { Hook } from "../../../util/Hook";
import { Envelope, IHandleMessages, ISendMessages } from "../../messaging/types";
import { BroadcastReference } from "../../references/types";
import { MsgAcceptVerification, MsgOfferVerification, MsgRejectVerification, MsgRequestVerification, NegStatus, VerificationMessage, VerificationSpec, VerifyNegotiation } from "./types";

const log = debug("oa:verify-manager");


/** VerifyManager wraps together all verification logic */
export class VerifyManager implements IHandleMessages<VerificationMessage> {

    public myId = ""; // FIXME

    public negHook: Hook<VerifyNegotiation> = new Hook('verify-manager:neg');

    constructor(
        private verifierStrategy: VerifierNegotiationStrategy,
        private verifieeStrategy: VerifieeNegotiationStrategy,
        protected getSessionById: (sessionId: string) => VerifyNegotiation | undefined) { }

    public receive(envelope: Envelope<VerificationMessage>): boolean {
        if (!this.canAcceptMessage(envelope)) return false;

        if (!this.tryForwardToExistingSession(envelope) &&
            !this.tryForwardToNewSession(envelope)) {

            log("could not create session for some reason");
        }

        return true;
    }

    protected tryForwardToExistingSession(envelope: Envelope<VerificationMessage>) {
        const session = this.getSessionById(envelope.message.sessionId);

        if (session) {
            log('forwarding message to existing session', envelope);

            this.handleMessage(session, envelope);
            return true;
        }
    }

    protected tryForwardToNewSession(envelope: Envelope<VerificationMessage>) {
        const { senderId, message, reference } = envelope;

        if (message.type == "OfferVerification" ||
            message.type === "RequestVerification") {

            const iVerify = message.type === "OfferVerification";
            const ref = reference ? { reference, senderId } : undefined;
            const session = this.createSession(senderId, message.sessionId, iVerify, ref);

            log('forwarding message to new session', envelope);
            this.handleMessage(session, envelope);
            return true;
        }
    }

    protected handleMessage(session: VerifyNegotiation, envelope: Envelope<VerificationMessage>) {
        const { message } = envelope;
        const iVerify = session.subjectId === envelope.senderId
        const strategy = iVerify ? this.verifierStrategy : this.verifieeStrategy;

        switch (message.type) {
            case "OfferVerification": return strategy.handleOffer(session, message);
            case "RequestVerification": return strategy.handleRequest(session, message);
            case "AcceptVerification": return strategy.handleAccept(session, message);
            case "RejectVerification": return strategy.handleReject(session, message);
        }
    }

    public createSession(peerId: string, sessionId: string, iVerify: boolean, reference?: BroadcastReference): VerifyNegotiation {
        return {
            fromReference: reference,
            sessionId,
            verifierId: iVerify ? this.myId : peerId,
            subjectId: iVerify ? peerId : this.myId,
            status: NegStatus.Pending,
            steps: [],
            verifierAccepts: false,
            subjectAccepts: false,
        }
    }

    protected canAcceptMessage(envelope: Envelope<VerificationMessage>) {
        const knownTypes: VerificationMessage["type"][] = ["OfferVerification", "RequestVerification", "AcceptVerification", "RejectVerification"];
        return (knownTypes.indexOf(envelope.message.type) >= 0)
    }

}

/**
 * When we are the verifier.
 */
export class VerifierNegotiationStrategy {

    constructor(private sender: ISendMessages<VerificationMessage>, private negHook: Hook<VerifyNegotiation>) { }

    /** We ask a Subject if we may verify it. */
    public startVerify(myId: string, subjectId: string, spec: Partial<VerificationSpec>, reference?: string, templateId?: string) {

        const sessionId = uuid();

        // Send verifreq to peer
        const msg: MsgRequestVerification = {
            type: "RequestVerification",
            sessionId: sessionId,
            spec,
        };

        const neg: VerifyNegotiation = {
            fromTemplateId: templateId,
            sessionId,
            verifierId: myId,
            subjectId,
            status: NegStatus.Pending,
            steps: [msg],
            verifierAccepts: this.specIsComplete(spec),
            subjectAccepts: false,
        };

        this.sender.send(subjectId, msg, reference);

        this.negHook.fire(neg);
    }

    /** When a Subject responds with an offer, we expect it to be complete to start IDVerify */
    public handleOffer(session: VerifyNegotiation, message: MsgOfferVerification) {

        const offeredSpec = message.spec;

        if (this.offerIsAcceptable(offeredSpec, session.conceptSpec)) {
            const newSession: VerifyNegotiation = {
                ...session,
                steps: [...session.steps, message], // We add the offer
                conceptSpec: offeredSpec, // We take the offer as the new status
                verifierAccepts: this.specIsComplete(offeredSpec),
                status: NegStatus.Successful,
                subjectAccepts: true,
            };

            this.negHook.fire(newSession);
        }
    }

    /** We are to be Verified. */
    public handleRequest(session: VerifyNegotiation, message: MsgRequestVerification) {
        throw new Error("Protocol Error. We should be verifier");
    }

    /** If the Subject accepts, register that. */
    public handleAccept(session: VerifyNegotiation, message: MsgAcceptVerification) {
        if (this.specIsComplete(session.conceptSpec)) {
            throw new Error("Protocol Error. Cannot accept an incomplete spec");
        }

        const newSession: VerifyNegotiation = {
            ...session,
            steps: [...session.steps, message], // We add the Accept
            status: NegStatus.Successful,
            subjectAccepts: true,
        };

        this.negHook.fire(newSession);
    }

    /** If the Subject accepts, register that */
    public handleReject(session: VerifyNegotiation, message: MsgRejectVerification) {
        this.negHook.fire({
            ...session,
            steps: [...session.steps, message], // We add the Reject
            status: NegStatus.Terminated,
        });
    }

    protected offerIsAcceptable(offer: Partial<VerificationSpec>, start?: Partial<VerificationSpec>) {
        return true; // FIXME Compare offer
    }

    protected specIsComplete(spec?: Partial<VerificationSpec>) {
        return !!spec && !!spec.authority && !!spec.legalEntity;
    }
}

/**
 * When we are being verified.
 */
export class VerifieeNegotiationStrategy {

    constructor(private sender: ISendMessages<VerificationMessage>, private negHook: Hook<VerifyNegotiation>) { }

    public offer(session: VerifyNegotiation, spec: Partial<VerificationSpec>) {

        if (!this.specIsComplete(spec)) {
            throw new Error("Protocol Error. We cannot offer an incomplete spec.");
        }

        const message: MsgOfferVerification = { sessionId: session.sessionId, type: "OfferVerification", spec };

        const newSession: VerifyNegotiation = {
            ...session,
            conceptSpec: spec,
            steps: [...session.steps, message], // We add the offer
            subjectAccepts: true,
            status: NegStatus.Successful,
        };

        this.sender.send(session.verifierId, message);
        this.negHook.fire(newSession);
    }

    public accept(session: VerifyNegotiation) {

        if (!this.specIsComplete(session.conceptSpec)) {
            throw new Error("Protocol Error. We cannot accept an incomplete spec.");
        }

        const message: MsgAcceptVerification = { sessionId: session.sessionId, type: "AcceptVerification" };

        const newSession: VerifyNegotiation = {
            ...session,
            steps: [...session.steps, message], // We add the offer
            subjectAccepts: true,
            status: session.verifierAccepts ? NegStatus.Successful : session.status,
        };

        this.sender.send(session.verifierId, message);
        this.negHook.fire(newSession);
    }

    public reject(session: VerifyNegotiation) {
        const message: MsgRejectVerification = { sessionId: session.sessionId, type: "RejectVerification" };

        const newSession: VerifyNegotiation = {
            ...session,
            steps: [...session.steps, message], // We add the offer
            status: NegStatus.Terminated,
        };

        this.sender.send(session.verifierId, message);
        this.negHook.fire(newSession);
    }

    /** We Verify. */
    public handleOffer(session: VerifyNegotiation, message: MsgOfferVerification) {
        throw new Error("Protocol Error. We should be verifiee");
    }

    /** We are to be Verified. */
    public handleRequest(session: VerifyNegotiation, message: MsgRequestVerification) {
        const offeredSpec = message.spec;

        if (this.offerIsAcceptable(offeredSpec, session.conceptSpec)) {
            const newSession: VerifyNegotiation = {
                ...session,
                steps: [...session.steps, message], // We add the offer
                conceptSpec: offeredSpec, // We take the offer as the new status
            };

            if (this.specIsComplete(offeredSpec)) {
                newSession.verifierAccepts = true;
            }

            this.negHook.fire(newSession);
        }
    }

    public handleAccept(session: VerifyNegotiation, message: MsgAcceptVerification) {
        throw new Error("Protocol Error. We should be verifiee");
    }

    public handleReject(session: VerifyNegotiation, message: MsgRejectVerification) {
        throw new Error("Protocol Error. We should be verifiee");
    }

    protected offerIsAcceptable(offer: Partial<VerificationSpec>, start?: Partial<VerificationSpec>) {
        return true; // FIXME Compare offer
    }

    protected specIsComplete(spec?: Partial<VerificationSpec>): spec is VerificationSpec {
        return !!spec && !!spec.authority && !!spec.legalEntity;
    }
}
