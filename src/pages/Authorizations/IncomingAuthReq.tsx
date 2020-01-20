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
import { eur } from "../../util/eur";

export function IncomingAuthReq() {
    const { reqId: id } = useParams();
    const { state } = useLocalState();
    const classes = useStyles({});
    const req = state.incomingAuthReqs.find(r => r.id === id)

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
                <p><strong>{req.from.name}</strong> vraagt de volgende machtiging:</p>
            </Box>

            <Paper className={classes.paper} >
                <p>Te verlenen door <strong>{req.legalEntity.name}</strong> (KVK-nummer: <strong>{req.legalEntity.kvknr}</strong>),
                gevestigd te <strong>{req.legalEntity.address}</strong>. Inhoud van de machtiging:</p>

                <List dense >
                    <ListItem >
                        <ListItemText
                            primary={req.authority.type}
                            secondary={"Type Handeling"} />
                    </ListItem>
                    <ListItem >
                        <ListItemText
                            primary={"Tot " + eur(req.authority.amount)}
                            secondary={"Financiële Beperking"} />
                    </ListItem>
                </List>
            </Paper>

            <Box pb={2} pt={2}>
                <Toolbar>
                    <Button variant={"contained"} color={"primary"}>Machtigen</Button>
                    <Button variant={"contained"} style={{ marginLeft: 16 }}>Afwijzen</Button>
                </Toolbar>
            </Box>
        </div>
    );
}
