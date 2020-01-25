import { Agent, IPv8VerifReq } from "../../../shared/Agent";
import { Hook } from "../../../util/Hook";
import { VerificationResult, VerificationTransaction } from "./types";

/**
 * Handles allowed VerificationTransactions in which we are the Subject. 
 * 
 * It's main function is to check that the Verifier sticks to the agreed
 * upon transaction.
 */
export class Verifiee {

    public allowedTransactions: VerificationTransaction[] = [];
    readonly completedVerifyHook: Hook<VerifyResult> = new Hook();

    constructor(private agent: Agent) {
        this.listenToAgent();
    }

    public allowToVerify(transaction: VerificationTransaction) {
        this.allowedTransactions.push(transaction);
    }

    protected listenToAgent() {
        this.agent.setVerificationRequestHandler((r) => this.handleVerificationRequest(r));
    }

    /** Returns true to accept the verification, false to reject. */
    protected handleVerificationRequest(request: IPv8VerifReq): Promise<boolean> {
        const sessionId = request.meta;
        const allowedTransaction = this.allowedTransactions.find(v => v.sessionId === sessionId);

        if (!allowedTransaction) {
            console.warn(`Incoming IPv8 Request ignored.`);

            this.completedVerifyHook.fire({ sessionId, result: VerificationResult.Cancelled });
            return Promise.resolve(false);

        } else if (!this.verifyMatchesTransaction(request, allowedTransaction)) {
            console.warn(`Incoming IPv8 request did not match the allowed transction. Cheater?`);

            this.completedVerifyHook.fire({ sessionId, result: VerificationResult.Cancelled });
            return Promise.resolve(false);

        } else {

            this.completedVerifyHook.fire({ sessionId, result: VerificationResult.Succeeded });
            return Promise.resolve(true);
        }
    }

    /** Ensure that the request that comes in, actually matches the terms we agreed to. */
    protected verifyMatchesTransaction(request: IPv8VerifReq, allowedTransaction: VerificationTransaction) {
        return true; // FIXME
    }
}

interface VerifyResult {
    sessionId: string;
    result: VerificationResult;
}
