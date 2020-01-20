import { IState } from "../types/State";
import { useLocalState } from "./useLocalState";

let _s: any = null;

export function useSelector<T>(selector: (state: IState) => T) {
    const context = useLocalState();
    if (_s !== context.state) console.log("useSelector: STATE updated");
    _s = context.state;
    return selector(context.state);
}