import debug from "debug";
import { IBeVerified as IHandleIDVerifyRequests, IPv8VerifReq } from "../../../shared/Agent";
import { Hook } from "../../../util/Hook";
import { IDVerifyResult, VerificationTransaction, VerifyNegotiationResult } from "../verification/types";

const log = debug('oa:verifiee');

/**
 * The Verifiee accepts or rejects incoming IDVerifyRequests. Each request comes in with
 * a SessionId passed in the metadata. When this session is known and accepted, the Verifiee
 * will check if the mapping to IDVerifyRequest was done correctly, i.e. the Verifier is 
 * not cheating.
 * 
 * We pass in a selector function for finding accepted transactions (this allows the Verifiee
 * to remain stateless).
 * 
 * When it completes (succeeds, rejects or fails) an IDVerify, it fires its hook.
 */
export class IDVerifiee implements IHandleIDVerifyRequests {

    readonly completedVerifyHook: Hook<IDVerifyResult> = new Hook('id-verifiee:completed-verify');

    /**
     * Create a Verifiee
     * @param getTransactionById - 
     */
    constructor(private getTransactionById: (id: string) => VerificationTransaction | undefined) { }

    /** Returns true to accept the verification, false to reject. */
    public handleVerificationRequest(request: IPv8VerifReq): Promise<boolean> {
        const sessionId = request.meta;
        const allowedTransaction = this.getTransactionById(sessionId);

        if (!allowedTransaction) {
            log(`Incoming IPv8 Request ignored.`);

            this.completedVerifyHook.fire({ sessionId, result: VerifyNegotiationResult.Cancelled });
            return Promise.resolve(false);

        } else if (!this.verifyMatchesTransaction(request, allowedTransaction)) {
            log(`Incoming IPv8 request did not match the allowed transction. Cheater?`);

            this.completedVerifyHook.fire({ sessionId, result: VerifyNegotiationResult.Cancelled });
            return Promise.resolve(false);

        } else {
            log('Accepted IPv8 request');

            this.completedVerifyHook.fire({ sessionId, result: VerifyNegotiationResult.Succeeded });
            return Promise.resolve(true);
        }
    }

    /** Ensure that the request that comes in, actually matches the terms we agreed to. */
    protected verifyMatchesTransaction(request: IPv8VerifReq, allowedTransaction: VerificationTransaction) {
        return true; // FIXME
    }
}
