import React, { createContext, useContext, useState } from "react";

/** The Context object available to consumers */
export interface MenuContext {
    open: boolean;
    setOpen: (to: boolean) => void;
}

// Create a react context with dummy default value
const Context = createContext<MenuContext>({} as MenuContext);

export const MenuContextProvider: React.FC = ({ children }) => {
    const [open, setOpen] = useState(false);

    const context = {
        open,
        setOpen,
    }

    return <Context.Provider value={context}>{children}</Context.Provider>
}

export const useMenu = () => {
    return useContext(Context);
};

