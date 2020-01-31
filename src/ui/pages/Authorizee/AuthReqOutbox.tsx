import { Box, Button, ListSubheader } from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { format } from "date-fns";
import { default as React } from "react";
import { authText, reqText } from "../../../util/intl";
import { useLocalState } from "../../hooks/useLocalState";
import { useSelector } from "../../hooks/useSelector";
import { selectMyAuthorizations } from "../../selectors/selectMyAuthorizations";
import { selectOpenAuthTemplates } from "../../selectors/selectOpenAuthTemplates";

export function AuthReqOutbox() {
    const { state } = useLocalState();
    const templates = useSelector(selectOpenAuthTemplates) || [];
    const auths = useSelector(selectMyAuthorizations) || [];
    return (
        <div>

            <List component="nav" >
                <ListSubheader>Actuele Bevoegdheden</ListSubheader>
                {auths.length === 0 ?
                    <div>
                        <ListItem disabled>U heeft nog geen bevoegdheden.</ListItem>
                    </div>
                    :
                    auths.map(auth => (
                        <ListItem button key={auth.id} component="a" href={`#/my-authorizations/${auth.id}`}>
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

                <Box style={{ textAlign: "center" }} mt={2} mb={2} >
                    <Button variant="outlined" component="a" href="#/authreqs/new">Bevoegdheid Aanvragen</Button>
                </Box>

                <ListSubheader>Openstaande Verzoeken</ListSubheader>
                {templates.length === 0 && <ListItem disabled>U heeft geen openstaande verzoeken.</ListItem>}
                {templates.map(req => (
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
