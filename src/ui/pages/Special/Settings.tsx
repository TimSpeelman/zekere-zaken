import { Box, Button, Divider } from "@material-ui/core";
import { default as React } from "react";
import { CSSTransition } from "react-transition-group";
import { ClearCache } from "../../../commands/Command";
import { SessionIDStore } from "../../../services/socket";
import { PageTitle } from "../../components/PageTitle";
import { useCommand } from "../../hooks/useCommand";
import { useLocalState } from "../../hooks/useLocalState";

export function Settings() {
    const { dispatch } = useCommand();
    const { state } = useLocalState();

    const clearCache = () => {
        SessionIDStore.remove();
        dispatch(ClearCache({}));
        window.location.assign("/");
    }

    const toggleConsole = () => {
        if (localStorage.getItem("debug")) {
            localStorage.removeItem("debug");
        } else {
            localStorage.setItem("debug", "oa:*");
        }
    }

    return (
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 1000, enter: 100, exit: 1 }}
            classNames={"items"}
        >
         <div>
                <PageTitle title="Instellingen" showBackButton />
                <Box mb={3}>
                    <p>Uw ID: {state.myId}</p>
                </Box>
                <Box mb={3}>
                    <Divider />
                    <p>In de console kunnen loggegevens worden getoond.</p>
                    <Button variant="outlined" onClick={toggleConsole} >Loggen aan-/uitzetten</Button>
                </Box>
                <Box >
                    <Divider />
                    <p>In de browsercache worden de appgegevens opgeslagen.</p>
                    <Button variant="outlined" onClick={clearCache} >Cache Legen</Button>
                </Box>
                </div>
        </CSSTransition>
    );
}
