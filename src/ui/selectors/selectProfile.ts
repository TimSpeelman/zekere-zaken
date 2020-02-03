import { IState, Profile, ProfileResult } from "../../types/State";

export function selectProfileById(peerId: string) {
    return (state: IState): Profile | undefined => {
        const p = state.profiles[peerId];
        return (p && p.status === "Verified") ? p.profile : undefined;
    }
}

export function selectProfileStatusById(peerId: string) {
    return (state: IState): ProfileResult | undefined => {
        return state.profiles[peerId];
    }
}
