import { VerifyNegotiationResult } from "../../src/services/identity/verification/types";
import { describe, expect, it, timeoutDone } from "../setup";
import { mockIDPair } from "./mocks";

describe("IDAgentMock Integration Test", () => {

    it("ID agents can send messages", (_done) => {
        const done = timeoutDone(_done);
        const [vAgent, sAgent] = mockIDPair("VERIF", "SUBJ");

        sAgent.setIncomingMessageHandler((senderId, message) => {
            expect(senderId).to.eq("VERIF");
            expect(message).to.eq("hello my friend");
            done();
        });

        vAgent.sendMessage("SUBJ", "hello my friend");
    });

    it("ID agents can accept verification", (_done) => {
        const done = timeoutDone(_done);
        const [vAgent, sAgent] = mockIDPair("VERIF", "SUBJ");

        // Subject always ACCEPTS
        sAgent.setVerificationRequestHandler((r) => Promise.resolve(true));

        vAgent.verifyPeer("SUBJ", {
            credentials: [],
            meta: "",
            verifierId: "VERIF" // WHY?
        }).then((res) => {
            expect(res).to.equal(VerifyNegotiationResult.Succeeded);
            done();
        }).catch(done);
    });

    it("ID agents can reject verification", (_done) => {
        const done = timeoutDone(_done);
        const [vAgent, sAgent] = mockIDPair("VERIF", "SUBJ");

        // Subject always REJECTS
        sAgent.setVerificationRequestHandler((r) => Promise.resolve(false));

        vAgent.verifyPeer("SUBJ", {
            credentials: [],
            meta: "",
            verifierId: "VERIF" // WHY?
        }).then((res) => {
            expect(res).to.equal(VerifyNegotiationResult.Cancelled);
            done();
        }).catch(done);
    });


});
