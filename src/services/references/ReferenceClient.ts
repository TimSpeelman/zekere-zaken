import debug from "debug";
import { Dict } from "../../types/Dict";
import { Timer } from "../../util/timer";
import { Envelope, IHandleMessages, ISendMessages, MsgResolveReference } from "../messaging/types";
import { BroadcastReference, ResolveOptions } from "../references/types";

const log = debug('oa:reference-client');

/** 
 * Request a Peer to resolve a reference, but time out if the Peer does not respond
 * quickly. Filter out any incoming message that carries a reference we did not ask
 * for.
 */
export class ReferenceClient<M> implements IHandleMessages<M> {

    public defaultResolveTimeoutInSeconds = 10;

    private sentRequests: Dict<ResolvedHandler<M>> = {};

    constructor(private sender: ISendMessages<MsgResolveReference>) { }

    public receive(envelope: Envelope<M>) {
        const { reference } = envelope;

        if (!reference) return false; // Ignore messages without 'reference'

        const handle = this.getReferenceHandler(reference);

        if (!handle) {
            log("we did not ask to resolve this reference", reference, "dropping message");
            return true; // Drop messages with unknown reference.
        } else {
            handle(envelope);
            delete this.sentRequests[reference];
            return false; // Fire handler but also let the message pass
        }
    }

    /** 
     * The Subject gets a reference via QR or another channel, which decodes to a
     * BroadcastReference. It will try to resolve this by calling the sender. 
     */
    public requestToResolveBroadcast(ref: BroadcastReference, options: ResolveOptions = {}): Promise<Envelope<M>> {
        log('trying to resolve', ref);

        return new Promise((resolve, reject) => {

            // Ask the peer to resolve the reference
            this.sender.send<MsgResolveReference>(ref.senderId, {
                type: "ResolveReference",
                ref: ref.reference,
            });

            // Reject if the result does not come back in time
            const timer = new Timer(() => {
                delete this.sentRequests[ref.reference];
                log("ResolveRequest timed out", ref);
                reject(`ResolveRequest timed out`);
            }).start(options.timeout || (this.defaultResolveTimeoutInSeconds * 1000));

            // Set the callback for when we receive the answer.
            this.sentRequests[ref.reference] = (envelope: Envelope<M>) => {
                log("ResolveRequest succeeded", ref);
                timer.stop();
                resolve(envelope);
            };
        });
    }

    protected getReferenceHandler(referenceId: string): ResolvedHandler<M> | undefined {
        return this.sentRequests[referenceId];
    }
}

export type ResolvedHandler<M> = (envelope: Envelope<M>) => void;
