import debug from "debug";
import uuid from "uuid/v4";
import { arr } from "../../util/arr";
import { CommandChain } from "../../util/CommandChain";
import { Agent, Me } from "../identity/id-layer/Agent";
import { Envelope, IHandleMessages, ISendMessages } from "./types";

const log = debug('oa:messaging');

/**
 * Ensure that domain messages are sent to and received from peers.
 * 
 * A list of handlers try to handle an incoming message. When a handler rejects
 * a message, the Messenger tries the next handler and so on, until a handler
 * accepts the message or no handler is left.
 */
export class Messenger<M> implements ISendMessages<M> {

    chain = new CommandChain<Envelope<M>>('messages');

    me?: Me;

    constructor(private agent: Agent) {
        this.listenToAgent();
    }

    /** Let the agent connect, then store Me */
    public connect() {
        return this.agent.connect().then((me) => { this.me = me; });
    }

    public addHandler(handler: MessageHandler<M> | MessageHandler<M>[]) {
        this.chain.addHandler(handler);
    }

    public addRecipient(recipient: IHandleMessages<M> | IHandleMessages<M>[]) {
        arr(recipient).forEach(r => this.addHandler(r.receive.bind(r)));
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

    protected handleIncomingMessage(senderId: string, encodedEnvelope: string) {
        const envelope = this.decodeEnvelope(encodedEnvelope)
        log("received message ", envelope);

        if (envelope) {
            this.dispatchEnvelope(envelope);
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

    protected dispatchEnvelope(envelope: Envelope<M>) {
        if (this.chain.fire(envelope) === false) {
            log("ignored message", envelope);
        }
    }

    protected listenToAgent() {
        this.agent.setIncomingMessageHandler(
            (senderId, message) => this.handleIncomingMessage(senderId, message));
    }
}

export type MessageHandler<M> = (msg: Envelope<M>) => boolean;
