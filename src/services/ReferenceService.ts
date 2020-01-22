/**
 * Communication between Wallets may occur through QR encoded messages. As the 
 * space of QR is limited, we'll employ a callback-like system.
 * 
 * 1. Our agent registers a callback function and receives a reference in turn.
 * 2. Via QR (or another channel) our agent sends its `member id` and the reference.
 * 3. The receiving agent calls our callback-resolver endpoint with the reference.
 * 4. Our resolver then invokes the registered callback with the id of the other agent.
 * 
 * We want to limit the availability of these callbacks, so they expire after a
 * certain time. However, due to the round trip latency, we need a delay between
 * updating our reference and deprecating it. In other words, we need two or more
 * references to resolve to the same callback.
 */
import uuid from "uuid/v4";
import { Hook } from "../util/Hook";
import { Interval } from "../util/Interval";

/**
 * A pointer to some value maintained by a Reference Service
 */
export interface Reference { id: string; }

/**
 * With a Reference Service we can 'register' certain values and obtain a 
 * ReferenceHandle for that value. The ReferenceHandle then generates new
 * References at a given interval, which expire after a given time. 
 * 
 * The Service then allows us to resolve a Reference to the registered value,
 * so long as it is not expired.
 * 
 * We use this, for example, for communicating references to callbacks with
 * other Peers via QR or other one-way channels. As the other Peer calls us
 * with such a reference, this service may resolve that to the original 
 * callback function that was registered with it, and execute the corresponding
 * logic.
 */
export interface IReferenceService<T> {

    /** Register a value, receiving an idle Reference Handle */
    register(value: T, options?: Partial<ReferenceOptions>): IReferenceHandle<T>

    /** Resolve a Reference to a value, if it is still valid */
    resolveReference(ref: Reference): IReferenceHandle<T> | undefined
}

/**
 * The Reference Handle contains the pointer to the registered value and 
 * allows us to control and subscribe to its Reference-generation behaviour.
 */
export interface IReferenceHandle<T> {

    /** The registered value */
    value: T

    /** The references that are currently alive */
    references: Reference[]

    /** Subscribe to the event of a new Reference being generated */
    onNewReference(handler: (ref: Reference) => any): void

    /** Subscribe to the event of a Reference expiring (or otherwise invalidating) */
    onInvalidate(handler: (ref: Reference) => any): void

    /** Subscribe to the event of this handle being destroyed */
    onDestroy(handler: () => any): void

    /** Start generating new References */
    refreshAtInterval(millis: number): void

    /** Stop generating new References */
    stopRefreshing(): void

    /** Invalidates all References and stops refreshing */
    destroy(): void

}

export class ReferenceService<T> implements IReferenceService<T> {

    private handles: IReferenceHandle<T>[] = [];

    constructor(private options: ReferenceOptions) { }

    register(value: T, options: Partial<ReferenceOptions> = {}): IReferenceHandle<T> {
        const handle = new ReferenceHandle(value, { ...this.options, ...options });
        this.handles.push(handle);
        handle.onDestroy(() => this.removeHandle(handle));
        return handle;
    }

    resolveReference(ref: Reference) {
        return this.handles.find(h => h.references.find(r => r.id === ref.id));
    }

    protected removeHandle(handle: IReferenceHandle<T>) {
        this.handles = this.handles.filter(h => h !== handle);
    }

}

class ReferenceHandle<T> implements IReferenceHandle<T> {

    public references: Reference[] = [];

    private freshRefHook: Hook<Reference> = new Hook();
    private invalidationHook: Hook<Reference> = new Hook();
    private destroyHook: Hook<void> = new Hook();

    private interval: Interval = new Interval();

    constructor(
        readonly value: T,
        private options: ReferenceOptions,
    ) {
        this.interval.listen(() => this.createNewReference());
    }

    onNewReference(handler: (ref: Reference) => any) {
        return this.freshRefHook.on(handler);
    }

    onInvalidate(handler: (ref: Reference) => any) {
        return this.invalidationHook.on(handler);
    }

    onDestroy(handler: () => any) {
        return this.destroyHook.on(handler);
    }

    refreshAtInterval(millis: number) {
        this.createNewReference();
        this.interval.start(millis);
    }

    stopRefreshing() {
        this.interval.stop();
    }

    destroy() {
        this.stopRefreshing();
        this.references.forEach(r => this.expireReference(r));

        this.destroyHook.fire();
    }

    protected createNewReference() {
        const ref = { id: uuid() };

        this.references.push(ref);

        setTimeout(() => this.expireReference(ref), this.options.millisToExpire);

        this.freshRefHook.fire(ref);
    }

    protected expireReference(ref: Reference) {
        if (this.references.find(r => r === ref)) {
            this.references = this.references.filter(r => r !== ref);

            this.invalidationHook.fire(ref);

            if (this.options.destroyWhenNoReferences && this.references.length === 0) {
                this.destroy();
            }
        }
    }
}

export interface ReferenceOptions {
    millisToExpire: number;
    destroyWhenNoReferences: boolean;
}
