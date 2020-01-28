import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';
import { default as React, useState } from "react";
import uuid from "uuid/v4";
import { CreateAReqTemplate } from "../../commands/Command";
import { AmountInput } from "../../components/form/AmountInput";
import { BusinessFinder } from "../../components/form/BusinessFinder";
import { KVKAuthorityTypeSelect } from "../../components/form/KVKAuthorityTypeSelect";
import { FormActions } from "../../components/FormActions";
import { OptionalField } from "../../components/OptionalField";
import { useCommand } from "../../hooks/useCommand";
import { useStyles } from "../../styles";
import { Authority, AuthorizationTemplate, KVKAuthorityType, LegalEntity } from "../../types/State";

export function RequestAuthority() {
    const classes = useStyles({});

    const { dispatch } = useCommand();

    const [entity, setEntity] = useState<LegalEntity | null>(null);
    const [type, setType] = useState<KVKAuthorityType | null>(KVKAuthorityType.Inkoop);
    const [amount, setAmount] = useState(1);

    const canSubmit = type && amount > 0;

    const handleSubmit = () => {
        if (type && amount > 0) {
            const authority: Authority = { type, amount };
            const id = uuid();
            const template: AuthorizationTemplate = {
                id: id,
                authority,
                datetime: new Date().toISOString(),
                legalEntity: entity ? entity : undefined,
            };
            dispatch(CreateAReqTemplate({ template }))
            window.location.assign(`#/authreqs/outbox/${id}`);
        }
    }

    return (
        <div>
            <Box p={1}></Box>

            <Typography component="h2" variant="h6" color="inherit">
                Bevoegdheid aanvragen
                        </Typography>
            <p>Omschrijf de bevoegdheid die u wilt aanvragen:</p>

            <Paper className={classes.paper} >
                <Box mb={3}>
                    <KVKAuthorityTypeSelect value={type} onChange={setType} />
                </Box>

                <Box mb={3}>
                    <AmountInput value={amount} onChange={setAmount} helperText={"Welk bedrag wil u mogen besteden?"} />
                </Box>

                <OptionalField label={"Organisatie Specificeren"}>
                    <BusinessFinder onSelect={setEntity} helperText={"Namens welke organisatie wil de persoon handelen?"} />
                </OptionalField>
            </Paper>

            <FormActions>
                <Button component="a" href="#/authreqs/outbox">Annuleren</Button>

                <Button variant={"contained"} color={"primary"} onClick={handleSubmit} disabled={!canSubmit}>Doorgaan</Button>
            </FormActions>
        </div>

    );
}
