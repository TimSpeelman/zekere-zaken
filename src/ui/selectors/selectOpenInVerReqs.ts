import { InVerificationRequest, IState } from "../../types/State";

export function selectOpenInVerReqs(state: IState): InVerificationRequest[] {
    return state.verifyNegotiations.filter(n => !!n.conceptSpec).map((n) => ({
        authority: n.conceptSpec!.authority!,
        legalEntity: n.conceptSpec!.legalEntity,
        datetime: new Date().toISOString(), // FIXME
        id: n.sessionId,
        verifierId: n.verifierId,
    }));
}

export function selectOpenInVerReqById(id: string) {
    return (state: IState): InVerificationRequest | undefined =>
        selectOpenInVerReqs(state).find(r => r.id === id);
}

