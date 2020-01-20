import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Toolbar from "@material-ui/core/Toolbar";
import AddIcon from '@material-ui/icons/Add';
import { default as React, useState } from "react";
import uuid from "uuid/v4";
import { AmountInput } from "../../components/form/AmountInput";
import { BusinessFinder } from "../../components/form/BusinessFinder";
import { KVKAuthorityTypeSelect } from "../../components/form/KVKAuthorityTypeSelect";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";
import { Authority, KVKAuthorityType, LegalEntity } from "../../types/State";

export function NewVerification() {
    const classes = useStyles({});

    const { manager } = useLocalState();

    const [chooseEntity, setChooseEntity] = useState(false);
    const [type, setType] = useState<KVKAuthorityType | null>(KVKAuthorityType.Inkoop);
    const [amount, setAmount] = useState(1);
    const [entity, setEntity] = useState<LegalEntity | null>(null);

    const canSubmit = type !== null && amount > 0;

    const handleSubmit = () => {
        if (type) {
            const requestId = uuid();

            const authority: Authority = { type, amount };

            manager.addOutVerifReq({
                authority,
                datetime: new Date(),
                id: requestId,
                legalEntity: entity!, // FIXME
            });

            window.location.assign(`#/verifs/outbox/${requestId}`);
        }
    }

    const onCancel = () => {
        window.location.assign("#/home");
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

                {chooseEntity ?
                    (
                        <BusinessFinder onSelect={setEntity} helperText={"Namens welke organisatie wil de persoon handelen?"} />
                    ) : (
                        <Button startIcon={<AddIcon />} onClick={() => setChooseEntity(true)}>Organisatie Specificeren</Button>
                    )}
            </Paper>

            <Box pb={2} pt={2}>
                <Toolbar style={{ display: "flex", justifyContent: "center" }}>
                    <Button variant={"contained"} color={"primary"}
                        disabled={!canSubmit}
                        onClick={handleSubmit}>Doorgaan</Button>

                    <Button variant={"contained"} style={{ marginLeft: 16 }}
                        onClick={onCancel}>Annuleren</Button>
                </Toolbar>
            </Box>

            <Box style={{ textAlign: "center" }} mt={3}>
                <Button variant="outlined" component="a" href="#/verifs/outbox">Verificatiegeschiedenis</Button>
            </Box>

        </div>
    );
}
