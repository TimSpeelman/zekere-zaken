import { Authorization, IState } from "../../types/State";

export function selectMyAuthorizations(state: IState): Authorization[] {
    return state.myAuthorizations;
}

export function selectMyAuthorizationById(id: string) {
    return (state: IState) => selectMyAuthorizations(state).find(a => a.id === id);
}
