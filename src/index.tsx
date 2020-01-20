import { ThemeProvider } from "@material-ui/core";
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from "./App";
import { dummyState } from "./dummy";
import { LocalStateContextProvider } from "./hooks/useLocalState";
import { StateManager } from "./services/StateManager";
import * as serviceWorker from './serviceWorker';
import { theme } from "./theme";

const stateMgr = new StateManager();
stateMgr.setState(dummyState);



const root = (
    <ThemeProvider theme={theme}>
        <LocalStateContextProvider stateMgr={stateMgr}>
            <App />
        </LocalStateContextProvider>
    </ThemeProvider>
);

ReactDOM.render(root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
