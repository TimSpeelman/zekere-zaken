/**
 * This context provides the Profile and Identifier of the current user.
 */
import React, { createContext, useContext } from "react";
import { Profile } from "../types/State";

/** The Context object available to consumers */
export interface ProfileContext {
    myProfile?: Profile;
    myId: string;
}

// Create a react context with dummy default value
const Context = createContext<ProfileContext>({} as ProfileContext);

export const ProfileContextProvider: React.FC<{ myProfile?: Profile, myId: string }> = ({ myProfile, myId, children }) => {
    return <Context.Provider value={{ myProfile, myId }}>{children}</Context.Provider>
}

export const useProfile = () => {
    return useContext(Context);
};
