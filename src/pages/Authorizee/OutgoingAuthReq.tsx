import { IconButton } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import DeleteIcon from '@material-ui/icons/Delete';
import { default as React } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useParams } from "react-router-dom";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { useLocalState } from "../../hooks/useLocalState";
import { useWhatsappURL } from "../../hooks/useWhatsappURL";

export function OutgoingAuthReq() {
    const { reqId: id } = useParams();
    const { state, manager } = useLocalState();

    const template = state.outgoingAuthTemplates.find(r => r.id === id)

    const { getURL, getWhatsappURL } = useWhatsappURL();

    const deleteItem = () => {
        if (template) {
            manager.removeOutAuthTemplate(template.id);
            window.location.assign("#/authreqs/outbox");
        }
    }

    return !template ? <div>Dit verzoek bestaat niet</div> : (
        <div>
            {/* <Box p={1}></Box> */}
            <Box pt={1} pb={1}>
                <p>Deel de volgende link om uw bevoegdheid aan te vragen.</p>
            </Box>

            <AuthorityCard legalEntity={template.legalEntity} authority={template.authority} />

            <FormActions>
                <IconButton onClick={deleteItem}><DeleteIcon /></IconButton>

                <CopyToClipboard text={getURL(template)} >
                    <Button variant={"contained"} color={"primary"} component="a" href={getWhatsappURL(template)} target='_blank' >Delen via Whatsapp</Button>
                </CopyToClipboard>
            </FormActions>
        </div>
    );
}
