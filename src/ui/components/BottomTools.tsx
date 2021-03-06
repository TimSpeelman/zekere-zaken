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
            <div className={classes.bottomLeftButton + " enter-item"}>
                <IconButton aria-label="options" component="a" href={"#/settings"} style={{ color: "#fff" }} >
                    <SettingsIcon />
                </IconButton>
            </div>

            {plusURL && (
                <Fab color="primary" aria-label="add" component="a" href={plusURL} >
                    <AddIcon />
                </Fab>
            )}

            {showQR && (
                <div className={classes.bottomCenterButton + " enter-item"}>
                    <Fab aria-label="add" component="a" href="#/qr">
                        <QRIcon />
                    </Fab>
                </div>
            )}
        </div>
    );
}

