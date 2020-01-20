import { ListSubheader } from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import { format } from "date-fns";
import { default as React } from "react";
import { useLocalState } from "../../hooks/useLocalState";

export function AuthReqInbox() {
    const { state } = useLocalState();
    const reqs = state.incomingAuthReqs;

    return (
        <div>

            <List component="nav" >
                <ListSubheader>Uitgegeven Machtigingen</ListSubheader>
                <ListItem disabled>U heeft nog geen machtigingen uitgegeven</ListItem>

                <ListSubheader>Openstaande Verzoeken</ListSubheader>
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/authreqs/inbox/${req.id}`}>
                        <ListItemAvatar>
                            <Avatar>
                                <ImageIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={req.from.name} secondary={format(req.datetime, 'dd-MM-yyyy HH:mm')} />
                    </ListItem>
                ))}
            </List>

        </div>
    );
}
