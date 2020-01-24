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

const loc = window.location;
const socketPort = 80;
// const socketUrl = `${loc.protocol}//${loc.host.replace(/:[0-9]+/, "")}:${socketPort}`;
const socketUrl = `${loc.protocol}//${loc.host.replace(/:[0-9]+/, "")}`;
console.log("TCL: socketUrl", socketUrl)
const _socket = socketIOClient.connect(socketUrl);

const agent = new SockAgent(_socket);
const gateway: IdentityGatewayInterface = new SocketServerIDGateway(agent);

gateway.connect().then((me) => stateMgr.setState(dummyState(me.id)));
stateMgr.hook.on((s) => gateway.setProfile(s.profile!));
gateway.setProfile(stateMgr.state.profile!);

gateway.verifiedProfileHook.on(({ peerId, profile }) => stateMgr.addProfile(peerId, profile));

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
