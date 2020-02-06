import { MsgRequestVerification, VerifyNegotiation } from "../../services/identity/verification/types";
import { InVerificationRequest, IState } from "../../types/State";

function getRequestFromVNeg(neg: VerifyNegotiation): MsgRequestVerification | undefined {
    // @ts-ignore
    return neg.steps.find(s => s.type === "RequestVerification");
}

export function selectOpenInVerReqs(state: IState): InVerificationRequest[] {
    return state.verifyNegotiations.filter(n => !!n.conceptSpec).map((n) => ({
        authority: getRequestFromVNeg(n)!.spec.authority!,
        legalEntity: getRequestFromVNeg(n)!.spec.legalEntity,
        datetime: new Date().toISOString(), // FIXME
        id: n.sessionId,
        verifierId: n.verifierId,
    }));
}

export function selectOpenInVerReqById(id: string) {
    return (state: IState): InVerificationRequest | undefined =>
        selectOpenInVerReqs(state).find(r => r.id === id);
}

