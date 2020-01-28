import { ThemeProvider } from "@material-ui/core";
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from "./App";
import "./assets/css/index.css";
import { CommandContextProvider } from "./hooks/useCommand";
import { LocalStateContextProvider } from "./hooks/useLocalState";
import { ProfileContextProvider } from "./hooks/useProfile";
import { LoadingScreen } from "./pages/LoadingScreen";
import * as serviceWorker from './serviceWorker';
import { gateway, stateManager, useDependenciesAfterSetup } from "./setup";
import { theme } from "./theme";

function WrappedApp() {
    const deps = useDependenciesAfterSetup();

    return !deps ? <LoadingScreen /> : (

        <LocalStateContextProvider stateMgr={stateManager}>
            <CommandContextProvider dispatch={(a) => gateway.dispatch(a)}>
                <ProfileContextProvider myId={deps.myId} myProfile={stateManager.state.profile}>
                    <App />
                </ProfileContextProvider>
            </CommandContextProvider>
        </LocalStateContextProvider>
    )
}

const root = (
    <ThemeProvider theme={theme}><WrappedApp /></ThemeProvider>
);


ReactDOM.render(root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
