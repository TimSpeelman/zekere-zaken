import { ThemeProvider } from "@material-ui/core";
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from "./App";
import { dummyState } from "./dummy";
import { CommandContextProvider } from "./hooks/useCommand";
import { IdentityGatewayContextProvider } from "./hooks/useIdentityGateway";
import { LocalStateContextProvider } from "./hooks/useLocalState";
import { IdentityGatewayInterface } from "./services/identity/id-layer/IdentityGatewayInterface";
import { SockAgent } from "./services/identity/id-layer/SockAgent";
import { MyAgent } from "./services/identity/MyAgent";
import { SocketConnection } from "./services/socket";
import { StateManager } from "./services/state/StateManager";
import * as serviceWorker from './serviceWorker';
import { theme } from "./theme";

const stateManager = new StateManager();
const socketAgent = new SockAgent(SocketConnection);
const gateway: IdentityGatewayInterface = new MyAgent(socketAgent, stateManager);

// For demo purposes, we use a dummy state to prefill the app.
gateway.connect().then((me) => stateManager.setState(dummyState(me.id)));

const root = (
    <ThemeProvider theme={theme}>
        <LocalStateContextProvider stateMgr={stateManager}>
            <IdentityGatewayContextProvider gateway={gateway} >
                <CommandContextProvider dispatch={(a) => gateway.dispatch(a)}>
                    <App />
                </CommandContextProvider>
            </IdentityGatewayContextProvider>
        </LocalStateContextProvider>
    </ThemeProvider>
);

ReactDOM.render(root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
