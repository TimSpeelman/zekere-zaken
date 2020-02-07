import { IconButton, List, ListItem } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DeleteIcon from '@material-ui/icons/Delete';
import { default as React, useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useHistory, useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { PageTitle } from "../../components/PageTitle";
import { useLocalState } from "../../hooks/useLocalState";
import { useWhatsappURL } from "../../hooks/useWhatsappURL";

export function OutgoingAuthReq() {
    const { reqId: id } = useParams();
    const history = useHistory();
    const { state, manager } = useLocalState();

    const template = state.outgoingAuthTemplates.find(r => r.id === id)

    const { getURL, getWhatsappURL } = useWhatsappURL();

    useEffect(() => {
        if (template?.answeredWithAuthorizationId) {
            history.replace(`/my-authorizations/${template!.answeredWithAuthorizationId}`);
        }
    }, [template])

    const deleteItem = () => {
        if (template) {
            manager.removeOutAuthTemplate(template.id);
            history.replace("/authreqs/outbox");
        }
    }

    return !template ? <div>Dit verzoek bestaat niet</div> : (
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 1000, enter: 100, exit: 1 }}
            classNames={"items"}
        >
            <div>
                <PageTitle title={"Mijn Machtigingsverzoek"} showBackButton backURL="/authreqs/outbox" />

                <div className="enter-item">
                    <AuthorityCard title={"Uw Machtigingsverzoek"} legalEntity={template.legalEntity} authority={template.authority} authType="authorizationRequest" />
                </div>

                <List >
                    <ListItem disabled>Dit verzoek is nog niet beantwoord. Deel dit verzoek via Whatsapp met een bevoegd persoon, om u te laten machtigen.</ListItem>
                </List>

                <FormActions>
                    <IconButton onClick={deleteItem}><DeleteIcon /></IconButton>

                    <CopyToClipboard text={getURL(template)} >
                        <Button variant={"contained"} color={"primary"} component="a" href={getWhatsappURL(template)} target='_blank' >Delen via Whatsapp</Button>
                    </CopyToClipboard>
                </FormActions>
            </div>
        </CSSTransition>
    );
}
