import debug from "debug";
import uuid from "uuid/v4";
import { Agent, Me } from "../../../shared/Agent";
import { arr } from "../../../util/arr";
import { fallback1 } from "../../../util/fallbackFn";
import { Envelope, IReceiveMessages, ISendMessages } from "./types";

const log = debug('oa:messaging');

/**
 * Ensure that domain messages are sent to and received from peers.
 * 
 * A list of handlers try to handle an incoming message. When a handler rejects
 * a message, the Messenger tries the next handler and so on, until a handler
 * accepts the message or no handler is left.
 */
export class Messenger<M> implements ISendMessages<M> {

    /** A list of handlers that will try to handle the incoming message. */
    handlers: MessageHandler<M>[] = [];

    me?: Me;

    constructor(private agent: Agent) {
        this.listenToAgent();
    }

    /** Let the agent connect, then store Me */
    public connect() {
        return this.agent.connect().then((me) => { this.me = me; });
    }

    public addHandler(handler: MessageHandler<M> | MessageHandler<M>[]) {
        const handlers = arr(handler);
        handlers.forEach(h => this.handlers.push(h));
    }

    public addRecipient(recipient: IReceiveMessages<M> | IReceiveMessages<M>[]) {
        const recipients = arr(recipient);
        recipients.forEach(h => this.handlers.push(h.receive.bind(h)));
        return this;
    }

    /** Encodes (and signs?) messages for sending to a peer. */
    public send<T extends M>(peerId: string, message: T, reference?: string): Promise<void> {
        const envelope: Envelope<M> = {
            messageId: uuid(),
            message,
            senderId: this.me!.id,
            reference,
        }

        log("sending to peer", peerId, ":", envelope);

        const encodedMessage = JSON.stringify(envelope);

        return this.agent.sendMessage(peerId, encodedMessage);
    }

    /** Decodes and dispatches received messages. */
    protected handleIncomingMessage(senderId: string, encodedEnvelope: string) {
        const envelope = this.decodeEnvelope(encodedEnvelope)

        log("received message ", envelope);

        if (envelope) {
            // A fallback allows us to see when all handlers have ignored the message
            const tryToHandle = fallback1(this.handlers, false);

            if (tryToHandle(envelope) === false) {
                log("ignored message ", envelope);
            } else {
            }
        }
    }

    protected decodeEnvelope(encodedEnvelope: string): Envelope<M> | undefined {
        try {
            const decodedEnvelope = JSON.parse(encodedEnvelope);
            return decodedEnvelope;
        } catch (e) {
            log("could not decode message", encodedEnvelope);
            return;
        }
    }

    protected assertConnected() {
        if (!this.me) {
            throw new Error("Not connected to agent yet!");
        }
    }

    protected listenToAgent() {
        this.agent.setIncomingMessageHandler(
            (senderId, message) => this.handleIncomingMessage(senderId, message));
    }
}

export type MessageHandler<M> = (msg: Envelope<M>) => boolean;
