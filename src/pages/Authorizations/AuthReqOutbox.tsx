import { Box, Button, ListSubheader } from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { format } from "date-fns";
import { default as React } from "react";
import { useLocalState } from "../../hooks/useLocalState";
import { authText, reqText } from "../../util/intl";

export function AuthReqOutbox() {
    const { state } = useLocalState();
    const reqs = state.outgoingAuthReqs;
    const auths = state.authorizations;
    return (
        <div>

            <List component="nav" >
                <ListSubheader>Actuele Bevoegdheden</ListSubheader>
                {auths.length === 0 ?
                    <div>
                        <ListItem disabled>U heeft nog geen bevoegdheden.</ListItem>
                        <Box style={{ textAlign: "center" }} mt={2} mb={2} >
                            <Button variant="outlined" component="a" href="#/authreqs/new">Bevoegdheid Aanvragen</Button>
                        </Box>
                    </div>
                    :
                    auths.map(auth => (
                        <ListItem button key={auth.id} component="a" href={`#/auths/${auth.id}`}>
                            <ListItemAvatar>
                                <Avatar>
                                    <i className="material-icons">check</i>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={authText(auth)}
                                secondary={format(new Date(auth.issuedAt), 'dd-MM-yyyy HH:mm')} />
                        </ListItem>
                    ))
                }

                <ListSubheader>Openstaande Verzoeken</ListSubheader>
                {reqs.length === 0 && <ListItem disabled>U heeft geen openstaande verzoeken.</ListItem>}
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/authreqs/outbox/${req.id}`}>
                        <ListItemAvatar>
                            <Avatar>
                                <i className="material-icons">hourglass_empty</i>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={reqText(req)}
                            secondary={format(new Date(req.datetime), 'dd-MM-yyyy HH:mm')} />
                    </ListItem>
                ))}
            </List>

        </div>
    );
}
