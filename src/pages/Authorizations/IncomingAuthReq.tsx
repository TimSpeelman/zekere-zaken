import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { useLocalState } from "../../hooks/useLocalState";
import { useStyles } from "../../styles";

export function IncomingAuthReq() {
    const { reqId: id } = useParams();
    const { state } = useLocalState();
    const classes = useStyles({});
    const req = state.incomingAuthReqs.find(r => r.id === id)

    return !req ? <div>Dit verzoek bestaat niet.</div> : (
        <div>
            <Box p={1}></Box>
            <Paper className={classes.paper} >

                <Box
                    display="flex"
                    alignItems="center"
                    bgcolor="background.paper"
                    css={{ height: 100 }}
                >
                    <Box p={1}>
                        <Avatar src="http://bwphoto.nl/wp-content/uploads/2017/07/pasfoto-bianca.jpg"
                            style={{ width: 80, height: 80 }} />
                    </Box>
                    <Box p={1}>
                        <Typography component="h2" variant="h6" color="inherit">
                            {req.from.name}
                        </Typography>
                    </Box>

                </Box>


            </Paper>

            <Box pt={1} pb={1}>
                <p><strong>{req.from.name}</strong> vraagt de volgende machtiging:</p>
            </Box>

            <AuthorityCard legalEntity={req.legalEntity} authority={req.authority} />

            <FormActions>
                <Button variant={"contained"}>Afwijzen</Button>
                <Button variant={"contained"} color={"primary"}>Machtigen</Button>
            </FormActions>
        </div>
    );
}
