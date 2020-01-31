import debug from "debug";
import { Hook } from "../../../util/Hook";
import { AuthorizationTransaction, IDAuthorizeResult } from "../authorization/types";
import { IIssue } from "./Agent";

const log = debug('oa:issuee');

/** 
 * The IDIssuee translates domain-level semantics to the underlying IDCredentials
 * and then triggers an IDVerifyRequest.
 * 
 * When it completes (succeeds, rejects or fails) an IDVerify, it fires its hook.
 */
export class IDIssuee {

    readonly completedIssueHook: Hook<IDAuthorizeResult> = new Hook('id-issuee:completed-verify');

    constructor(private agent: IIssue) { }

    /** Start an IDVerify procedure from a transaction */
    async requestIssuing(transaction: AuthorizationTransaction) {
        const { sessionId, authorizerId, subjectId } = transaction;

        log("authorizing session", sessionId);

        const result = await this.agent.requestIssue(authorizerId, {
            credentials: this.translateToIDCredentials(transaction),
            meta: sessionId,
            issuerId: authorizerId,
        });

        log("session", sessionId, "verified with result", result);

        this.completedIssueHook.fire({ sessionId, result });

        return result;
    }

    protected translateToIDCredentials(transaction: AuthorizationTransaction) {
        return []; // TODO
    }
}
