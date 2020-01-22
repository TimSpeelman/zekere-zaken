import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import { default as React, useState } from "react";
import uuid from "uuid/v4";
import { AmountInput } from "../../components/form/AmountInput";
import { BusinessFinder } from "../../components/form/BusinessFinder";
import { KVKAuthorityTypeSelect } from "../../components/form/KVKAuthorityTypeSelect";
import { FormActions } from "../../components/FormActions";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";
import { Authority, KVKAuthorityType, LegalEntity } from "../../types/State";

export function RequestAuthority() {
    const classes = useStyles({});
    const [entity, setEntity] = useState<LegalEntity | null>(null);
    const [chooseEntity, setChooseEntity] = useState(false);

    const { manager } = useLocalState();
    const [type, setType] = useState<KVKAuthorityType | null>(KVKAuthorityType.Inkoop);
    const [amount, setAmount] = useState(1);

    const canSubmit = type && amount > 0;

    const handleSubmit = () => {
        if (type && amount > 0) {
            const authority: Authority = { type, amount };
            const id = uuid();
            manager.addOutAuthReq({
                authority,
                datetime: new Date().toISOString(),
                id: id,
                legalEntity: entity ? entity : undefined,
            });
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

                {chooseEntity ?
                    (
                        <BusinessFinder onSelect={setEntity} helperText={"Namens welke organisatie wil de persoon handelen?"} />
                    ) : (
                        <Button startIcon={<AddIcon />} onClick={() => setChooseEntity(true)}>Organisatie Specificeren</Button>
                    )}
            </Paper>

            <FormActions>
                <Button component="a" href="#/authreqs/outbox">Annuleren</Button>

                <Button variant={"contained"} color={"primary"} onClick={handleSubmit} disabled={!canSubmit}>Doorgaan</Button>
            </FormActions>
        </div>

    );
}
