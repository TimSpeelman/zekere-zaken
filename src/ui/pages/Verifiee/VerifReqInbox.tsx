import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { format } from "date-fns";
import { default as React } from "react";
import { useStyles } from "../../../styles";
import { VerificationRequest } from "../../../types/State";
import { useLocalState } from "../../hooks/useLocalState";

export function VerifReqInbox() {
    const { state } = useLocalState();
    const reqs = state.incomingVerifReqs;
    const classes = useStyles({});
    const getProfile = (req: VerificationRequest) => state.profiles[req.verifierId];

    return (
        <div>

            <List component="nav" >
                {reqs.length === 0 && <ListItem disabled>U heeft geen openstaande verificatieverzoeken.</ListItem>}
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/verifs/inbox/${req.id}`}>
                        <ListItemAvatar>
                            <Avatar src={getProfile(req)?.photo}
                                style={{ width: 60, height: 60 }} />
                        </ListItemAvatar>
                        <ListItemText primary={getProfile(req)?.name} secondary={format(new Date(req.datetime), 'dd-MM-yyyy HH:mm')} />
                    </ListItem>
                ))}
            </List>

        </div>
    );
}
