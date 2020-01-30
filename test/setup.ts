export { expect } from "chai";
export { describe, it } from "mocha";

/** Wrap mocha's done function to regulate timeouts and number of expected calls */
export const timeoutDone = (done: (e?: any) => void, numberOfCallsExpected = 1, timeoutInMillis = 500) => {
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

/** Wrap mocha's done function to regulate timeouts and number of expected calls */
export const multiDone = (done: (e?: any) => void, labels: string[], timeoutInMillis = 500) => {
    let called: string[] = [];

    const timeoutErr = () => new Error(`Timed out. Missed done calls for labels ` + labels.filter((l) => !called.find(c => c === l)).map(l => `'${l}'`).join(", "));
    let timer: any = setTimeout(() => done(timeoutErr()), timeoutInMillis);

    const err = (e?: any) => done(new Error(e));
    const dones = labels.map(label => {
        return (e?: any) => {
            if (!!e) return done(e);

            if (called.find(c => c === label)) {
                clearTimeout(timer);
                done(new Error(`Done already called for label '${label}'.`));
            } else {
                called.push(label);

                if (called.length === labels.length) {
                    done();
                }
            }
        }
    })

    return [err, ...dones];
}

/**
 * For async-test readability, add a few actions to the list and execute them at the end.
 */
export class TestSequence {
    private actions: Entry[] = [];

    then(action: () => void, msWait = -1) {
        this.actions.push({ action, msWait });
    }

    go() {
        this.next();
    }

    protected next() {
        if (this.actions.length === 0) return;
        const a = this.actions.shift();
        if (a!.msWait >= 0) {
            setTimeout(() => {
                a!.action();
                this.next();
            }, a!.msWait);
        } else {
            a!.action();
        }
    }
}

interface Entry {
    msWait: number,
    action: () => void,
}

export const maxCalls = (max: number) => {
    let calls = 0;
    return () => {
        if (calls++ >= max) {
            throw new Error("Max calls reached");
        }
    }
}