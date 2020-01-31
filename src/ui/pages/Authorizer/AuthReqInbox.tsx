import { ListSubheader } from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { format } from "date-fns";
import { default as React } from "react";
import { useLocalState } from "../../hooks/useLocalState";
import { useSelector } from "../../hooks/useSelector";
import { selectGivenAuthorizations } from "../../selectors/selectGivenAuthorizations";
import { selectOpenInAuthReqs } from "../../selectors/selectOpenInAuthReqs";

export function AuthReqInbox() {

    const { state } = useLocalState();
    const reqs = useSelector(selectOpenInAuthReqs) || [];
    const given = useSelector(selectGivenAuthorizations) || [];
    const getProfile = (subjectId: string) => state.profiles[subjectId];

    return (
        <div>

            <List component="nav" >
                <ListSubheader>Uitgegeven Machtigingen</ListSubheader>
                {given.length === 0 && <ListItem disabled>U heeft geen uitgegeven machtigingen.</ListItem>}
                {given.map(auth => (
                    <ListItem button key={auth.id} component="a" href={`#/authreq/inbox/${auth.id}`}>
                        <ListItemAvatar>
                            <Avatar src={getProfile(auth.subjectId)?.photo}
                                style={{ width: 60, height: 60 }} />
                        </ListItemAvatar>
                        <ListItemText primary={getProfile(auth.subjectId)?.name} secondary={format(new Date(auth.issuedAt), 'dd-MM-yyyy HH:mm')} />
                    </ListItem>
                ))}

                <ListSubheader>Openstaande Verzoeken</ListSubheader>
                {reqs.length === 0 && <ListItem disabled>U heeft geen openstaande verzoeken.</ListItem>}
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/authreqs/inbox/${req.id}`}>
                        <ListItemAvatar>
                            <Avatar src={getProfile(req.subjectId)?.photo}
                                style={{ width: 60, height: 60 }} />
                        </ListItemAvatar>
                        <ListItemText primary={getProfile(req.subjectId)?.name} secondary={format(new Date(req.datetime), 'dd-MM-yyyy HH:mm')} />
                    </ListItem>
                ))}
            </List>

        </div>
    );
}
