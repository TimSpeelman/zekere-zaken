import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { useLocalState } from "../../hooks/useLocalState";
import { useWhatsappURL } from "../../hooks/useWhatsappURL";
import { useStyles } from "../../styles";

export function IncomingVerifReq() {
    const { reqId: id } = useParams();
    const { state } = useLocalState();
    const classes = useStyles({});
    const req = state.incomingVerifReqs.find(r => r.id === id)
    const profile = req && state.profiles[req.verifierId];

    const { getURL } = useWhatsappURL();

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
                        <Avatar src={profile!.photo}
                            style={{ width: 60, height: 60 }} />
                    </Box>
                    <Box p={1}>
                        <Typography component="h2" variant="h6" color="inherit">
                            {profile!.name}
                        </Typography>
                    </Box>

                </Box>


            </Paper>

            <Box pt={1} pb={1}>
                <p><strong>{profile!.name}</strong> wil uw bevoegdheid controleren voor het volgende:</p>
            </Box>

            <AuthorityCard legalEntity={req.legalEntity} authority={req.authority} />

            <Box pt={1} pb={1} className={classes.warning}>
                <p>Deze bevoegdheid zit niet in uw wallet. </p>
            </Box>

            <FormActions>
                <Button component="a" href="#/home">Annuleren</Button>
                <Button variant={"contained"} color={"primary"} component="a" href={getURL(req)}>Aanvragen</Button>
            </FormActions>
        </div>
    );
}
