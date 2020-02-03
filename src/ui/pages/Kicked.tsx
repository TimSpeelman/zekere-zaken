import { Button, Typography } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import { default as React } from "react";
import { useStyles } from "../../styles";
import { useLocalState } from "../hooks/useLocalState";

export function Kicked() {
    const classes = useStyles({});
    const { state } = useLocalState();

    return (
        <Box className={classes.cover}>
            <Typography>U heeft deze app in een ander scherm geopend.</Typography>
            <Button component="a" variant="contained" href={"/"}>Opnieuw laden</Button>
        </Box>
    );
}
