import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { PersonCard } from "../../components/PersonCard";
import { useLocalState } from "../../hooks/useLocalState";

export function IncomingAuthReq() {
    const { reqId: id } = useParams();
    const { state } = useLocalState();
    const req = state.incomingAuthReqs.find(r => r.id === id)
    const profile = req && state.profiles[req.subjectId];

    return !req ? <div>Dit verzoek bestaat niet.</div> : (
        <Box p={1}>
            <PersonCard profile={profile!} />

            <Box pt={1} pb={1}>
                <p><strong>{profile!.name}</strong> vraagt de volgende machtiging:</p>
            </Box>

            <AuthorityCard legalEntity={req.legalEntity} authority={req.authority} />

            <FormActions>
                <Button variant={"contained"}>Afwijzen</Button>
                <Button variant={"contained"} color={"primary"}>Machtigen</Button>
            </FormActions>
        </Box>
    );
}
