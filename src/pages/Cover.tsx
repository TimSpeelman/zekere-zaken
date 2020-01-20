import { Button } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import { default as React } from "react";
import logo from "../assets/images/ZekereZakenLogo-white.svg";
import { useStyles } from "../styles";

export function Cover() {
    const classes = useStyles({});

    return (
        <Box className={classes.cover}>
            <img src={logo} alt="Zekere Zaken App" style={{ width: "100vw", display: "block" }} />

            <Button component="a" variant="contained" href="#/home">Starten</Button>
        </Box>
    );
}
