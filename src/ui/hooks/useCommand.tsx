import React, { createContext, useContext } from "react";
import { UserCommand } from "../../commands/Command";

type Dispatch = (command: UserCommand) => void;

/** The Context object available to consumers */
export interface CommandContext {
    dispatch: Dispatch;
}

// Create a react context with dummy default value
const Context = createContext<CommandContext>({} as CommandContext);

export const CommandContextProvider: React.FC<{ dispatch: Dispatch }> = ({ dispatch, children }) => {


    return <Context.Provider value={{ dispatch }}>{children}</Context.Provider>
}

export const useCommand = () => {
    return useContext(Context);
};
