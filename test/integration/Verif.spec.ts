import { AcceptNegWithLegalEntity, CreateVReqTemplate, ResolveReference } from "../../src/commands/Command";
import { VerificationResult } from "../../src/services/identity/verification/types";
import { describe, expect, it, makeDone } from "../setup";
import { createMyAgent, mockAuthority, mockEntity, mockIDPair } from "./mocks";

describe("Verification Integration Test", () => {

    it("my agent connects", (_done) => {
        const done = makeDone(_done, 1);
        const [vAgent, sAgent] = mockIDPair("VERIF", "SUBJ");
        const [verifier] = createMyAgent(vAgent);
        const [subject] = createMyAgent(sAgent);

        verifier.connect().then((me) => {
            expect(me).to.deep.equal({ id: "VERIF" })
            done();
        }).catch(done);
    })

    it("successfully do a verification, if consented", (_done) => {
        const done = makeDone(_done, 2);
        const [vAgent, sAgent] = mockIDPair("VERIF", "SUBJ");
        const [verifier, verifierState] = createMyAgent(vAgent);
        const [subject, subjectState] = createMyAgent(sAgent);

        verifierState.setMyProfile({
            name: "TheVerifier",
            photo: ""
        })

        subjectState.setMyProfile({
            name: "TheSubject",
            photo: ""
        })

        subject.eventHook.on((e) => {
            if (e.type === "RefResolvedToVerify") {
                setTimeout(() => {

                    subject.dispatch(AcceptNegWithLegalEntity({
                        legalEntity,
                        negotiationId: e.negotiationId,
                    }))

                }, 10)
            }
            if (e.type === "IDVerifyCompleted") {
                expect(e.result).to.eq(VerificationResult.Succeeded);
                done();
            }
        })
        verifier.eventHook.on((e) => {
            if (e.type === "IDVerifyCompleted") {
                expect(e.result).to.eq(VerificationResult.Succeeded);
                done();
            }
        });

        const authority = mockAuthority();
        const legalEntity = mockEntity();

        const verifierTemplateId = "template1";

        setTimeout(() => {

            // Verifier creates a template
            verifier.dispatch(CreateVReqTemplate({
                template: {
                    authority,
                    datetime: new Date().toISOString(),
                    id: verifierTemplateId,
                    legalEntity,
                }
            }))

        }, 10);

        // Verifier sends QR to Subject

        setTimeout(() => {

            // Subject requests to resolve this
            subject.dispatch(ResolveReference({
                reference: {
                    reference: verifierTemplateId,
                    senderId: "VERIF",
                }
            }))

        }, 20);

    })

});
