import debug from "debug";
import uuid from "uuid/v4";
import { Hook } from "../../../util/Hook";
import { Envelope, IHandleMessages, ISendMessages } from "../../messaging/types";
import { BroadcastReference } from "../../references/types";
import { ANeg } from "./AuthorizeNegotiation";
import { AuthorizationMessage, AuthorizationSpec, AuthorizeNegotiation, MsgAcceptAuthorization, MsgOfferAuthorization, MsgRejectAuthorization, MsgRequestAuthorization, specIsComplete } from "./types";

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
        const authorizerId = iAuthorize ? this.myId : peerId;
        const subjectId = iAuthorize ? peerId : this.myId;

        const neg = ANeg.start(subjectId, authorizerId, sessionId, reference).state;

        return neg;
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

        const message: MsgOfferAuthorization = { sessionId: session.id, type: "OfferAuthorization", spec };

        const newSession = new ANeg(session).withOffer(session.authorizerId, spec).state;

        this.sender.send(session.subjectId, message);
        this.negHook.fire(newSession);
    }

    /** When a Subject responds with an offer, we expect it to be complete to start IDAuthorize */
    public handleOffer(session: AuthorizeNegotiation, message: MsgOfferAuthorization) {
        throw new Error("Protocol Error. We should be authorizer");
    }

    /** We are requested to authorize. */
    public handleRequest(session: AuthorizeNegotiation, message: MsgRequestAuthorization) {

        const offeredSpec = message.spec;

        if (this.offerIsAcceptable(offeredSpec, session.conceptSpec)) {

            const newSession = new ANeg(session).withRequest(session.subjectId, offeredSpec).state;
            this.negHook.fire(newSession);
        }
    }

    /** If the Subject accepts, register that. */
    public handleAccept(session: AuthorizeNegotiation, message: MsgAcceptAuthorization) {
        if (!specIsComplete(session.conceptSpec)) {
            throw new Error("Protocol Error. Cannot accept an incomplete spec");
        }

        const newSession = new ANeg(session).withAccept(session.subjectId).state;
        this.negHook.fire(newSession);
    }

    /** If the Subject accepts, register that */
    public handleReject(session: AuthorizeNegotiation, message: MsgRejectAuthorization) {
        const newSession = new ANeg(session).withReject(session.subjectId).state;
        this.negHook.fire(newSession);
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
        const msg: MsgRequestAuthorization = { type: "RequestAuthorization", sessionId: sessionId, spec, };

        const newSession = ANeg.start(myId, authorizerId, sessionId, undefined, templateId).state;

        this.sender.send(authorizerId, msg, reference);

        this.negHook.fire(newSession);
    }

    public accept(session: AuthorizeNegotiation) {

        if (!specIsComplete(session.conceptSpec)) {
            throw new Error("Protocol Error. We cannot accept an incomplete spec.");
        }

        const message: MsgAcceptAuthorization = { sessionId: session.id, type: "AcceptAuthorization" };

        const newSession = new ANeg(session).withAccept(session.subjectId).state;

        this.sender.send(session.authorizerId, message);
        this.negHook.fire(newSession);
    }

    public reject(session: AuthorizeNegotiation) {
        const message: MsgRejectAuthorization = { sessionId: session.id, type: "RejectAuthorization" };

        const newSession = new ANeg(session).withReject(session.subjectId).state;

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

            const newSession_ = new ANeg(session).withOffer(session.authorizerId, offeredSpec);

            // Automatically accept when the spec is complete?
            const newSession = specIsComplete(offeredSpec) ?
                newSession_.withAccept(session.subjectId).state : newSession_.state;

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

        const newSession = new ANeg(session).withAccept(session.authorizerId).state;
        this.negHook.fire(newSession);
    }

    public handleReject(session: AuthorizeNegotiation, message: MsgRejectAuthorization) {

        const newSession = new ANeg(session).withReject(session.authorizerId).state;
        this.negHook.fire(newSession);
    }

    protected offerIsAcceptable(offer: Partial<AuthorizationSpec>, start?: Partial<AuthorizationSpec>) {
        return true; // FIXME Compare offer
    }

}
