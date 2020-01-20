import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from '@material-ui/core/Typography';
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";
import { InAuthorizationRequest } from "../../types/State";
import { eur } from "../../util/eur";

export function IncomingVerifReq() {
    const { reqId: id } = useParams();
    const { state } = useLocalState();
    const classes = useStyles({});
    const req = state.incomingVerifReqs.find(r => r.id === id)

    function getMsg() {
        let textMsg = "";
        if (req) {
            const inAuthReq: InAuthorizationRequest = { ...req, from: { name: "Tim Speelman" } }
            const uriReq = encodeURIComponent(JSON.stringify(inAuthReq))
            textMsg = `Wil je mij machtigen voor '${req?.authority.type}' tot '${eur(req!.authority.amount)}'? https://machtigen.mualo.nl/#/in/${uriReq}`;
        }
        return `https://wa.me/?text=${encodeURIComponent(textMsg)}`
    }

    return !req ? <div>Dit verzoek bestaat niet.</div> : (
        <div>
            <Box p={1}></Box>
            <Paper className={classes.paper} >

                <Box
                    display="flex"
                    alignItems="center"
                    bgcolor="background.paper"
                    css={{ height: 100 }}
                >
                    <Box p={1}>
                        <Avatar src="http://bwphoto.nl/wp-content/uploads/2017/07/pasfoto-bianca.jpg"
                            style={{ width: 80, height: 80 }} />
                    </Box>
                    <Box p={1}>
                        <Typography component="h2" variant="h6" color="inherit">
                            {req.from.name}
                        </Typography>
                    </Box>

                </Box>


            </Paper>

            <Box pt={1} pb={1}>
                <p><strong>{req.from.name}</strong> wil uw bevoegdheid controleren voor het volgende:</p>
            </Box>

            <Paper className={classes.paper} >
                <p>Bevoegd namens <strong>{req.legalEntity.name}</strong> (KVK-nummer: <strong>{req.legalEntity.kvknr}</strong>),
                gevestigd te <strong>{req.legalEntity.address}</strong> te handelen voor:</p>

                <List dense >
                    <ListItem >
                        <ListItemText
                            primary={req.authority.type}
                            secondary={"Type Handeling"} />
                    </ListItem>
                    <ListItem >
                        <ListItemText
                            primary={eur(req.authority.amount)}
                            secondary={"Financiële Beperking"} />
                    </ListItem>
                </List>
            </Paper>

            <Box pt={1} pb={1}>
                <p>Deze bevoegdheid zit niet in uw wallet:</p>
            </Box>

            <Box pb={2} pt={2}>
                <Toolbar>
                    <Button variant={"contained"} color={"primary"} component="a" href={getMsg()}>Bevoegdheid Aanvragen</Button>
                    <Button variant={"contained"} style={{ marginLeft: 16 }}>Annuleren</Button>
                </Toolbar>
            </Box>
        </div>
    );
}
