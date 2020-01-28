import debug from "debug";
import { Hook } from "../../../util/Hook";
import { AuthorizationTransaction, AuthorizeNegotiationResult, IDAuthorizeResult } from "../authorization/types";
import { IPv8IssueReq } from "../id-layer/Agent";

const log = debug('oa:Issuee');

/**
 * The Issuer accepts or rejects incoming IDIssueRequests. Each request comes in with
 * a SessionId passed in the metadata. When this session is known and accepted, the Issuee
 * will check if the mapping to IDVerifyRequest was done correctly, i.e. the Verifier is 
 * not cheating.
 * 
 * We pass in a selector function for finding accepted transactions (this allows the Issuee
 * to remain stateless).
 * 
 * When it completes (succeeds, rejects or fails) an IDVerify, it fires its hook.
 */
export class IDIssuer {

    readonly completedIssueHook: Hook<IDAuthorizeResult> = new Hook('id-issuer:completed-verify');

    /**
     * Create a Issuee
     * @param getTransactionById - 
     */
    constructor(private getTransactionById: (id: string) => AuthorizationTransaction | undefined) { }

    public handleIssueRequest(request: IPv8IssueReq): Promise<boolean> {
        const sessionId = request.meta;
        const allowedTransaction = this.getTransactionById(sessionId);

        if (!allowedTransaction) {
            log(`Incoming IPv8 Request ignored.`);

            this.completedIssueHook.fire({ sessionId, result: AuthorizeNegotiationResult.Cancelled });
            return Promise.resolve(false);

        } else if (!this.verifyMatchesTransaction(request, allowedTransaction)) {
            log(`Incoming IPv8 request did not match the allowed transction. Cheater?`);

            this.completedIssueHook.fire({ sessionId, result: AuthorizeNegotiationResult.Cancelled });
            return Promise.resolve(false);

        } else {
            log('Accepted IPv8 request');

            this.completedIssueHook.fire({ sessionId, result: AuthorizeNegotiationResult.Succeeded });
            return Promise.resolve(true);
        }
    }

    /** Ensure that the request that comes in, actually matches the terms we agreed to. */
    protected verifyMatchesTransaction(request: IPv8IssueReq, allowedTransaction: AuthorizationTransaction) {
        return true; // FIXME
    }
}
