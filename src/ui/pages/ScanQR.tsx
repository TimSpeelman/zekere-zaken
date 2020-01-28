import { TextField } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import React, { useEffect, useState } from 'react';
import QrReader from "react-qr-reader";
import { FormActions } from "../components/FormActions";

interface Props {
    onScanQR: (qr: string) => boolean;
}

export const ScanQR: React.FC<Props> = ({ onScanQR }) => {

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

    return (
        <div>

            {!showManual ? (

                <div style={{ textAlign: "center" }}>
                    <p>Scan een QR Code</p>
                    <p>Let op: op Apple apparaten kan dit alleen in de Safari browser.</p>
                    <Box mb={3}>
                        <QrReader
                            delay={300}
                            onError={handleError}
                            onScan={handleScan}
                            style={{ width: '100%' }}
                        />
                    </Box>

                    <FormActions>
                        <Button component="a" href="#/home">Annuleren</Button>
                        <Button onClick={() => setShowManual(true)}>Handmatig Invoeren</Button>
                    </FormActions>
                </div>
            ) : (
                    <form onSubmit={() => handleScan(manualInput)}>
                        <Box mt={2} mb={2}>
                            <TextField
                                label={"Voer QR Waarde in"}
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                error={!!error}
                                helperText={error}
                                fullWidth
                                autoFocus
                            />
                        </Box>
                        <FormActions>
                            <Button onClick={() => setShowManual(false)}>Annuleren</Button>
                            <Button variant={"contained"} type={"submit"} color={'primary'} disabled={!manualInput}>Doorgaan</Button>
                        </FormActions>
                    </form>
                )}
        </div>
    )
}
