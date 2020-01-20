import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from '@material-ui/core/Typography';
import EditIcon from "@material-ui/icons/Edit";
import { default as React, useState } from "react";
import { BusinessFinder } from "../../components/BusinessFinder";
import { useStyles } from "../../styles";
import { LegalEntity } from "../../types/State";

interface Props {
    onSucceed: (legalEntity: LegalEntity) => void,
    onCancel: () => void,
}

export function SelectBusiness({ onSucceed, onCancel }: Props) {
    const classes = useStyles({});
    const [selectedBusiness, setSelectedBusiness] = useState<LegalEntity | null>(null);
    const business = selectedBusiness
    return (
        <div>
            <Box p={1}></Box>

            <Typography component="h2" variant="h6" color="inherit">
                Stap 1: Selecteer het bedrijf
            </Typography>

            <p>Namens welk bedrijf moet de persoon gemachtigd zijn?</p>

            {!selectedBusiness ? (
                <div>
                    <BusinessFinder onSelect={(val) => setSelectedBusiness(val)} />

                    <Box style={{ textAlign: "center" }} mt={6}>
                        <Button variant="outlined" component="a" href="#/verifs/outbox">Verificatiegeschiedenis</Button>
                    </Box>
                </div>
            ) : (
                    <div>
                        <Paper className={classes.paper} >
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Typography component="h2" variant="h6" color="inherit">
                                    {business!.name}
                                </Typography>
                                <IconButton onClick={() => setSelectedBusiness(null)}><EditIcon /></IconButton>
                            </Box>

                            <List dense >
                                <ListItem >
                                    <ListItemText
                                        primary={business!.kvknr}
                                        secondary={"KVK Nummer"} />
                                </ListItem>
                                <ListItem >
                                    <ListItemText
                                        primary={business!.address}
                                        secondary={"Vestigingsadres"} />
                                </ListItem>
                            </List>
                        </Paper>

                        <Box pb={2} pt={2}>
                            <Toolbar>
                                <Button variant={"contained"} color={"primary"} disabled={!business}
                                    onClick={() => business && onSucceed(business)}>Doorgaan</Button>

                                <Button variant={"contained"} style={{ marginLeft: 16 }}
                                    onClick={() => onCancel()}>Annuleren</Button>
                            </Toolbar>
                        </Box>
                    </div>
                )}


        </div>
    );
}
