import { AcceptANegWithLegalEntity, CreateAReqTemplate, ResolveReference } from "../../src/commands/Command";
import { AuthorizeNegotiationResult } from "../../src/services/identity/authorization/types";
import { describe, expect, it, makeDone, TestSequence } from "../setup";
import { createMyAgent, mockAuthority, mockEntity, mockIDPair } from "./mocks";

describe("Authorization Integration Test", () => {

    it("successfully do an authorization, if consented", (_done) => {
        // const done = makeDone(_done, 2, 20000);
        const done = makeDone(_done, 2, 3000);
        const [aAgent, sAgent] = mockIDPair("AUTH", "SUBJ");
        const [authorizer, authorizerState] = createMyAgent(aAgent);
        const [subject, subjectState] = createMyAgent(sAgent);

        const seq = new TestSequence();

        // Both need a profile before interacting.
        authorizerState.setMyProfile({ name: "TheAuthorizer", photo: "" })
        subjectState.setMyProfile({ name: "TheSubject", photo: "" })

        // Subject makes an authorization template
        const authority = mockAuthority();
        const legalEntity = mockEntity();
        const authTemplateId = "authTemplate1";
        seq.then(() => {
            subject.dispatch(CreateAReqTemplate({
                template: {
                    datetime: new Date().toISOString(),
                    id: authTemplateId,
                    authority,
                    legalEntity,
                }
            }))
        }, 10);

        // It sends its QR code to the Subject
        const qr = {
            reference: authTemplateId,
            senderId: "SUBJ",
        };

        // Authorizer requests to resolve this
        seq.then(() => authorizer.dispatch(ResolveReference({ reference: qr })), 10);

        // Upon resolving, the Subject sends its AuthorizeRequest
        // The Authorizer then receives this request and accepts it
        authorizer.eventHook.on((e) => {
            if (e.type === "RefResolvedToAuthorize") {
                authorizer.dispatch(AcceptANegWithLegalEntity({
                    legalEntity,
                    negotiationId: e.negotiationId,
                }))
            }
        })

        // We now expect both to receive a completed issuing
        // subject.commandHook.on((e) => {
        //     if (e.type === "InvokeIDAuthorize") {
        //         done();
        //     }
        // });
        subject.eventHook.on((e) => {
            if (e.type === "IDIssuingCompleted") {
                expect(e.result).to.eq(AuthorizeNegotiationResult.Succeeded);
                done();
            }
        });

        authorizer.eventHook.on((e) => {

            if (e.type === "IDIssuingCompleted") {
                expect(e.result).to.eq(AuthorizeNegotiationResult.Succeeded);
                done();
            }
        });

        seq.go();

    })

});
