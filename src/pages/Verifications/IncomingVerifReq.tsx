import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { PersonCard } from "../../components/PersonCard";
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

    return !req ? <div>Dit verzoek bestaat niet.</div> :
        !profile ? <div>Wacht op profiel van Verifier..</div> : (
            <div>
                <Box p={1}></Box>

                <PersonCard profile={profile!} />

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
