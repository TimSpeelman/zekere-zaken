import { IconButton } from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import QRCode from "qrcode.react";
import { default as React, useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useParams } from "react-router-dom";
import { RemoveVReqTemplate } from "../../commands/Command";
import { AspectRatio } from "../../components/AspectRatio";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { useCommand } from "../../hooks/useCommand";
import { useIdentityGateway } from "../../hooks/useIdentityGateway";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";

export function OutgoingVerifReq() {
    const classes = useStyles({});
    const { reqId: id } = useParams();
    const { dispatch } = useCommand();
    const { state } = useLocalState();
    const { gateway: idGateway } = useIdentityGateway();
    const req = state.outgoingVerifTemplates.find(r => r.id === id)

    const [qrValue, setQR] = useState("");
    useEffect(() => {
        if (req) {
            const reference = req.id;
            const senderId = idGateway.me!.id
            setQR(JSON.stringify({ reference, senderId }));
        }
    }, [req])

    // const [verifiee, setVerifiee] = useState<Actor | null>(null);

    const mockVerifiee = () => { /* setVerifiee(Joep); */ }

    const verified = state.verified.find(v => v.templateId === id);
    const session = verified && state.negotiations.find(n => n.sessionId === verified?.sessionId);
    const verifiee = session && state.profiles[session.subjectId];
    const verifiedSpec = session && session.conceptSpec!;

    const deleteItem = () => {
        if (req) {
            dispatch(RemoveVReqTemplate({ templateId: req.id }))

            window.location.assign("#/verifs/outbox");
        }
    }

    return !req ? <div>Dit verzoek bestaat niet. </div> : (
        <div>
            {/* <Box p={1}></Box> */}
            <Box pt={1} pb={1}>
                {!verifiee && <p >Deel deze <CopyToClipboard text={qrValue} onCopy={() => console.log("Copied to clipboard:", qrValue)}><strong>QR</strong></CopyToClipboard> code met de te <span onClick={mockVerifiee}>verifiëren</span> persoon:</p>}
            </Box>
            <Paper className={classes.paper} >
                {!verifiee ? (
                    <CopyToClipboard text={qrValue} onCopy={() => console.log("Copied to clipboard:", qrValue)}>
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
            </Paper>

            <AuthorityCard legalEntity={verifiee ? verifiedSpec?.legalEntity : req.legalEntity}
                authority={verifiedSpec ? verifiedSpec.authority! : req.authority} />

            <FormActions>
                <IconButton onClick={deleteItem}><DeleteIcon /></IconButton>

                <Button component="a" href="#/home">Sluiten</Button>
            </FormActions>
        </div>
    );
}
