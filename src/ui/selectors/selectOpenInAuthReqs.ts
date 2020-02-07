import { NegStatus } from "../../services/identity/authorization/types";
import { InAuthorizationRequest, IState } from "../../types/State";

export function selectOpenInAuthReqs(state: IState): InAuthorizationRequest[] {
    return state.authorizeNegotiations
        .filter(n => !!n.conceptSpec && n.authorizerId === state.myId)
        .filter(n => n.status === NegStatus.Pending)
        .filter(n => !state.givenAuthorizations.find(a => a.sessionId === n.id))
        .map((n) => ({
            authority: n.conceptSpec!.authority!,
            legalEntity: n.conceptSpec!.legalEntity,
            datetime: new Date().toISOString(), // FIXME
            id: n.id,
            subjectId: n.subjectId,
            resultedInAuthId: n.resultedInAuthId
        }));
}

export function selectOpenInAuthReqById(id: string) {
    return (state: IState): InAuthorizationRequest | undefined =>
        selectOpenInAuthReqs(state).find(r => r.id === id);
}

