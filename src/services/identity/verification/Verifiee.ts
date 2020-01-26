import debug from "debug";
import { IBeVerified, IPv8VerifReq } from "../../../shared/Agent";
import { Hook } from "../../../util/Hook";
import { IVerifiee, VerificationResult, VerificationTransaction, VerifyResult } from "./types";

const log = debug('oa:verifiee');

/**
 * Handles allowed VerificationTransactions in which we are the Subject. 
 * 
 * It's main function is to check that the Verifier sticks to the agreed
 * upon transaction.
 */
export class Verifiee implements IBeVerified, IVerifiee {

    public allowedTransactions: VerificationTransaction[] = [];
    readonly completedVerifyHook: Hook<VerifyResult> = new Hook();

    public allowToVerify(transaction: VerificationTransaction) {
        this.allowedTransactions.push(transaction);
    }

    /** Returns true to accept the verification, false to reject. */
    public handleVerificationRequest(request: IPv8VerifReq): Promise<boolean> {
        const sessionId = request.meta;
        const allowedTransaction = this.allowedTransactions.find(v => v.sessionId === sessionId);

        if (!allowedTransaction) {
            log(`Incoming IPv8 Request ignored.`);

            this.completedVerifyHook.fire({ sessionId, result: VerificationResult.Cancelled });
            return Promise.resolve(false);

        } else if (!this.verifyMatchesTransaction(request, allowedTransaction)) {
            log(`Incoming IPv8 request did not match the allowed transction. Cheater?`);

            this.completedVerifyHook.fire({ sessionId, result: VerificationResult.Cancelled });
            return Promise.resolve(false);

        } else {
            log('Accepted IPv8 request');

            this.completedVerifyHook.fire({ sessionId, result: VerificationResult.Succeeded });
            return Promise.resolve(true);
        }
    }

    /** Ensure that the request that comes in, actually matches the terms we agreed to. */
    protected verifyMatchesTransaction(request: IPv8VerifReq, allowedTransaction: VerificationTransaction) {
        return true; // FIXME
    }
}
