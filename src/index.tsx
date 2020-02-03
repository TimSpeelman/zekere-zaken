import { ThemeProvider } from "@material-ui/core";
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { gateway, stateManager, useDependenciesAfterSetup } from "./setup";
import { theme } from "./theme";
import { App } from "./ui/App";
import "./ui/assets/css/index.css";
import { CommandContextProvider } from "./ui/hooks/useCommand";
import { LocalStateContextProvider } from "./ui/hooks/useLocalState";
import { LoadingScreen } from "./ui/pages/LoadingScreen";

function WrappedApp() {
    const deps = useDependenciesAfterSetup();

    return !deps ? <LoadingScreen /> : (

        <LocalStateContextProvider stateMgr={stateManager}>
            <CommandContextProvider dispatch={(a) => gateway.dispatch(a)}>
                <App />
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

// Workaround to ensure that custom styles are placed last (to override other styles);
function tryAlter() {
    const customStyles = document.querySelector('style[data-meta=makeStyles]');
    if (customStyles) {
        document.getElementsByTagName('head')[0].insertAdjacentElement('beforeend', customStyles)
    } else {
        setTimeout(tryAlter, 200);
    }
}
tryAlter();
