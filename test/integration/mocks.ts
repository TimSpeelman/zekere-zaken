import uuid from "uuid/v4";
import { VerificationResult } from "../../src/services/identity/verification/types";
import { MyAgent } from "../../src/services/MyAgent";
import { StateManager } from "../../src/services/state/StateManager";
import { Agent, InVerifyHandler, IPv8VerifReq } from "../../src/shared/Agent";
import { Authority, KVKAuthorityType, LegalEntity } from "../../src/types/State";
import { InMemoryCache } from "../../src/util/Cache";
import { Hook } from "../../src/util/Hook";

export function mockIDPair(idA: string, idB: string) {
    const msgHook = new Hook<PlainMsg>('test-msg-hook', true);
    const verifHook = new Hook<MockIDVerifReq>('test-verif-hook', true);
    const verifAnsHook = new Hook<MockIDVerifAns>('test-verif-ans-hook', true);

    const agentA = createIDAgent(idA, msgHook, verifHook, verifAnsHook);
    const agentB = createIDAgent(idB, msgHook, verifHook, verifAnsHook);
    return [agentA, agentB];
}

export interface PlainMsg {
    senderId: string,
    targetId: string,
    message: string,
}

export interface MockIDVerifReq {
    id: string,
    senderId: string,
    targetId: string,
    request: IPv8VerifReq,
}

export interface MockIDVerifAns {
    id: string;
    senderId: string,
    targetId: string,
    answer: VerificationResult
}

export function createIDAgent(
    agentId: string,
    msgHook: Hook<PlainMsg>,
    idVerifRequestHook: Hook<MockIDVerifReq>,
    idVerifAnswerHook: Hook<MockIDVerifAns>,
): Agent {
    return {
        connect: () => Promise.resolve({ id: agentId }),

        sendMessage: (targetId: string, message: string) => {
            msgHook.fire({ targetId, message, senderId: agentId });
            return Promise.resolve();
        },

        setIncomingMessageHandler: (handler: (senderId: string, message: string) => void) => {
            msgHook.on((msg) => (msg.targetId === agentId) && handler(msg.senderId, msg.message));
        },

        verifyPeer: (verifieeId: string, request: IPv8VerifReq): Promise<VerificationResult> => {
            const requestId = uuid();

            idVerifRequestHook.fire({
                id: requestId,
                request,
                senderId: agentId,
                targetId: verifieeId
            });

            return new Promise((resolve) =>
                idVerifAnswerHook.on(ans => ans.id === requestId && resolve(ans.answer)));
        },

        setVerificationRequestHandler: (handler: InVerifyHandler) => {
            idVerifRequestHook.on(async (request) => {
                if (request.targetId !== agentId) {
                    return;
                }

                const subjectAccepts = await handler(request.request);

                // Send our answer back to the Verifier
                idVerifAnswerHook.fire({
                    answer: subjectAccepts ? VerificationResult.Succeeded : VerificationResult.Cancelled,
                    id: request.id,
                    senderId: agentId,
                    targetId: request.senderId,
                })
            })
        }
    }
}

export function createMyAgent(idAgent: Agent): [MyAgent, StateManager] {
    const smgr = new StateManager(new InMemoryCache());
    const agent = new MyAgent(idAgent, smgr);
    return [agent, smgr];
}

export function mockAuthority(): Authority {
    return { amount: 10, type: KVKAuthorityType.Inkoop };
}

export function mockEntity(): LegalEntity {
    return { name: "Janssen", address: "addr", kvknr: "123" };
}

