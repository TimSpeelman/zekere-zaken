import { Box, Button, Divider } from "@material-ui/core";
import { default as React } from "react";
import { ClearCache, ToggleConsole } from "../../../commands/Command";
import { useCommand } from "../../hooks/useCommand";
import { useLocalState } from "../../hooks/useLocalState";

export function Settings() {
    const { dispatch } = useCommand();
    const { state } = useLocalState();
    return (
        <Box pt={3}>
            <Box mb={3}>
                <p>Uw ID: {state.myId}</p>
            </Box>
            <Box mb={3}>
                <Divider />
                <p>In de console kunnen loggegevens worden getoond.</p>
                <Button variant="outlined" onClick={() => dispatch(ToggleConsole({}))} >Loggen aan-/uitzetten</Button>
            </Box>
            <Box >
                <Divider />
                <p>In de browsercache worden de appgegevens opgeslagen.</p>
                <Button variant="outlined" onClick={() => dispatch(ClearCache({}))} >Cache Legen</Button>
            </Box>
        </Box>
    );
}
