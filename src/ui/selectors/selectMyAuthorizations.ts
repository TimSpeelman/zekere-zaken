import { Authorization, IState } from "../../types/State";

export function selectMyAuthorizations(state: IState): Authorization[] {
    return state.myAuthorizations;
}
