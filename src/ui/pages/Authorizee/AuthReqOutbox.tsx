import { Box, Button } from "@material-ui/core";
import { default as React } from "react";
import { AuthorityCard } from "../../components/AuthorityCard";
import { PageTitle } from "../../components/PageTitle";
import { useSelector } from "../../hooks/useSelector";
import { selectMyAuthorizations } from "../../selectors/selectMyAuthorizations";
import { selectOpenAuthTemplates } from "../../selectors/selectOpenAuthTemplates";

export function AuthReqOutbox() {
    const templates = useSelector(selectOpenAuthTemplates) || [];
    const auths = useSelector(selectMyAuthorizations) || [];
    return (
        <div>
            <PageTitle title={"Mijn Bevoegdheden"} backURL={"#/home"} />

            {auths.length === 0 &&
                <div className="empty-message">U heeft nog geen bevoegdheden.</div>}

            {auths.map(auth => (
                <a href={`#/my-authorizations/${auth.id}`} className="invisible-link">
                    <AuthorityCard authority={auth.authority} legalEntity={auth.legalEntity} authType="authorization" />
                </a>
            ))}

            <Box style={{ textAlign: "center" }} mt={2} mb={2} >
                <Button variant="outlined" component="a" href="#/authreqs/new">Bevoegdheid Aanvragen</Button>
            </Box>


            {templates.length > 0 && (
                <div>
                    <div className="subheader">
                        Mijn Onbeantwoorde Aanvragen
                    </div>
                    {templates.map(req => (
                        <a href={`#/authreqs/outbox/${req.id}`} className="invisible-link">
                            <AuthorityCard authority={req.authority} legalEntity={req.legalEntity} authType="authorizationRequest" />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
