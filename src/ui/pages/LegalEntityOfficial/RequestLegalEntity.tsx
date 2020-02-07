import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { default as React, useState } from "react";
import { CSSTransition } from "react-transition-group";
import uuid from "uuid/v4";
import { useStyles } from "../../../styles";
import { LegalEntity, LegalEntityAttestation } from "../../../types/State";
import iconAuthReq from "../../assets/images/shield-authreq-v3.svg";
import { BusinessFinder } from "../../components/form/BusinessFinder";
import { FormActions } from "../../components/FormActions";
import { PageTitle } from "../../components/PageTitle";
import { useCommand } from "../../hooks/useCommand";
import { useLocalState } from "../../hooks/useLocalState";

export function RequestLegalEntity() {
    const classes = useStyles({});

    const { dispatch } = useCommand();

    const [entity, setEntity] = useState<LegalEntity | null>(null);
    const { manager } = useLocalState();

    const canSubmit = !!entity;

    const handleSubmit = () => {
        if (!!entity) {
            const id = uuid();

            // FIXME MOCKED
            const attest: LegalEntityAttestation = { entity, id };
            manager.setState((s) => ({ myLegalEntities: [...s.myLegalEntities, attest] }))

            window.location.assign(`#/my-legal-entities/${id}`);
        }
    }

    return (
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 1000, enter: 100, exit: 1 }}
            classNames={"items"}
        >
            <div>
                <PageTitle
                    title={"Organisatie Toevoegen"}
                    sub={"Voeg een volmacht toe van een organisatie waar u functionaris van bent."}
                    icon={<img src={iconAuthReq} style={{ height: 100 }} />}
                    showBackButton backURL="/authreqs/outbox" />

                <div className="enter-item">
                    <Paper className={classes.paper} >
                        <BusinessFinder onSelect={setEntity} />
                    </Paper>
                </div>

                <FormActions>
                    <Button component="a" href="#/authreqs/outbox">Annuleren</Button>

                    <Button variant={"contained"} color={"primary"} onClick={handleSubmit} disabled={!canSubmit}>Doorgaan</Button>
                </FormActions>
            </div>
        </CSSTransition>
    );
}
