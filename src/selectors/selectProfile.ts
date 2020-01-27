import { IState, Profile } from "../types/State";

export function selectProfileById(peerId: string) {
    return (state: IState): Profile | undefined => state.profiles[peerId];
}
