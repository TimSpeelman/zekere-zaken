import { AcceptVNegWithLegalEntity, CreateVReqTemplate, ResolveReference } from "../../src/commands/Command";
import { VerifyNegotiationResult } from "../../src/services/identity/verification/types";
import { describe, expect, it, multiDone, TestSequence, timeoutDone } from "../setup";
import { createMyAgent, mockAuthority, mockEntity, mockIDPair } from "./mocks";

describe("Verification Integration Test", () => {

    it("my agent connects", (_done) => {
        const done = timeoutDone(_done);
        const [vAgent, sAgent] = mockIDPair("VERIF", "SUBJ");
        const [verifier] = createMyAgent(vAgent);
        const [subject] = createMyAgent(sAgent);

        verifier.connect().then((me) => {
            expect(me).to.deep.equal({ id: "VERIF" })
            done();
        }).catch(done);
    })

    it("successfully do a verification, if consented", (_done) => {
        const [err, doneVerif, doneSub] = multiDone(_done, ["verif", "sub"], 3000);
        const [vAgent, sAgent] = mockIDPair("VERIF", "SUBJ");
        const [verifier, verifierState] = createMyAgent(vAgent);
        const [subject, subjectState] = createMyAgent(sAgent);

        const seq = new TestSequence();

        // Both need a profile before interacting.
        verifierState.setMyProfile({ name: "TheVerifier", photo: "" })
        subjectState.setMyProfile({ name: "TheSubject", photo: "" })

        // Verifier first makes a Verification Template
        const authority = mockAuthority();
        const legalEntity = mockEntity();
        const verifierTemplateId = "template1";
        seq.then(() => verifier.dispatch(CreateVReqTemplate({
            template: {
                authority,
                datetime: new Date().toISOString(),
                id: verifierTemplateId,
                legalEntity,
            }
        })), 10);

        // It sends its QR code to the Verifier
        const qr = {
            reference: verifierTemplateId,
            senderId: "VERIF",
        };

        // Subject requests to resolve this
        seq.then(() => subject.dispatch(ResolveReference({ reference: qr })), 10);

        // Upon resolving, the Verifier sends its VerifyRequest
        // The Subject then receives this request and accepts it
        subject.eventHook.on((e) => {
            if (e.type === "RefResolvedToVerify") {
                subject.dispatch(AcceptVNegWithLegalEntity({
                    legalEntity,
                    negotiationId: e.negotiationId,
                }))
            }
        })

        // We now expect both to receive a completed verification
        subject.eventHook.on((e) => {
            if (e.type === "IDVerifyCompleted") {
                expect(e.result).to.eq(VerifyNegotiationResult.Succeeded);
                doneSub();
            }
        });

        verifier.eventHook.on((e) => {
            if (e.type === "IDVerifyCompleted") {
                expect(e.result).to.eq(VerifyNegotiationResult.Succeeded);
                doneVerif();
            }
        });

        seq.go();
    })

});
