import React, { createContext, useContext } from "react";
import { IdentityGatewayInterface } from "../services/IdentityGatewayInterface";

/** The Context object available to consumers */
export interface IdentityGatewayContext {
    gateway: IdentityGatewayInterface;
}

// Create a react context with dummy default value
const Context = createContext<IdentityGatewayContext>({} as IdentityGatewayContext);

export const IdentityGatewayContextProvider: React.FC<{ gateway: IdentityGatewayInterface }> = ({ gateway, children }) => {


    return <Context.Provider value={{ gateway }}>{children}</Context.Provider>
}

export const useIdentityGateway = () => {
    return useContext(Context);
};
