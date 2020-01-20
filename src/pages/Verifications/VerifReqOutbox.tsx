import { Box, Button } from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ImageIcon from '@material-ui/icons/Image';
import { format } from "date-fns";
import { default as React } from "react";
import { useLocalState } from "../../hooks/useLocalState";
import { reqText } from "../../util/intl";

export function VerifReqOutbox() {
    const { state } = useLocalState();
    const reqs = state.outgoingVerifReqs;

    return (
        <div>

            <List component="nav" >
                {reqs.length === 0 && <ListItem disabled>Uw verificatiegeschiedenis is leeg.</ListItem>}
                {reqs.map(req => (
                    <ListItem button key={req.id} component="a" href={`#/verifs/outbox/${req.id}`}>
                        <ListItemAvatar>
                            <Avatar>
                                <ImageIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={reqText(req)}
                            secondary={format(req.datetime, 'dd-MM-yyyy HH:mm')} />
                    </ListItem>
                ))}
            </List>

            <Box mt={3} style={{ textAlign: "center" }}>
                <Button variant={"outlined"} component="a" href="#/verifs/new">Nieuwe Verificatie</Button>
            </Box>
        </div>
    );
}
