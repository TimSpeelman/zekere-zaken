import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import { format } from "date-fns";
import { default as React } from "react";
import { useLocalState } from "../../hooks/useLocalState";
import { eur } from "../../util/eur";

export function VerifReqOutbox() {
    const { state } = useLocalState();
    const reqs = state.outgoingVerifReqs;

    return (
        <div>

            <List component="nav" >
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/verifs/outbox/${req.id}`}>
                        <ListItemAvatar>
                            <Avatar>
                                <ImageIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={`${req.authority.type} tot ${eur(req.authority.amount)} namens ${req.legalEntity.name}`}
                            secondary={format(req.datetime, 'dd-MM-yyyy HH:mm')} />
                    </ListItem>
                ))}
            </List>

        </div>
    );
}
