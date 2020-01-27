import debug from "debug";
import { CommandChain } from "../../util/CommandChain";
import { Envelope, IHandleMessages, MsgResolveReference } from "../messaging/types";

const log = debug('oa:reference-server');

/**
 * Dispatches a ResolveReference request to one of the Handlers that registered
 * with this class. This decouples the reference exchange functionality from the
 * actions that are invoked by it.
 * 
 * Any service that can be triggered by a reference should register a handler
 * with this class.
 * 
 * Note that this class does not keep track of issued references, so it can
 * remain stateless. Some references may need to be persisted (such as those
 * for authorization requests).
 */
export class ReferenceServer implements IHandleMessages<MsgResolveReference> {

    private chain = new CommandChain<ResolveReq>();

    /** A list of handlers that will try to handle the incoming resolve request. */
    handlers: RefHandler[] = [];

    public addHandler(handler: RefHandler | RefHandler[]) {
        this.chain.addHandler(handler);
    }

    public receive(envelope: Envelope<MsgResolveReference>): boolean {
        const { message, senderId } = envelope;

        if (message.type === "ResolveReference") {
            const success = this.chain.fire({ reference: message.ref, requesterId: senderId });

            log(success ? `resolved reference '${message.ref}'` :
                `could not resolve reference '${message.ref}'`)

            return true;
        }

        return false; // Always let the message pass.
    }

}

/** This handler is fired when a Peer requests to resolve a reference we have sent out. */
export type RefHandler = (params: ResolveReq) => boolean;

export interface ResolveReq {
    reference: string;
    requesterId: string;
};
