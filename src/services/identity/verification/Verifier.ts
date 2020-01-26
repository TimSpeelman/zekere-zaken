import { IVerify } from "../../../shared/Agent";
import { Hook } from "../../../util/Hook";
import { IVerifier, VerificationTransaction, VerifyResult } from "./types";


/** 
 * Handles allowed VerificationTransactions in which we are the Verifier. 
 * 
 * It's main function is to translate domain semantics, of authorizations,
 * into the underlying semantics of identity clais and credentials.
 */
export class Verifier implements IVerifier {

    readonly completedVerifyHook: Hook<VerifyResult> = new Hook();

    constructor(private agent: IVerify) { }

    async verify(transaction: VerificationTransaction) {
        const { sessionId, verifierId, subjectId } = transaction;

        const result = await this.agent.verifyPeer(subjectId, {
            credentials: [],
            meta: sessionId,
            verifierId: verifierId,
        });

        this.completedVerifyHook.fire({ sessionId, result });

        return result;
    }
}
