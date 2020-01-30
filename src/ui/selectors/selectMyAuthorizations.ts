import { Authorization, AuthorizationFromNeg, IState } from "../../types/State";

export function selectMyAuthorizations(state: IState): Authorization[] {
    return state.authorizeNegotiations
        .map(n => AuthorizationFromNeg(n))
        .filter((n): n is Authorization => !!n)
        .filter((n) => n.subjectId === state.myId);
}
