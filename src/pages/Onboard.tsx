import { Box, Button, FormControl, InputLabel, Paper, TextField } from "@material-ui/core";
import imageCompression from "browser-image-compression";
import { default as React, useState } from "react";
import { AspectRatio } from "../components/AspectRatio";
import { FormActions } from "../components/FormActions";
import { useLocalState } from "../hooks/useLocalState";
import { useStyles } from "../styles";

const reader = new FileReader();
const reader2 = new FileReader();

export function Onboard() {

    const [name, setName] = useState("");
    const [photo, setPhoto] = useState(localStorage.getItem("photo"));
    const { manager } = useLocalState();
    const classes = useStyles({});

    function handleChangePhoto(e: any) {
        console.log(e.target.files);
        reader.onloadend = function () {
            console.log("result", reader.result);
            const dataUrl = reader.result;
            imageCompression.getFilefromDataUrl(dataUrl).then((file: File) => {
                imageCompression(file, {
                    maxWidthOrHeight: 400,
                    maxSizeMB: 0.2,
                }).then((file: File) => {
                    reader2.onloadend = function () {
                        // @ts-ignore
                        setPhoto(reader2.result);
                        // @ts-ignore
                        window.localStorage.setItem('photo', reader2.result);
                    }
                    reader2.readAsDataURL(file);
                })
            })
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    const canSubmit = photo && name;
    const handleSubmit = () => {
        if (canSubmit && photo && name) {
            manager.storeProfile({ photo, name })
            window.location.assign(`#/home`);
        }
    };

    return (
        <div>
            <Box p={1}></Box>

            <p>Voor deze demo maakt u handmatig uw profiel aan. In volgende versies zullen deze gegevens echter uit uw paspoort komen.</p>

            <Paper className={classes.paper} >
                <Box mb={3}>
                    <FormControl fullWidth>
                        <InputLabel shrink>Pasfoto</InputLabel>
                        <Box pt={3}>
                            {!photo ? "" : (
                                <AspectRatio heightOverWidth={1} style={{
                                    overflow: "hidden",
                                    backgroundImage: `url(${photo})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}>
                                </AspectRatio>
                            )}

                            <Button color="primary" component="label" fullWidth>
                                {!photo ? "Maak Pasfoto" : "Wijzigen"}
                                <input type="file" accept="image/*" onChange={handleChangePhoto} style={{ display: "none" }}></input>
                            </Button>
                        </Box>
                    </FormControl>
                </Box>
                <Box mb={3}>
                    <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)} label={"Uw Naam"}
                        fullWidth />
                </Box>
            </Paper>

            <FormActions>
                <div></div>
                <Button variant={"contained"} color={"primary"}
                    disabled={!canSubmit}
                    onClick={handleSubmit}>Opslaan</Button>
            </FormActions>
        </div>

    );
}
