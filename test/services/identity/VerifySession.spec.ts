import { Envelope, ISendMessages } from "../../../src/services/identity/messaging/types";
import { IVerifiee, IVerifier, VerificationMessage, VerificationResult } from "../../../src/services/identity/verification/types";
import { VerifySession } from "../../../src/services/identity/verification/VerifySession";
import { Authority, KVKAuthorityType, LegalEntity } from "../../../src/types/State";
import { Hook } from "../../../src/util/Hook";
import { Timer } from "../../../src/util/timer";
import { describe, expect, it, makeDone } from "../../setup";

describe("VerifySession", () => {

    const authority = mockAuthority();
    const legalEntity = mockEntity();
    const offer = { authority, legalEntity };

    it("sends a full offer", (_done) => {
        const done = makeDone(_done, 1);
        const { sender, verifier, verifiee } = mockServices();

        sender.send = (peerId, msg) => {
            expect(peerId).to.equal("SUBJ");
            expect(msg.sessionId).to.equal("sess1");
            expect(msg.type).to.equal("OfferVerification");
            done();
        }

        const session = new VerifySession("SUBJ", "sess1", sender, verifier, verifiee);



        session.offer(offer);
    })



});

function mockServices() {
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

    return { sender, verifier, verifiee };
}

function mockPair() {
    const hookMsg = new Hook<{ targetId: string, envelope: Envelope<VerificationMessage> }>();

    const sender = (senderId: string): ISendMessages<VerificationMessage> => ({
        send(peerId: string, message: VerificationMessage) {
            hookMsg.fire({ targetId: peerId, envelope: { messageId: "x", message, senderId } });
            return Promise.resolve();
        }
    })

    const verifier: IVerifier = {
        verify: (): Promise<VerificationResult> => {
            return Promise.resolve(VerificationResult.Succeeded);
        }
    }

    const verifiee: IVerifiee = {
        allowToVerify: () => { },
        handleVerificationRequest: () => Promise.resolve(true),
    }

    const sessions = {
        verifierSession: new VerifySession("SUBJ", "sess1", sender("VERIF"), verifier, verifiee),
        subjectSession: new VerifySession("VERIF", "sess1", sender("SUBJ"), verifier, verifiee),
    }

    const async = (fn: () => any) => new Timer(fn, 1);
    const err = (targetId: string) => { throw new Error(`Target unknown ${targetId}`) };

    // Connect the sessions together
    hookMsg.on(({ targetId, envelope }) => async(() =>
        targetId === "SUBJ" ? sessions.subjectSession.receive(envelope) :
            targetId === "VERIF" ? sessions.verifierSession.receive(envelope) :
                err(targetId)));

    return sessions;
}

function mockAuthority(): Authority {
    return { amount: 10, type: KVKAuthorityType.Inkoop };
}

function mockEntity(): LegalEntity {
    return { name: "Janssen", address: "addr", kvknr: "123" };
}
