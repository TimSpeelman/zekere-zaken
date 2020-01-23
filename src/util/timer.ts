import { Hook } from "./Hook";

export class Timer {

    private hook: Hook<void> = new Hook();
    private index = 0;
    private timerHandle: any = null;

    constructor(handler?: () => any, ms?: number) {
        if (handler) {
            this.listen(handler);
        }
        if (ms) {
            this.start(ms);
        }
    }

    listen(handler: () => any) {
        this.hook.on(handler);
        return this;
    }

    start(ms: number) {
        this.timerHandle = setTimeout(() => this.hook.fire(), ms);
        return this;
    }

    stop() {
        clearInterval(this.timerHandle);
        return this;
    }

    promise() {
        return !this.timerHandle
            ? Promise.resolve()
            : new Promise((resolve) => { this.hook.on(resolve); });
    }
}
