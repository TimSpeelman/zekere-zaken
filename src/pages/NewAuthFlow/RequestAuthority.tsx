import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from '@material-ui/core/Typography';
import { default as React, useState } from "react";
import uuid from "uuid/v4";
import { BusinessFinder } from "../../components/form/BusinessFinder";
import { KVKAuthorityTypeSelect } from "../../components/form/KVKAuthorityTypeSelect";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";
import { Authority, KVKAuthorityType, LegalEntity } from "../../types/State";

export function RequestAuthority() {
    const classes = useStyles({});
    const [business, setBusiness] = useState<LegalEntity | null>(null);
    const { manager } = useLocalState();
    const [type, setType] = useState<KVKAuthorityType | null>(KVKAuthorityType.Inkoop);
    const [amount, setAmount] = useState(0);

    const handleSubmit = () => {
        if (business && type && amount > 0) {
            const authority: Authority = { type, amount };
            const id = uuid();
            manager.addOutAuthReq({
                authority,
                datetime: new Date(),
                id: id,
                legalEntity: business,
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
                    <BusinessFinder onSelect={(val) => setBusiness(val)} />
                </Box>

                <Box mb={3}>
                    <KVKAuthorityTypeSelect value={type} onChange={setType} />
                </Box>

                <TextField
                    label={"Bedrag"}
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    helperText={"Welk bedrag wil u mogen besteden?"}
                    type={"number"}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">€</InputAdornment>
                    }}
                    fullWidth />
            </Paper>

            <Box pb={2} pt={2}>
                <Toolbar>
                    <Button variant={"contained"} color={"primary"} onClick={handleSubmit}>Doorgaan</Button>
                    <Button variant={"contained"} style={{ marginLeft: 16 }} component="a" href="#/authreqs/outbox">Annuleren</Button>
                </Toolbar>
            </Box>

        </div>
    );
}
