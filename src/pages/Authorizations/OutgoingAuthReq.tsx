import { IconButton } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import DeleteIcon from '@material-ui/icons/Delete';
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { useLocalState } from "../../hooks/useLocalState";
import { useWhatsappURL } from "../../hooks/useWhatsappURL";

export function OutgoingAuthReq() {
    const { reqId: id } = useParams();
    const { state, manager } = useLocalState();
    const req = state.outgoingAuthReqs.find(r => r.id === id)

    const { getURL } = useWhatsappURL();

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

            <AuthorityCard legalEntity={req.legalEntity} authority={req.authority} />

            <FormActions>
                <IconButton onClick={deleteItem}><DeleteIcon /></IconButton>

                <Button variant={"contained"} color={"primary"} component="a" href={getURL(req)} >Delen via Whatsapp</Button>
            </FormActions>
        </div>
    );
}
