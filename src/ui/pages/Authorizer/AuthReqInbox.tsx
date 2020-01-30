import { ListSubheader } from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { format } from "date-fns";
import { default as React } from "react";
import { InAuthorizationRequest } from "../../../types/State";
import { useLocalState } from "../../hooks/useLocalState";
import { useSelector } from "../../hooks/useSelector";
import { selectOpenInAuthReqs } from "../../selectors/selectOpenInAuthReqs";

export function AuthReqInbox() {

    const { state } = useLocalState();
    const reqs = useSelector(selectOpenInAuthReqs) || [];
    const getProfile = (req: InAuthorizationRequest) => state.profiles[req.subjectId];

    return (
        <div>

            <List component="nav" >
                <ListSubheader>Uitgegeven Machtigingen</ListSubheader>
                <ListItem disabled>U heeft nog geen machtigingen uitgegeven.</ListItem>

                <ListSubheader>Openstaande Verzoeken</ListSubheader>
                {reqs.length === 0 && <ListItem disabled>U heeft geen openstaande verzoeken.</ListItem>}
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/authreqs/inbox/${req.id}`}>
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
