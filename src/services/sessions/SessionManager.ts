import { Dict } from "../../types/Dict";
import { arr } from "../../util/arr";
import { fallback1 } from "../../util/fallbackFn";
import { Hook } from "../../util/Hook";
import { Messenger } from "../messaging/Messenger";
import { Envelope } from "../messaging/types";
import { ISession } from "./ISession";

/** Connect messages to sessions that they belong to */
export abstract class SessionManager<M extends HasSessionId> {

    public newSessionHook: Hook<ISession<M>> = new Hook('session-manager:new');

    /** We will scope sessions by peer id and session id to avoid conflicts */
    protected sessions: Dict<Dict<ISession<M>>> = {};


    constructor(protected messenger: Messenger<M | any>) {
        this.listenToIncomingMessages();
    }

    public addSession(session: ISession<M>) {
        if (!this.sessions[session.peerId]) {
            this.sessions[session.peerId] = {};
        }

        this.sessions[session.peerId][session.id] = session;
    }

    public getSessionById(peerId: string, id: string) {
        const peerSessions = this.sessions[peerId];
        return peerSessions && peerSessions[id];
    }

    protected listenToIncomingMessages() {
        this.messenger.addHandler((envelope) => this.handleIncomingMessage(envelope));
    }

    protected handleIncomingMessage(envelope: Envelope<M | any>): boolean {
        const { message, senderId } = envelope;

        if ("sessionId" in message) {
            const session = this.getSessionById(senderId, message.sessionId);

            if (session) {
                session.receive(envelope);
            } else {
                const newSession = this.handleNonExistentSession(envelope);

                if (newSession) {
                    this.newSessionHook.fire(newSession);
                }
            }
            return true;
        }

        return false;
    }

    protected abstract handleNonExistentSession(envelope: Envelope<M>): ISession<M> | false;

}


export type SessionFactory<M> = (envelope: Envelope<M>) => ISession<M> | false;

/** This session manager allows us to create sessions using factory functions */
export class SessionManagerByFactory<M extends HasSessionId> extends SessionManager<M> {

    protected factories: SessionFactory<M>[] = [];

    constructor(protected messenger: Messenger<M | any>) {
        super(messenger);
    }

    public addFactory(factory: SessionFactory<M> | SessionFactory<M>[]) {
        const factories = arr(factory);
        factories.forEach(h => this.factories.push(h));
    }

    protected handleNonExistentSession(envelope: Envelope<M>): ISession<M> | false {
        const tryFactory = fallback1(this.factories, false);
        return tryFactory(envelope);
    }
}

interface HasSessionId {
    sessionId: string;
}
