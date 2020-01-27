import { IVerifiee, IVerifier, MsgOfferVerification, VerificationMessage, VerificationResult } from "../../../src/services/identity/verification/types";
import { VerifyManager } from "../../../src/services/identity/verification/VerifyManager";
import { Envelope, ISendMessages } from "../../../src/services/messaging/types";
import { Authority, KVKAuthorityType, LegalEntity } from "../../../src/types/State";
import { describe, expect, it, makeDone } from "../../setup";

describe("VerifyManager", () => {

    it("creates a new session, when a peer sends an offer with an unknown session ID", (_done) => {
        const done = makeDone(_done, 2);

        const manager = mockVerifyManager();
        manager.myId = "SUBJ";

        // We expect the session hook to fire TWICE
        manager.newSessionHook.on((session) => {
            expect(session.subjectId).to.equal("SUBJ");
            expect(session.verifierId).to.equal("VERIF");
            done();
        })

        // ACT
        manager.receive(mockMessageOffer("sess1"));
        manager.receive(mockMessageOffer("sess2"));
    });

    it("re-uses a session, when a peer sends a second offer", (_done) => {
        const done = makeDone(_done, 1);

        const manager = mockVerifyManager();
        manager.myId = "SUBJ";

        // So expect the session hook to fire ONCE
        manager.newSessionHook.on((session) => {
            expect(session.subjectId).to.equal("SUBJ");
            expect(session.verifierId).to.equal("VERIF");
            done();
        })

        // ACT
        manager.receive(mockMessageOffer("sess1"));
        manager.receive(mockMessageOffer("sess1"));
    });

    it("creates a new session", () => {
        const manager = mockVerifyManager();
        manager.myId = "VERIF";

        const session = manager.createSession("SUBJ", "sess1");
        session.iVerify = true;

        expect(session.id).to.equal("sess1");
        expect(session.verifierId).to.equal("VERIF");
        expect(session.subjectId).to.equal("SUBJ");
    });

});

function mockVerifyManager() {
    const sender: ISendMessages<VerificationMessage> = {
        send(peerId: string, msg: VerificationMessage, ref: string) {
            return Promise.resolve();
        }
    }

    const verifier: IVerifier = {
        verify: (): Promise<VerificationResult> => {
            return Promise.resolve(VerificationResult.Succeeded);
        }
    }

    const verifiee: IVerifiee = {
        allowToVerify: () => { },
        handleVerificationRequest: () => Promise.resolve(true),
    }

    return new VerifyManager(sender, verifier, verifiee);
}

function mockAuthority(): Authority {
    return { amount: 10, type: KVKAuthorityType.Inkoop };
}

function mockEntity(): LegalEntity {
    return { name: "Janssen", address: "addr", kvknr: "123" };
}

function mockMessageOffer(sessionId: string): Envelope<MsgOfferVerification> {
    return {
        message: {
            type: "OfferVerification",
            sessionId: sessionId,
            spec: {
                authority: mockAuthority(),
                legalEntity: mockEntity(),
            },
        },
        messageId: "a",
        senderId: "VERIF",
        reference: "x",
    };
}