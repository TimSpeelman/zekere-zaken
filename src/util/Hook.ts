import debug from "debug";

type Listener<T> = (arg: T) => any;
type Unsubscribe = () => void;


export class Hook<T> {
    private listeners: Array<Listener<T>> = [];
    private log: (...args: any[]) => void;

    constructor(name?: string, private async = false) {
        this.log = !!name ? debug(`oa:hook:${name}`) : debug(`oa:hook:<unnamed>`)
    }

    public fire(arg: T): void {
        if (this.async) {
            setTimeout(() => this._fire(arg), 0);
        } else {
            this._fire(arg);
        }
    }

    protected _fire(arg: T): void {
        this.listeners.forEach((l) => l(arg));
    }

    public on(listener: Listener<T>): Unsubscribe {
        this.log('register', listener);
        this.listeners.push(listener);
        return () => this.unsubscribe(listener);
    }

    /** Pipe the data to another hook */
    public pipe(hook: Hook<T>): Unsubscribe {
        this.log('pipe', hook);
        const listener = (arg: T) => hook.fire(arg);
        return this.on(listener);
    }

    private unsubscribe(listener: Listener<T>): void {
        this.log('unsubscribe', listener);
        this.listeners = this.listeners.filter((l) => l !== listener);
    }
}
