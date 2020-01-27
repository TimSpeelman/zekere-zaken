import { IDVerifiee } from "../../../src/services/identity/id-layer/IDVerifiee";
import { VerificationTransaction } from "../../../src/services/identity/verification/types";
import { IPv8VerifReq } from "../../../src/shared/Agent";
import { Authority, KVKAuthorityType, LegalEntity } from "../../../src/types/State";
import { describe, expect, it, makeDone } from "../../setup";

describe("IDVerifiee", () => {

    const transactionA = mockVerifTransaction("A");
    const transactionB = mockVerifTransaction("B");
    const incomingRequestA = mockIncomingRequest("A");

    it("accepts a verification that is allowed", (_done) => {
        const done = makeDone(_done, 1);

        const getById = (id: string) => id === "A" ? transactionA : undefined;

        const verifiee = new IDVerifiee(getById);

        verifiee.handleVerificationRequest(incomingRequestA)
            .then((answer) => {
                expect(answer).to.equal(true);
                done();
            }).catch(done);
    });

    it("rejects a verification that is not allowed (by session)", (_done) => {
        const done = makeDone(_done, 1);

        const getById = (id: string) => id === "B" ? transactionB : undefined;
        const verifiee = new IDVerifiee(getById);

        verifiee.handleVerificationRequest(incomingRequestA)
            .then((answer) => {
                expect(answer).to.equal(false);
                done();
            }).catch(done);
    })

    it("rejects a verification when it differs from the allowed", (_done) => {
        const done = makeDone(_done, 1);

        const getById = (id: string) => id === "A" ? transactionB : undefined;
        const verifiee = new IDVerifiee(getById);

        const alteredRequest: IPv8VerifReq =
            { ...incomingRequestA, credentials: [] } // TODO alter

        verifiee.handleVerificationRequest(alteredRequest)
            .then((answer) => {
                expect(answer).to.equal(false);
                done();
            }).catch(done);
    })


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

function mockIncomingRequest(sessionId: string): IPv8VerifReq {
    return {
        credentials: [],
        meta: sessionId,
        verifierId: "VERIF",
    }
}

function mockAuthority(): Authority {
    return { amount: 10, type: KVKAuthorityType.Inkoop };
}

function mockEntity(): LegalEntity {
    return { name: "Janssen", address: "addr", kvknr: "123" };
}
