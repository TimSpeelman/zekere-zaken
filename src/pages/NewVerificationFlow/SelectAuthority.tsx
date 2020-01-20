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
import Typography from '@material-ui/core/Typography';
import { default as React, useState } from "react";
import { useStyles } from "../../styles";
import { Authority, KVKAuthorityType } from "../../types/State";

interface Props {
    onSucceed: (authority: Authority) => void,
    onCancel: () => void,
}

export function SelectAuthority({ onSucceed, onCancel }: Props) {
    const classes = useStyles({});
    const [type, setType] = useState<KVKAuthorityType | null>(KVKAuthorityType.Inkoop);
    const [amount, setAmount] = useState(0);

    const canSubmit = type !== null && amount > 0;
    const handleSubmit = () =>
        canSubmit && type !== null &&
        onSucceed({ amount, type })

    return (
        <div>
            <Box p={1}></Box>

            <Typography component="h2" variant="h6" color="inherit">
                Stap 2: Gewenste Bevoegdheid
                        </Typography>
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
