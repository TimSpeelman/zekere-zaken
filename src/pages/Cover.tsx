import { Button } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import { default as React } from "react";
import logo from "../assets/images/ZekereZakenLogo-white.svg";
import { useLocalState } from "../hooks/useLocalState";
import { useStyles } from "../styles";
import { fullScreen } from "../util/fullScreenOnClick";

export function Cover() {
    const classes = useStyles({});
    const { state } = useLocalState();

    const url = state.profile ? "#/home" : "#/onboard";
    return (
        <Box className={classes.cover}>
            <img src={logo} alt="Zekere Zaken App" style={{ width: "100%", display: "block" }} />

            <Button component="a" variant="contained" href={url} onClick={fullScreen}>Starten</Button>
        </Box>
    );
}
