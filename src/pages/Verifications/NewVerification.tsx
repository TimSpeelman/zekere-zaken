import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import AddIcon from '@material-ui/icons/Add';
import { default as React, useState } from "react";
import uuid from "uuid/v4";
import { BusinessFinder } from "../../components/form/BusinessFinder";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";
import { Authority, KVKAuthorityType, LegalEntity } from "../../types/State";

export function NewVerification() {
    const classes = useStyles({});

    const { manager } = useLocalState();

    const [chooseEntity, setChooseEntity] = useState(false);
    const [type, setType] = useState<KVKAuthorityType | null>(KVKAuthorityType.Inkoop);
    const [amount, setAmount] = useState(0);
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

            {/* <Typography component="h2" variant="h6" color="inherit">
                
            </Typography> */}
            <p>Welke bevoegdheid moet de persoon hebben?</p>

            <Paper className={classes.paper} >
                <Box mb={3}>
                    <FormControl fullWidth>
                        <InputLabel>Type Handeling</InputLabel>
                        <Select
                            value={type || ""}
                            fullWidth
                            onChange={e => setType(e.target.value as KVKAuthorityType)}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={KVKAuthorityType.Inkoop}>Inkoop</MenuItem>
                            <MenuItem value={KVKAuthorityType.Verkoop}>Verkoop</MenuItem>
                            <MenuItem value={KVKAuthorityType.Garantie}>Garantie</MenuItem>
                            <MenuItem value={KVKAuthorityType.Lease}>Lease</MenuItem>
                            <MenuItem value={KVKAuthorityType.Financiering}>Financiering</MenuItem>
                            <MenuItem value={KVKAuthorityType.Onderhoud}>Onderhoud</MenuItem>
                            <MenuItem value={KVKAuthorityType.Software}>Software</MenuItem>
                        </Select>
                        <FormHelperText>Welke handeling wil de persoon uitvoeren?</FormHelperText>
                    </FormControl>
                </Box>

                <Box mb={3}>
                    <TextField
                        label={"Bedrag"}
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                        helperText={"Welk bedrag wil de persoon besteden?"}
                        type={"number"}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">€</InputAdornment>
                        }}
                        fullWidth />
                </Box>

                {chooseEntity ?
                    (
                        <BusinessFinder onSelect={setEntity} />
                    ) : (
                        <Button startIcon={<AddIcon />} onClick={() => setChooseEntity(true)}>Organisatie Specificeren</Button>
                    )}
            </Paper>

            <Box pb={2} pt={2}>
                <Toolbar>
                    <Button variant={"contained"} color={"primary"}
                        disabled={!canSubmit}
                        onClick={handleSubmit}>Doorgaan</Button>

                    <Button variant={"contained"} style={{ marginLeft: 16 }}
                        onClick={onCancel}>Annuleren</Button>
                </Toolbar>
            </Box>

        </div>
    );
}
