import { Avatar, Box, Paper } from "@material-ui/core";
import { default as React } from "react";
import { useStyles } from "../../styles";
import { Profile } from "../../types/State";

interface Props {
    profile: Profile
}

export function PersonCard({ profile }: Props) {
    const classes = useStyles({});

    return (
        <Paper className={classes.paper} >

            <Box
                display="flex"
                alignItems="center"
            >
                <Box p={1}>
                    <Avatar src={profile.photo}
                        style={{ width: 60, height: 60 }} />
                </Box>
                <Box p={1}>
                    <strong>
                        {profile.name}
                    </strong>
                </Box>

            </Box>


        </Paper>
    );
}

