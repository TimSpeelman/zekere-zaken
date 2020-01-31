import { Authorization, IState } from "../../types/State";

export function selectGivenAuthorizations(state: IState): Authorization[] {
    return state.givenAuthorizations
}

export function selectGivenAuthorizationById(id: string) {
    return (state: IState): Authorization | undefined => selectGivenAuthorizations(state).find(a => a.id === id);
}
