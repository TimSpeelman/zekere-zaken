import debug from "debug";
import uuid from "uuid/v4";
import { Hook } from "../../../util/Hook";
import { Envelope, IHandleMessages, ISendMessages } from "../../messaging/types";
import { BroadcastReference } from "../../references/types";
import { AuthorizationMessage, AuthorizationSpec, AuthorizeNegotiation, MsgAcceptAuthorization, MsgOfferAuthorization, MsgRejectAuthorization, MsgRequestAuthorization, NegStatus, specIsComplete } from "./types";

const log = debug("oa:authorize-manager");


/** AuthorizeManager wraps together all Authorization logic */
export class AuthorizeManager implements IHandleMessages<AuthorizationMessage> {

    public myId = ""; // FIXME

    constructor(
        private authorizerStrategy: AuthorizerNegotiationStrategy,
        private authorizeeStrategy: AuthorizeeNegotiationStrategy,
        protected getSessionById: (sessionId: string) => AuthorizeNegotiation | undefined) { }

    public receive(envelope: Envelope<AuthorizationMessage>): boolean {
        if (!this.canAcceptMessage(envelope)) return false;

        if (!this.tryForwardToExistingSession(envelope) &&
            !this.tryForwardToNewSession(envelope)) {

            log("could not create session for some reason");
        }

        return true;
    }

    protected tryForwardToExistingSession(envelope: Envelope<AuthorizationMessage>) {
        const session = this.getSessionById(envelope.message.sessionId);

        if (session) {
            log('forwarding message to existing session', envelope);

            this.handleMessage(session, envelope);
            return true;
        }
    }

    protected tryForwardToNewSession(envelope: Envelope<AuthorizationMessage>) {
        const { senderId, message, reference } = envelope;

        if (message.type == "OfferAuthorization" ||
            message.type === "RequestAuthorization") {

            const iAuthorize = message.type === "RequestAuthorization";
            const ref = reference ? { reference, senderId } : undefined;
            const session = this.createSession(senderId, message.sessionId, iAuthorize, ref);

            log('forwarding message to new session', envelope);

            this.handleMessage(session, envelope);
            return true;
        }
    }

    protected handleMessage(session: AuthorizeNegotiation, envelope: Envelope<AuthorizationMessage>) {
        const { message } = envelope;
        const iAuthorize = session.subjectId === envelope.senderId
        const strategy = iAuthorize ? this.authorizerStrategy : this.authorizeeStrategy;

        switch (message.type) {
            case "OfferAuthorization": return strategy.handleOffer(session, message);
            case "RequestAuthorization": return strategy.handleRequest(session, message);
            case "AcceptAuthorization": return strategy.handleAccept(session, message);
            case "RejectAuthorization": return strategy.handleReject(session, message);
        }
    }

    public createSession(peerId: string, sessionId: string, iAuthorize: boolean, reference?: BroadcastReference): AuthorizeNegotiation {
        return {
            fromReference: reference,
            sessionId,
            authorizerId: iAuthorize ? this.myId : peerId,
            subjectId: iAuthorize ? peerId : this.myId,
            status: NegStatus.Pending,
            steps: [],
            authorizerAccepts: false,
            subjectAccepts: false,
        }
    }

    protected canAcceptMessage(envelope: Envelope<AuthorizationMessage>) {
        const knownTypes: AuthorizationMessage["type"][] = ["OfferAuthorization", "RequestAuthorization", "AcceptAuthorization", "RejectAuthorization"];
        return (knownTypes.indexOf(envelope.message.type) >= 0)
    }

}

/**
 * When we are the verifier.
 */
export class AuthorizerNegotiationStrategy {

    constructor(private sender: ISendMessages<AuthorizationMessage>, private negHook: Hook<AuthorizeNegotiation>) { }

    public offer(session: AuthorizeNegotiation, spec: Partial<AuthorizationSpec>) {

        if (!specIsComplete(spec)) {
            throw new Error("Protocol Error. We cannot offer an incomplete spec.");
        }

        const message: MsgOfferAuthorization = { sessionId: session.sessionId, type: "OfferAuthorization", spec };

        const newSession: AuthorizeNegotiation = {
            ...session,
            conceptSpec: spec,
            steps: [...session.steps, message], // We add the offer
            authorizerAccepts: true,
            status: NegStatus.Successful,
        };

        this.sender.send(session.subjectId, message);
        this.negHook.fire(newSession);
    }

    /** When a Subject responds with an offer, we expect it to be complete to start IDAuthorize */
    public handleOffer(session: AuthorizeNegotiation, message: MsgOfferAuthorization) {
        throw new Error("Protocol Error. We should be authorizer");

        // const offeredSpec = message.spec;

        // if (this.offerIsAcceptable(offeredSpec, session.conceptSpec)) {
        //     const newSession: AuthorizeNegotiation = {
        //         ...session,
        //         steps: [...session.steps, message], // We add the offer
        //         conceptSpec: offeredSpec, // We take the offer as the new status
        //         authorizerAccepts: specIsComplete(offeredSpec),
        //         status: NegStatus.Successful,
        //         subjectAccepts: true,
        //     };

        //     this.negHook.fire(newSession);
        // }
    }

    /** We are requested to authorize. */
    public handleRequest(session: AuthorizeNegotiation, message: MsgRequestAuthorization) {

        const offeredSpec = message.spec;

        if (this.offerIsAcceptable(offeredSpec, session.conceptSpec)) {
            const newSession: AuthorizeNegotiation = {
                ...session,
                steps: [...session.steps, message], // We add the offer
                conceptSpec: offeredSpec, // We take the offer as the new status
                subjectAccepts: specIsComplete(offeredSpec),
                status: session.authorizerAccepts ? NegStatus.Successful : session.status,
            };

            this.negHook.fire(newSession);
        }
    }

    /** If the Subject accepts, register that. */
    public handleAccept(session: AuthorizeNegotiation, message: MsgAcceptAuthorization) {
        if (!specIsComplete(session.conceptSpec)) {
            throw new Error("Protocol Error. Cannot accept an incomplete spec");
        }

        const newSession: AuthorizeNegotiation = {
            ...session,
            steps: [...session.steps, message], // We add the Accept
            status: session.authorizerAccepts ? NegStatus.Successful : session.status,
            subjectAccepts: true,
        };

        this.negHook.fire(newSession);
    }

    /** If the Subject accepts, register that */
    public handleReject(session: AuthorizeNegotiation, message: MsgRejectAuthorization) {
        this.negHook.fire({
            ...session,
            steps: [...session.steps, message], // We add the Reject
            status: NegStatus.Terminated,
        });
    }

    protected offerIsAcceptable(offer: Partial<AuthorizationSpec>, start?: Partial<AuthorizationSpec>) {
        return true; // FIXME Compare offer
    }
}

/**
 * When we are being authorized.
 */
export class AuthorizeeNegotiationStrategy {

    constructor(private sender: ISendMessages<AuthorizationMessage>, private negHook: Hook<AuthorizeNegotiation>) { }

    /** We ask an Authorizer if they can authorize us. */
    public requestToAuthorize(myId: string, authorizerId: string, spec: Partial<AuthorizationSpec>, reference?: string, templateId?: string) {

        const sessionId = uuid();

        // Send authreq to peer
        const msg: MsgRequestAuthorization = {
            type: "RequestAuthorization",
            sessionId: sessionId,
            spec,
        };

        const neg: AuthorizeNegotiation = {
            fromTemplateId: templateId,
            sessionId,
            authorizerId,
            subjectId: myId,
            status: NegStatus.Pending,
            steps: [msg],
            authorizerAccepts: false,
            subjectAccepts: specIsComplete(spec),
        };

        this.sender.send(authorizerId, msg, reference);

        this.negHook.fire(neg);
    }

    public accept(session: AuthorizeNegotiation) {

        if (!specIsComplete(session.conceptSpec)) {
            throw new Error("Protocol Error. We cannot accept an incomplete spec.");
        }

        const message: MsgAcceptAuthorization = { sessionId: session.sessionId, type: "AcceptAuthorization" };

        const newSession: AuthorizeNegotiation = {
            ...session,
            steps: [...session.steps, message], // We add the offer
            subjectAccepts: true,
            authorizerAccepts: true,
            status: NegStatus.Successful, // We accept their offer, so we both agree
        };

        this.sender.send(session.authorizerId, message);
        this.negHook.fire(newSession);
    }

    public reject(session: AuthorizeNegotiation) {
        const message: MsgRejectAuthorization = { sessionId: session.sessionId, type: "RejectAuthorization" };

        const newSession: AuthorizeNegotiation = {
            ...session,
            steps: [...session.steps, message], // We add the offer
            status: NegStatus.Terminated,
        };

        this.sender.send(session.authorizerId, message);
        this.negHook.fire(newSession);
    }

    /** We are to be authorized. */
    public handleOffer(session: AuthorizeNegotiation, message: MsgOfferAuthorization) {
        const offeredSpec = message.spec;

        if (!specIsComplete(offeredSpec)) {
            throw new Error("Protocol Error. You cannot offer an incomplete spec.");
        }

        if (this.offerIsAcceptable(offeredSpec, session.conceptSpec)) {
            const newSession: AuthorizeNegotiation = {
                ...session,
                steps: [...session.steps, message], // We add the offer
                conceptSpec: offeredSpec, // We take the offer as the new status
                subjectAccepts: specIsComplete(offeredSpec),
                authorizerAccepts: true,
                status: specIsComplete(offeredSpec) ? NegStatus.Successful : session.status,
            };

            this.negHook.fire(newSession);
        }

    }

    public handleRequest(session: AuthorizeNegotiation, message: MsgRequestAuthorization) {
        throw new Error("Protocol Error. We should be authorizee");
    }

    public handleAccept(session: AuthorizeNegotiation, message: MsgAcceptAuthorization) {

        if (!specIsComplete(session.conceptSpec)) {
            throw new Error("Protocol Error. We cannot accept an incomplete spec.");
        }

        const newSession: AuthorizeNegotiation = {
            ...session,
            steps: [...session.steps, message], // We add the offer
            authorizerAccepts: true,
            status: session.subjectAccepts ? NegStatus.Successful : session.status,
        };

        this.negHook.fire(newSession);
    }

    public handleReject(session: AuthorizeNegotiation, message: MsgRejectAuthorization) {

        const newSession: AuthorizeNegotiation = {
            ...session,
            steps: [...session.steps, message], // We add the offer
            authorizerAccepts: false,
            status: NegStatus.Terminated,
        };

        this.negHook.fire(newSession);
    }

    protected offerIsAcceptable(offer: Partial<AuthorizationSpec>, start?: Partial<AuthorizationSpec>) {
        return true; // FIXME Compare offer
    }

}
