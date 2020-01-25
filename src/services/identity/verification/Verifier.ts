import { Agent } from "../../../shared/Agent";
import { Hook } from "../../../util/Hook";
import { VerificationResult, VerificationTransaction } from "./types";

/** 
 * Handles allowed VerificationTransactions in which we are the Verifier. 
 * 
 * It's main function is to translate domain semantics, of authorizations,
 * into the underlying semantics of identity clais and credentials.
 */
export class Verifier {

    readonly completedVerifyHook: Hook<VerifyResult> = new Hook();

    constructor(private agent: Agent) { }

    async verify(transaction: VerificationTransaction) {
        const { sessionId, verifierId, subjectId } = transaction;
        try {
            const result = await this.agent.verifyPeer(subjectId, {
                credentials: [],
                meta: sessionId,
                verifierId: verifierId,
            });

            this.completedVerifyHook.fire({ sessionId, result });

        } catch (e) {
            console.warn("Verification yielded error", e)
        }
    }
}

interface VerifyResult {
    sessionId: string;
    result: VerificationResult;
}
