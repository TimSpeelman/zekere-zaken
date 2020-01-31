import { IState } from "../../types/State";

export function selectOpenAuthTemplates(state: IState) {
    return state.outgoingAuthTemplates.filter(t => !t.answeredWithAuthorizationId);
}