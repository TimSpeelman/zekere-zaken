import { Divider } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { default as React, useState } from "react";
import uuid from "uuid/v4";
import { CreateVReqTemplate } from "../../../commands/Command";
import { useStyles } from "../../../styles";
import { KVKAuthorityType, LegalEntity } from "../../../types/State";
import vreqIcon from "../../assets/images/shield-vreq.svg";
import { AmountInput } from "../../components/form/AmountInput";
import { BusinessFinder } from "../../components/form/BusinessFinder";
import { KVKAuthorityTypeSelect } from "../../components/form/KVKAuthorityTypeSelect";
import { FormActions } from "../../components/FormActions";
import { OptionalField } from "../../components/OptionalField";
import { PageTitle } from "../../components/PageTitle";
import { useCommand } from "../../hooks/useCommand";

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
            <PageTitle
                title={"Verifiëren"}
                sub={"Omschrijf de bevoegdheid die u wilt controleren"}
                icon={<img src={vreqIcon} style={{ height: 100 }} />}
                onQuit={() => window.location.assign("#/home")}
            />

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
                <Button onClick={onCancel} color="inherit">Annuleren</Button>
                <Button variant={"contained"} color="inherit" style={{ color: "#2E3192" }}
                    disabled={!canSubmit} onClick={handleSubmit}>Volgende</Button>
            </FormActions>

            <Divider />

            <Box style={{ textAlign: "center" }} mt={2}>
                <Button color="inherit" component="a" href="#/verifs/outbox">Toon Verificatiegeschiedenis</Button>
            </Box>
        </div>
    );
}
