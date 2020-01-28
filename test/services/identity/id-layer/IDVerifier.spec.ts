import { IVerify } from "../../../../src/services/identity/id-layer/Agent";
import { IDVerifier } from "../../../../src/services/identity/id-layer/IDVerifier";
import { VerificationTransaction, VerifyNegotiationResult } from "../../../../src/services/identity/verification/types";
import { Authority, KVKAuthorityType, LegalEntity } from "../../../../src/types/State";
import { describe, expect, it, makeDone } from "../../../setup";

describe("IDVerifier", () => {

    const transactionA = mockVerifTransaction("A");

    it("triggers a proper verify", (_done) => {
        const done = makeDone(_done, 1);

        // Test how the Verifier calls the underlying ID layer.
        const mockVerifier: IVerify = {
            verifyPeer: (peerId: string, req: any): Promise<VerifyNegotiationResult> => {
                expect(peerId).to.equal(transactionA.subjectId);
                expect(req.credentials).to.deep.equal([]);
                expect(req.meta).to.equal(transactionA.sessionId);
                expect(req.verifierId).to.equal(transactionA.verifierId);
                done();
                return Promise.resolve(VerifyNegotiationResult.Succeeded);
            }
        }

        const verifier = new IDVerifier(mockVerifier);

        verifier.verify(transactionA).catch(done);
    });

});

function mockVerifTransaction(sessionId: string): VerificationTransaction {
    return {
        // iVerify: true, // FIXME
        sessionId,
        spec: {
            authority: mockAuthority(),
            legalEntity: mockEntity(),
        },
        subjectId: "SUBJ",
        verifierId: "VERIF",
    }
}

function mockAuthority(): Authority {
    return { amount: 10, type: KVKAuthorityType.Inkoop };
}

function mockEntity(): LegalEntity {
    return { name: "Janssen", address: "addr", kvknr: "123" };
}
