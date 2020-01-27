import debug from "debug";
import { IVerify } from "../../../shared/Agent";
import { Hook } from "../../../util/Hook";
import { IVerifier, VerificationTransaction, VerifyResult } from "../verification/types";

const log = debug('oa:verifiee');

/** 
 * The IDVerifier translates domain-level semantics to the underlying IDCredentials
 * and then triggers an IDVerifyRequest.
 * 
 * When it completes (succeeds, rejects or fails) an IDVerify, it fires its hook.
 */
export class IDVerifier implements IVerifier {

    readonly completedVerifyHook: Hook<VerifyResult> = new Hook('id-verifier:completed-verify');

    constructor(private agent: IVerify) { }

    /** Start an IDVerify procedure from a transaction */
    async verify(transaction: VerificationTransaction) {
        const { sessionId, verifierId, subjectId } = transaction;

        log("verifying session", sessionId);

        const result = await this.agent.verifyPeer(subjectId, {
            credentials: this.translateToIDCredentials(transaction),
            meta: sessionId,
            verifierId: verifierId,
        });

        log("session", sessionId, "verified with result", result);

        this.completedVerifyHook.fire({ sessionId, result });

        return result;
    }

    protected translateToIDCredentials(transaction: VerificationTransaction) {
        return []; // TODO
    }
}
