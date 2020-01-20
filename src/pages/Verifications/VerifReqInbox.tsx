import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import { format } from "date-fns";
import { default as React } from "react";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";

export function VerifReqInbox() {
    const { state } = useLocalState();
    const reqs = state.incomingVerifReqs;
    const classes = useStyles({});

    return (
        <div>

            <List component="nav" >
                {reqs.length === 0 && <ListItem disabled>U heeft geen openstaande verificatieverzoeken.</ListItem>}
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/verifs/inbox/${req.id}`}>
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
