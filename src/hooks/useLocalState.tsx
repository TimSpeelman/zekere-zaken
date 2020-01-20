import React, { createContext, useContext, useEffect, useState } from "react";
import { StateManager } from "../services/StateManager";
import { IState } from "../types/State";

/** The Context object available to consumers */
export interface LocalStateContext {
    state: IState;
    manager: StateManager;
}

// Create a react context with dummy default value
const Context = createContext<LocalStateContext>({} as LocalStateContext);

export const LocalStateContextProvider: React.FC<{ stateMgr: StateManager }> = ({ stateMgr, children }) => {
    const [_state, setState] = useState<IState>(stateMgr.state);

    const { hook, state } = stateMgr;

    // Register to the changes to local state
    useEffect(() => {
        setState(state);
        hook.on(setState);

    }, [hook, state])

    return <Context.Provider value={{ state: _state, manager: stateMgr }}>{children}</Context.Provider>
}

export const useLocalState = () => {
    return useContext(Context);
};

