import { Chip, List, ListItem, ListItemText } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import CheckIcon from "@material-ui/icons/Check";
import { isEqual, uniqWith } from "lodash";
import { default as React, Fragment } from "react";
import { useParams } from "react-router-dom";
import { AcceptANegWithLegalEntity } from "../../../commands/Command";
import { useStyles } from "../../../styles";
import { LegalEntity } from "../../../types/State";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { PersonCard } from "../../components/PersonCard";
import { useCommand } from "../../hooks/useCommand";
import { useSelector } from "../../hooks/useSelector";
import { selectMatchingAuthorizations } from "../../selectors/selectMatchingAuthorizations";
import { selectOpenInAuthReqById } from "../../selectors/selectOpenInAuthReqs";
import { selectProfileById } from "../../selectors/selectProfile";

export function IncomingAuthReq() {
    const { reqId: id } = useParams();
    const { dispatch } = useCommand();
    const classes = useStyles({});

    const req = useSelector(id ? selectOpenInAuthReqById(id) : undefined);
    const profile = useSelector(req ? selectProfileById(req.subjectId) : undefined);
    const auths = useSelector(req ? selectMatchingAuthorizations({ authority: req.authority, legalEntity: req.legalEntity! }) : undefined) || [];
    const entities = uniqWith(auths.map((a) => a.legalEntity), isEqual);

    const acceptRequest = (legalEntity: LegalEntity) => {
        if (req) {
            dispatch(AcceptANegWithLegalEntity({ legalEntity, negotiationId: req.id }));
        }
    };

    const rejectRequest = () => { }; // FIXME

    return !req ? <div>Dit verzoek bestaat niet.</div> : (
        <Box p={1}>
            <PersonCard profile={profile!} />

            <Box pt={1} pb={1}>
                <p><strong>{profile!.name}</strong> vraagt de volgende machtiging:</p>
            </Box>

            <AuthorityCard legalEntity={req.legalEntity} authority={req.authority} />

            {auths.length === 0 && // When we have ZERO authorizations, we can ask the Subject to request one.
                <Fragment>
                    <Box pt={1} pb={1} className={classes.warning}>
                        <p>Deze bevoegdheid zit niet in uw wallet. </p>
                    </Box>
                    <FormActions>
                        <Button component="a" href="#/home">Annuleren</Button>
                        {/* <Button variant={"contained"} color={"primary"} component="a" href={getURL(req)}>Aanvragen</Button> */}
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
                                    <Button variant="contained" color={"primary"} onClick={() => acceptRequest(entity)}>Delen</Button>
                                </ListItem>
                            )}
                        </List>
                    </Box>
                    <FormActions>
                        <Button component="a" href="#/home">Annuleren</Button>
                        {/* <Button variant={"contained"} color={"primary"} onClick={fastAuthReq}>Andere Organisatie</Button> */}
                    </FormActions>
                </Fragment>
            }
        </Box>
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
