import { Avatar, Box, Button, Divider, Paper } from "@material-ui/core";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { default as React, Fragment } from "react";
import { BottomTools } from "../components/BottomTools";
import { useLocalState } from "../hooks/useLocalState";
import { useStyles } from "../styles";

export function Home() {
    const classes = useStyles({});
    const items = [
        { path: "#/verifs/new", label: "Verifiëren", sub: "Controleer iemand anders" },
        { path: "#/authreqs/outbox", label: "Mijn Bevoegdheden", sub: "Beheer, deel, vraag aan." },
        { path: "#/authreqs/inbox", label: "Machtigingen", sub: "Machtig derden namens uw organisatie(s)." },
    ]

    const { state } = useLocalState()
    const profile = state.profile;

    return (
        <div>
            {!profile ? <Button component="a" href="#/onboard">Profiel maken</Button> : (
                <Paper className={classes.paper} style={{ marginTop: 16 }} >
                    <Box
                        display="flex"
                        alignItems="center"
                        bgcolor="background.paper"
                    >
                        <Box mr={2}>
                            <Avatar src={profile.photo} style={{ width: 60, height: 60 }} />
                        </Box>
                        <Box>
                            <strong>
                                {profile.name}
                            </strong><br />
                            <Button component="a" href="#/onboard" size="small">Bijwerken</Button>
                        </Box>
                    </Box>
                </Paper>
            )}

            <List component="nav" >
                {items.map(item => (
                    <Fragment key={item.path}>
                        <ListItem button component="a" href={item.path}>
                            <ListItemText primary={item.label} secondary={item.sub} />
                        </ListItem>
                        <Divider />
                    </Fragment>
                ))}
            </List>

            <BottomTools showQR />
        </div>
    );
}
