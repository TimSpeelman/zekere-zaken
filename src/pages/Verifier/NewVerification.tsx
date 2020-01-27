import { Divider } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { default as React, useState } from "react";
import uuid from "uuid/v4";
import { CreateVReqTemplate } from "../../commands/Command";
import { AmountInput } from "../../components/form/AmountInput";
import { BusinessFinder } from "../../components/form/BusinessFinder";
import { KVKAuthorityTypeSelect } from "../../components/form/KVKAuthorityTypeSelect";
import { FormActions } from "../../components/FormActions";
import { OptionalField } from "../../components/OptionalField";
import { useCommand } from "../../hooks/useCommand";
import { useStyles } from "../../styles";
import { KVKAuthorityType, LegalEntity } from "../../types/State";

export function NewVerification() {
    const classes = useStyles({});
    const { dispatch } = useCommand();

    const onCancel = () => window.location.assign("#/home");

    // Form Data
    const [type, setType] = useState<KVKAuthorityType | null>(KVKAuthorityType.Inkoop);
    const [amount, setAmount] = useState(1);
    const [legalEntity, setEntity] = useState<LegalEntity | null>(null);

    const canSubmit = type !== null && amount > 0;

    const handleSubmit = () => {
        if (type) {
            const templateId = uuid();

            dispatch(CreateVReqTemplate({
                template: {
                    id: templateId,
                    datetime: new Date().toISOString(),
                    authority: { type, amount },
                    legalEntity: legalEntity || undefined,
                },
            }));

            window.location.assign(`#/verifs/outbox/${templateId}`);
        }
    }

    return (
        <div>
            <Box p={1}></Box>

            <p>Omschrijf de bevoegdheid die u wilt verifiëren?</p>

            <Paper className={classes.paper} >
                <Box mb={3}>
                    <KVKAuthorityTypeSelect value={type} onChange={setType} helperText={"Welke handeling wil de persoon uitvoeren?"} />
                </Box>
                <Box mb={3}>
                    <AmountInput value={amount} onChange={setAmount} helperText={"Welk bedrag wil de persoon besteden?"} />
                </Box>
                <OptionalField label={"Organisatie Specificeren"}>
                    <BusinessFinder onSelect={setEntity} helperText={"Namens welke organisatie wil de persoon handelen?"} />
                </OptionalField>
            </Paper>

            <FormActions>
                <Button onClick={onCancel}>Annuleren</Button>
                <Button variant={"contained"} color={"primary"} disabled={!canSubmit} onClick={handleSubmit}>Volgende</Button>
            </FormActions>

            <Divider />

            <Box style={{ textAlign: "center" }} mt={2}>
                <Button component="a" href="#/verifs/outbox">Toon Verificatiegeschiedenis</Button>
            </Box>
        </div>
    );
}
