import { Paper, TextField } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import React, { useEffect, useState } from 'react';
import QrReader from "react-qr-reader";
import { useHistory } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { useStyles } from "../../../styles";
import { FormActions } from "../../components/FormActions";
import { PageTitle } from "../../components/PageTitle";

interface Props {
    onScanQR: (qr: string) => boolean;
}

export const ScanQR: React.FC<Props> = ({ onScanQR }) => {

    const classes = useStyles();

    const [lastScan, setLastScan] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleScan = (data: string | null) => {
        if (data) {
            if (!onScanQR(data)) {
                console.log("Err");
                setError("Ongeldige of onbruikbare QR code");
            } else {
                setLastScan(data);
            }
        }
    }


    const handleError = (err: any) => {
        console.error(err)
    }

    const [manualInput, setManualInput] = useState<string>("");
    const [showManual, setShowManual] = useState<boolean>(false);

    // Clear the error when we do another attempt
    useEffect(() => setError(""), [manualInput, lastScan]);

    const history = useHistory();

    return (
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 3000, enter: 1, exit: 1 }}
            classNames={"items"}
        >
            <div>
                <PageTitle
                    title={"Scan een QR Code"}
                    sub={"Let op: op Apple apparaten kan dit alleen in de Safari browser."}
                    onQuit={() => history.goBack()} />

                {!showManual ? (

                    <div style={{ textAlign: "center" }}>
                        <Box mb={3}>
                            <QrReader
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                style={{ width: '100%', background: "black" }}
                            />
                        </Box>

                        <FormActions>
                            <Button color="inherit" component="a" href="#/home">Annuleren</Button>
                            <Button color="inherit" onClick={() => setShowManual(true)}>Handmatig Invoeren</Button>
                        </FormActions>
                    </div>
                ) : (
                        <form onSubmit={() => handleScan(manualInput)}>
                            <Box mt={2} mb={2}>
                                <Paper className={classes.paper}>
                                    <TextField
                                        label={"Voer QR Waarde in"}
                                        value={manualInput}
                                        onChange={(e) => setManualInput(e.target.value)}
                                        error={!!error}
                                        helperText={error}
                                        fullWidth
                                        autoFocus
                                    />
                                </Paper>
                            </Box>
                            <FormActions>
                                <Button color="inherit" onClick={() => setShowManual(false)}>Annuleren</Button>
                                <Button color="inherit" variant={"contained"} type={"submit"} disabled={!manualInput}>Doorgaan</Button>
                            </FormActions>
                        </form>
                    )}
            </div>
        </CSSTransition>
    )
}
