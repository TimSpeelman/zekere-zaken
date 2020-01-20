import { TextField } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import QRCode from "qrcode.react";
import React, { useState } from 'react';
import QrReader from "react-qr-reader";

interface Props {
    onScanQR: (qr: string) => any;
}

export const ScanQR: React.FC<Props> = ({ onScanQR }) => {

    const [lastScan, setLastScan] = useState<string>("");
    const handleScan = (data: string | null) => {
        if (data) {
            setLastScan(data);
            onScanQR(data);
        }
    }

    const handleError = (err: any) => {
        console.error(err)
    }

    const [manualInput, setManualInput] = useState<string>("");
    const [showManual, setShowManual] = useState<boolean>(false);

    return (
        <div>

            {!showManual ? (
                !lastScan ? (
                    <div style={{ textAlign: "center" }}>
                        <p>Scan een QR Code</p>
                        <Box mb={3}>
                            <QrReader
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                style={{ width: '100%' }}
                            />
                        </Box>
                        <Box mb={3}><Button variant={"outlined"} onClick={() => setShowManual(true)}>Handmatig Invoeren</Button></Box>
                        <Box mb={3}><Button variant={"contained"} component="a" href="#/home">Annuleren</Button></Box>
                    </div>
                ) : (
                        <div>
                            <p>Je hebt deze code gescand:</p>
                            <QRCode value={lastScan} size={256} level={"M"} />
                            <p>Met als inhoud: <code>{lastScan}</code></p>
                            <Box mb={3}><Button variant={"contained"} color={'primary'} onClick={() => onScanQR(lastScan)}>Doorgaan</Button></Box>
                            <Box mb={3}><Button variant={"contained"} onClick={() => setLastScan("")}>Opnieuw Proberen</Button></Box>
                            <Button variant={"contained"} component="a" href="#/home">Annuleren</Button>
                        </div>
                    )
            ) : (
                    <form onSubmit={() => onScanQR(manualInput)}>
                        <TextField label={"Voer QR Waarde in"}
                            value={manualInput} onChange={(e) => setManualInput(e.target.value)} />
                        <br />
                        <br />
                        <Box mb={3}><Button variant={"contained"} type={"submit"} color={'primary'} >Doorgaan</Button></Box>
                        <Button variant={"contained"} onClick={() => setShowManual(false)}>Annuleren</Button>
                    </form>
                )}
        </div>
    )
}
