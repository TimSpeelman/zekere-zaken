import { Dict } from "../../../types/Dict";
import { Hook } from "../../../util/Hook";
import { Envelope, IReceiveMessages, ISendMessages } from "../messaging/types";
import { IVerifiee, IVerifier, VerificationMessage, VerifyDraft } from "./types";
import { VerifySession } from "./VerifySession";

/** VerifyManager wraps together all verification logic */
export class VerifyManager implements IReceiveMessages<VerificationMessage> {

    public myId = ""; // FIXME

    public newDraftHook: Hook<VerifyDraft> = new Hook();
    public newSessionHook: Hook<VerifySession> = new Hook();

    protected sessions: Dict<Dict<VerifySession>> = {};

    constructor(
        private sender: ISendMessages<VerificationMessage>,
        private verifier: IVerifier,
        private verifiee: IVerifiee) { }

    public getSessionById(peerId: string, id: string) {
        return (this.sessions[peerId] || {})[id];
    }

    public receive(envelope: Envelope<VerificationMessage>): boolean {
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

    public createSession(peerId: string, sessionId: string) {
        const session = new VerifySession(peerId, sessionId, this.sender, this.verifier, this.verifiee);
        this.sessions = {
            ...this.sessions,
            [peerId]: {
                ...this.sessions[peerId],
                [sessionId]: session
            },
        };
        session.myId = this.myId;
        session.newDraftHook.pipe(this.newDraftHook);
        this.newSessionHook.fire(session);
        return session;
    }

    protected getOrCreateSession(peerId: string, sessionId: string) {
        if (!sessionId) return;

        const session = (this.sessions[peerId] || {})[sessionId];

        return !!session ? session : this.createSession(peerId, sessionId);
    }

}
