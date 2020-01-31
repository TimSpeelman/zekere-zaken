import { IconButton, List, ListItem } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import DeleteIcon from '@material-ui/icons/Delete';
import { default as React, useEffect } from "react";
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

    useEffect(() => {
        if (template?.answeredWithAuthorizationId) {
            window.location.assign(`#/my-authorizations/${template!.answeredWithAuthorizationId}`);
        }
    }, [template])

    const deleteItem = () => {
        if (template) {
            manager.removeOutAuthTemplate(template.id);
            window.location.assign("#/authreqs/outbox");
        }
    }

    return !template ? <div>Dit verzoek bestaat niet</div> : (
        <Box pt={3}>
            <AuthorityCard title={"Machtigingsverzoek"} legalEntity={template.legalEntity} authority={template.authority} />

            <List >
                <ListItem disabled>Dit verzoek is nog niet beantwoord.</ListItem>
            </List>

            <FormActions>
                <IconButton onClick={deleteItem}><DeleteIcon /></IconButton>

                <CopyToClipboard text={getURL(template)} >
                    <Button variant={"contained"} color={"primary"} component="a" href={getWhatsappURL(template)} target='_blank' >Delen via Whatsapp</Button>
                </CopyToClipboard>
            </FormActions>
        </Box>
    );
}
