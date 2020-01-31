import { Authorization, IState } from "../../types/State";

export function selectGivenAuthorizations(state: IState): Authorization[] {
    return state.givenAuthorizations
}
