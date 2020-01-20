import { IconButton } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import DeleteIcon from '@material-ui/icons/Delete';
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";
import { InAuthorizationRequest } from "../../types/State";
import { eur } from "../../util/eur";

export function OutgoingAuthReq() {
    const classes = useStyles({});
    const { reqId: id } = useParams();
    const { state, manager } = useLocalState();
    const req = state.outgoingAuthReqs.find(r => r.id === id)

    function getMsg() {
        let textMsg = "";
        if (req) {
            const inAuthReq: InAuthorizationRequest = { ...req, from: { name: "Tim Speelman" } }
            const uriReq = encodeURIComponent(JSON.stringify(inAuthReq))
            textMsg = `Wil je mij machtigen voor '${req?.authority.type}' tot '${eur(req!.authority.amount)}'? https://machtigen.mualo.nl/#/in/${uriReq}`;
        }
        return `https://wa.me/?text=${encodeURIComponent(textMsg)}`
    }


    const deleteItem = () => {
        if (req) {
            manager.removeOutAuthReq(req.id);
            window.location.assign("#/authreqs/outbox");
        }
    }


    return !req ? <div>Dit verzoek bestaat niet</div> : (
        <div>
            {/* <Box p={1}></Box> */}
            <Box pt={1} pb={1}>
                <p>Deel de volgende link om uw bevoegdheid aan te vragen.</p>
            </Box>
            <Paper className={classes.paper} >
                {req.legalEntity && <Box pt={1} pb={1}>
                    <p>Bevoegdheid namens <strong>{req.legalEntity.name}</strong> (KVK-nummer: <strong>{req.legalEntity.kvknr}</strong>),
                gevestigd te <strong>{req.legalEntity.address}</strong> voor het volgende:</p>
                </Box>}

                <List dense >
                    <ListItem >
                        <ListItemText
                            primary={req.authority.type}
                            secondary={"Type Handeling"} />
                    </ListItem>
                    <ListItem >
                        <ListItemText
                            primary={`Tot ${eur(req.authority.amount)}`}
                            secondary={"Financiële Beperking"} />
                    </ListItem>
                </List>
            </Paper>

            <Box pb={2} pt={2} style={{ display: "flex", justifyContent: "space-between" }}>
                <Button variant={"contained"} color={"primary"} component="a" href={getMsg()} >Delen via Whatsapp</Button>
                <IconButton onClick={deleteItem}><DeleteIcon /></IconButton>
            </Box>
        </div>
    );
}
