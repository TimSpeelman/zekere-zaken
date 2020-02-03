import { IconButton } from "@material-ui/core";
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import { default as React } from "react";
import { useStyles } from "../../styles";
import { QRIcon } from "./QRIcon";

interface Props {
    plusURL?: string,
    showQR?: boolean,
}

export function BottomTools({ plusURL, showQR }: Props) {
    const classes = useStyles({});

    return (
        <div>
            <IconButton aria-label="options" component="a" href={"#/settings"} className={classes.bottomLeftButton} >
                <SettingsIcon />
            </IconButton>

            {plusURL && (
                <Fab color="primary" aria-label="add" component="a" href={plusURL} >
                    <AddIcon />
                </Fab>
            )}

            {showQR && (
                <Fab aria-label="add" component="a" href="#/qr" className={classes.bottomCenterButton}>
                    <QRIcon />
                </Fab>
            )}
        </div>
    );
}

