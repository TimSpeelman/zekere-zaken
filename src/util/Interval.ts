import { Hook } from "./Hook";

export class Interval {

    private hook: Hook<number> = new Hook();
    private index = 0;
    private intervalHandle: any = null;

    listen(handler: (index: number) => any) {
        this.hook.on(handler);
    }

    start(ms: number) {
        this.intervalHandle = setInterval(() => this.hook.fire(this.index++), ms);
    }

    stop() {
        clearInterval(this.intervalHandle);
    }
}
