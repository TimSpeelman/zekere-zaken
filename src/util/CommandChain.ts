import debug from "debug";
import { arr } from "./arr";

type Handler<T, R> = (arg: T) => R;

/**
 * A CommandChain applies the Chain-of-Responsibility pattern. It takes a list of
 * Handlers. When it is fired, one by one each Handler receives the argument until
 * one of them returns truthily. If no handlers do so, we return false.
 */
export class CommandChain<T, R = boolean> {
    private handlers: Array<Handler<T, R>> = [];
    private log: (...args: any[]) => void;

    constructor(name?: string) {
        this.log = !!name ? debug(`oa:command-chain:${name}`) : debug(`oa:command-chain:<unnamed>`)
    }

    public fire(arg: T): R | false {
        for (let fn of this.handlers) {
            const result = fn(arg);
            if (!!result) {
                return result;
            }
        }
        return false;
    }

    public addHandler(handler: Handler<T, R> | Handler<T, R>[]): this {
        const handlers = arr(handler);
        this.log('register', handlers);
        this.handlers = [...this.handlers, ...handlers];
        return this;
    }

}
