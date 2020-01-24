import { Chip, List, ListItem, ListItemText } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import CheckIcon from "@material-ui/icons/Check";
import { isEqual, uniqWith } from "lodash";
import { default as React, Fragment } from "react";
import { useParams } from "react-router-dom";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { PersonCard } from "../../components/PersonCard";
import { useLocalState } from "../../hooks/useLocalState";
import { useSelector } from "../../hooks/useSelector";
import { useWhatsappURL } from "../../hooks/useWhatsappURL";
import { selectMatchingAuthorizations } from "../../selectors/selectMatchingAuthorizations";
import { useStyles } from "../../styles";
import { LegalEntity } from "../../types/State";

export function IncomingVerifReq() {
    console.log("Render");

    const { reqId: id } = useParams();
    const { state } = useLocalState();
    const classes = useStyles({});
    const req = state.incomingVerifReqs.find(r => r.id === id)
    const profile = req && state.profiles[req.verifierId];

    const auths = useSelector((s) => !req ? [] : selectMatchingAuthorizations(req)(s));
    const entities = uniqWith(auths.map((a) => a.legalEntity), isEqual);

    const canChooseCompany = entities.length > 1;

    const { getURL } = useWhatsappURL();

    function goVerify(entity: LegalEntity) {
        // TODO
    }

    return !req ? <div>Dit verzoek bestaat niet.</div> :
        !profile ? <div>Wacht op profiel van Verifier..</div> : (
            <div>
                <Box p={1}></Box>

                <PersonCard profile={profile!} />

                <Box pt={1} pb={1}>
                    <p><strong>{profile!.name}</strong> wil uw bevoegdheid controleren voor het volgende:</p>
                </Box>

                <AuthorityCard legalEntity={req.legalEntity} authority={req.authority} />

                {auths.length === 0 && // When we ZERO authorizations, we can ask the Subject to request one.
                    <Fragment>
                        <Box pt={1} pb={1} className={classes.warning}>
                            <p>Deze bevoegdheid zit niet in uw wallet. </p>
                        </Box>
                        <FormActions>
                            <Button component="a" href="#/home">Annuleren</Button>
                            <Button variant={"contained"} color={"primary"} component="a" href={getURL(req)}>Aanvragen</Button>
                        </FormActions>
                    </Fragment>
                }

                {auths.length > 0 && // When we have one or more Authorizations, the user must pick.
                    <Fragment>
                        <Box pt={1} pb={1} >
                            <p>Vanuit welke organisatie wilt u uw bevoegdheid delen?</p>
                            <List component="nav" >
                                {entities.map(entity =>
                                    <ListItem key={entity.name}>
                                        <ListItemText primary={entityTxt(entity)} secondary={authorizedMark()} />
                                        <Button variant="contained" color={"primary"} onClick={() => goVerify(entity)}>Delen</Button>
                                    </ListItem>
                                )}
                            </List>
                        </Box>
                        <FormActions>
                            <Button component="a" href="#/home">Annuleren</Button>
                            <Button variant={"contained"} color={"primary"} component="a" href={getURL(req)}>Andere Organisatie</Button>
                        </FormActions>
                    </Fragment>
                }

            </div>
        );
}

function entityTxt(entity: LegalEntity) {
    return (
        <span>
            <strong>{entity.name}</strong><br />
            {entity.address}<br />
            KVK-nr: {entity.kvknr}<br />
        </span>
    )
}

function authorizedMark() {
    return (
        <Chip
            size="small"
            icon={<CheckIcon />}
            label={`Bevoegd`}
            color="primary"
            variant="outlined"
        />
    )
}
