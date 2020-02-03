import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { format } from "date-fns";
import { default as React } from "react";
import { useStyles } from "../../../styles";
import { useLocalState } from "../../hooks/useLocalState";
import { useSelector } from "../../hooks/useSelector";
import { selectOpenInVerReqs } from "../../selectors/selectOpenInVerReqs";

export function VerifReqInbox() {
    const { state } = useLocalState();
    const reqs = useSelector(selectOpenInVerReqs) || [];
    const classes = useStyles({});
    const getProfile = (subjectId: string) => {
        const p = state.profiles[subjectId];
        return (p && p.status === "Verified") ? p.profile : undefined;
    }

    return (
        <div>
            <List component="nav" >
                {reqs.length === 0 && <ListItem disabled>U heeft geen openstaande verificatieverzoeken.</ListItem>}
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/verifs/inbox/${req.id}`}>
                        <ListItemAvatar>
                            <Avatar src={getProfile(req.verifierId)?.photo}
                                style={{ width: 60, height: 60 }} />
                        </ListItemAvatar>
                        <ListItemText primary={getProfile(req.verifierId)?.name} secondary={format(new Date(req.datetime), 'dd-MM-yyyy HH:mm')} />
                    </ListItem>
                ))}
            </List>

        </div>
    );
}
