import { ThemeProvider } from "@material-ui/core";
import React from 'react';
import ReactDOM from 'react-dom';
import socketIOClient from "socket.io-client";
import { App } from "./App";
import { dummyState } from "./dummy";
import { IdentityGatewayContextProvider } from "./hooks/useIdentityGateway";
import { LocalStateContextProvider } from "./hooks/useLocalState";
import { IdentityGatewayInterface } from "./services/IdentityGatewayInterface";
import { SockAgent } from "./services/SockAgent";
import { SocketServerIDGateway } from "./services/SocketServerIDGateway";
import { StateManager } from "./services/StateManager";
import * as serviceWorker from './serviceWorker';
import { theme } from "./theme";

const stateMgr = new StateManager();
stateMgr.setState(dummyState);

const url = 'http://localhost:9090';
const socket = socketIOClient.connect(url);
const agent = new SockAgent(socket);
const gateway: IdentityGatewayInterface = new SocketServerIDGateway(agent);

// fullScreenOnClick();

const root = (
    <ThemeProvider theme={theme}>
        <LocalStateContextProvider stateMgr={stateMgr}>
            <IdentityGatewayContextProvider gateway={gateway} >
                <App />
            </IdentityGatewayContextProvider>
        </LocalStateContextProvider>
    </ThemeProvider>
);

ReactDOM.render(root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
