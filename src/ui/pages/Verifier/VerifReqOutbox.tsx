import { Box, Button } from "@material-ui/core";
import { default as React } from "react";
import { AuthorityCard } from "../../components/AuthorityCard";
import { PageTitle } from "../../components/PageTitle";
import { useLocalState } from "../../hooks/useLocalState";

export function VerifReqOutbox() {
    const { state } = useLocalState();
    const reqs = state.outgoingVerifTemplates;

    return (
        <div>
            <PageTitle
                title={"Verificatiegeschiedenis"}
                backURL={"#/verifs/new"}
            />

            {reqs.length === 0 && <div className="empty-message">Uw verificatiegeschiedenis is leeg.</div>}
            {reqs.map(req => (
                <a href={`#/verifs/outbox/${req.id}`} className="invisible-link">
                    <AuthorityCard
                        authority={req.authority}
                        legalEntity={req.legalEntity}
                        authType="verification"
                    />
                </a>
            ))}

            <Box mt={3} style={{ textAlign: "center" }}>
                <Button variant={"outlined"} color="inherit" component="a" href="#/verifs/new">Nieuwe Verificatie</Button>
            </Box>
        </div>
    );
}
