import { Authorization, AuthorizationFromNeg, IState } from "../../types/State";

export function selectGivenAuthorizations(state: IState): Authorization[] {
    return state.authorizeNegotiations
        .map(n => AuthorizationFromNeg(n))
        .filter((n): n is Authorization => !!n)
        .filter((n) => n.issuerId === state.myId);
}
