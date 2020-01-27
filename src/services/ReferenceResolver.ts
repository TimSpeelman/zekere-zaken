import debug from "debug";
import uuid from "uuid/v4";
import { Dict } from "../types/Dict";
import { Timer } from "../util/timer";
import { BroadcastReference, ResolveOptions } from "./identity/IdentityGatewayInterface";
import { Envelope, IHandleMessages, ISendMessages, Msg, MsgResolveReference } from "./identity/messaging/types";

const log = debug('oa:reference-resolver');

/** 
 * Allows us to create a reference to some callback and share the reference
 * with a Peer. When the Peer asks to resolve this reference, we fire the
 * callback and respond to the Peer with a message.
 */
export class ReferenceResolver<ResponseMsg> implements IHandleMessages<MsgResolveReference> {

    private myReferences: Dict<Resolver<ResponseMsg>> = {};
    private sentRequests: Dict<(envelope: Envelope<Msg>) => void> = {};

    public defaultResolveTimeoutInSeconds = 10;

    constructor(
        private sender: ISendMessages<MsgResolveReference>,
        private makeId = uuid) { }

    public registerCallback(callback: Resolver<ResponseMsg>): Reference {
        const id = this.makeId();
        this.myReferences[id] = callback;
        return id;
    }

    /** 
     * The Subject gets a reference via QR or another channel, which decodes to a
     * BroadcastReference. It will try to resolve this by calling the sender. 
     */
    public requestToResolveBroadcast(ref: BroadcastReference, options: ResolveOptions = {}): Promise<Envelope<Msg>> {
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
                reject("Resolve timed out")
            }).start(options.timeout || (this.defaultResolveTimeoutInSeconds * 1000));

            // Set the callback for when we receive the answer.
            this.sentRequests[ref.reference] = (envelope: Envelope<Msg>) => {
                timer.stop();
                resolve(envelope);
            };
        });
    }

    public receive(envelope: Envelope<MsgResolveReference | any>) {
        const { message, senderId, reference } = envelope;

        if (message.type === "ResolveReference") {
            const resolver = this.getReference(message.ref);
            if (resolver) {
                log("sent-reference resolved", message.ref);
                resolver(senderId);
            } else {
                log("warn: this reference does not exist", message.ref);
            }
            return true;

        } else if (!!reference) {
            // Call the callback when a reference is resolved.
            if (reference in this.sentRequests) {
                log("reference resolved", reference);
                this.sentRequests[reference](envelope);

                // We only want a reference to be answered once.
                delete this.sentRequests[reference];

                return false; // Let the message pass.
            } else {
                log("we did not ask to resolve this reference", reference, "dropping message");
                return true; // If the ref is unknown, don't let it pass.
            }
        }

        return false;
    }

    protected getReference(ref: Reference): Resolver<ResponseMsg> | undefined {
        return this.myReferences[ref];
    }

}

type Reference = string;
type Resolver<M> = (peerId: string) => void;
