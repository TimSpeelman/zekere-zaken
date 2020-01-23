import { IState } from "../types/State";
import { useLocalState } from "./useLocalState";

export function useSelector<T>(selector: (state: IState) => T) {
    const context = useLocalState();
    return selector(context.state);
}