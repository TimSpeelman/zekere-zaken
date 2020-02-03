import { Box, Button } from "@material-ui/core";
import { default as React } from "react";
import { ClearCache, ToggleConsole } from "../../commands/Command";
import { useCommand } from "../hooks/useCommand";

export function Settings() {
    const { dispatch } = useCommand();
    return (
        <Box pt={3}>
            <p>In de browsercache worden de appgegevens opgeslagen.</p>
            <Button variant="outlined" onClick={() => dispatch(ClearCache({}))} >Cache Legen</Button>
            <p>In de console kunnen loggegevens worden getoond.</p>
            <Button variant="outlined" onClick={() => dispatch(ToggleConsole({}))} >Loggen aan-/uitzetten</Button>
        </Box>
    );
}
