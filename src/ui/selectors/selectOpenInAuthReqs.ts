import { InAuthorizationRequest, IState } from "../../types/State";

export function selectOpenInAuthReqs(state: IState): InAuthorizationRequest[] {
    return state.authNegs.map((n) => ({
        authority: n.conceptSpec!.authority!,
        legalEntity: n.conceptSpec!.legalEntity,
        datetime: new Date().toISOString(), // FIXME
        id: n.id,
        subjectId: n.subjectId,
    }));
}

export function selectOpenInAuthReqById(id: string) {
    return (state: IState): InAuthorizationRequest | undefined =>
        selectOpenInAuthReqs(state).find(r => r.id === id);
}

