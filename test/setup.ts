export { expect } from "chai";
export { describe, it } from "mocha";

/** Wrap mocha's done function to regulate timeouts and number of expected calls */
export const makeDone = (done: (e?: any) => void, numberOfCallsExpected = 1, timeoutInMillis = 500) => {
    let numCalls = 0;
    let timer: any = setTimeout(() => done(new Error(`Timed out. Expected done to be called ${numberOfCallsExpected} times, was called ${numCalls}.`)), timeoutInMillis);

    return (e?: any) => {
        if (!!e) return done(e);

        numCalls++;
        if (numCalls === numberOfCallsExpected) {
            clearTimeout(timer);
            done();
        } else if (numCalls > numberOfCallsExpected) {
            clearTimeout(timer);
            done(new Error(`Too many calls to done, expected ${numberOfCallsExpected}, got ${numCalls}.`));
        }
    }
}

/**
 * For async-test readability, add a few actions to the list and execute them at the end.
 */
export class TestSequence {
    private actions: (() => void)[] = [];

    then(fn: () => void) {
        this.actions.push(fn);
    }

    go() {
        this.actions.forEach(d => d());
    }
}
