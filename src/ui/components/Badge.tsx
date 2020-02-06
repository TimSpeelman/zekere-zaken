import { Paper } from "@material-ui/core";
import { default as React, ReactElement } from "react";
import { useStyles } from "../../styles";
import { Profile } from "../../types/State";

interface Props {
    profile: Profile;
    body: ReactElement;
    onLoad?: () => void;
}

export function Badge({ profile, onLoad, body }: Props) {
    const classes = useStyles({});

    return (
        <Paper className="badge" elevation={6}>
            <div className="top">
                <img src={profile?.photo} onLoad={onLoad} />
            </div>
            <div className="name">
                {profile?.name}
            </div>
            <div className="qr">
                {body}
            </div>
        </Paper>
    );
}

