import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from '@material-ui/core/Typography';
import QRCode from "qrcode.react";
import { default as React, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useParams } from "react-router-dom";
import { AspectRatio } from "../../components/AspectRatio";
import { Joep } from "../../dummy";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";
import { Actor } from "../../types/State";
import { eur } from "../../util/eur";

export function OutgoingVerifReq() {
    const classes = useStyles({});
    const { reqId: id } = useParams();
    const { state } = useLocalState();
    const req = state.outgoingVerifReqs.find(r => r.id === id)

    const me: Actor = { name: "Tim Speelman" }; // FIXME
    const qrValue = JSON.stringify({ ...req, from: me });

    const [verifiee, setVerifiee] = useState<Actor | null>(null);

    const mockVerifiee = () => setVerifiee(Joep);

    return !req ? <div>Dit verzoek bestaat niet. </div> : (
        <div>
            {/* <Box p={1}></Box> */}
            <Box pt={1} pb={1}>
                {!verifiee && <p onClick={mockVerifiee}>Deel deze QR code met de te verifieren persoon:</p>}
            </Box>
            <Paper className={classes.paper} >
                {!verifiee ? (
                    <CopyToClipboard text={qrValue}>
                        <AspectRatio heightOverWidth={1}>
                            <QRCode value={qrValue} size={256} level={"M"} style={{ width: "100%", height: "100%" }} />
                        </AspectRatio>
                    </CopyToClipboard>
                ) : (
                        <div>
                            <Typography component="h2" variant="h6" color="inherit">
                                Geverifieerd
                        </Typography>
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
                                        {verifiee.name}
                                    </Typography>
                                </Box>

                            </Box>

                        </div>
                    )}

                {req.legalEntity && <Box pt={1} pb={1}>
                    <p>{!verifiee ? "Bent u bevoegd" : "Bevoegd"} namens <strong>{req.legalEntity.name}</strong> (KVK-nummer: <strong>{req.legalEntity.kvknr}</strong>),
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

            <Box pb={2} pt={2}>
                <Toolbar>
                    {verifiee ? (
                        <Button variant={"contained"} component="a" href="#/home">Sluiten</Button>
                    ) : (
                            <Button variant={"contained"} component="a" href="#/home">Annuleren</Button>
                        )}
                </Toolbar>
            </Box>
        </div>
    );
}
