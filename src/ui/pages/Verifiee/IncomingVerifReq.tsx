import { Chip, List, ListItem, ListItemText } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import CheckIcon from "@material-ui/icons/Check";
import { isEqual, uniqWith } from "lodash";
import { default as React, Fragment } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useParams } from "react-router-dom";
import uuid from "uuid/v4";
import { AcceptVNegWithLegalEntity as AcceptVNegWithLegalEntity, CreateAReqTemplate } from "../../../commands/Command";
import { useStyles } from "../../../styles";
import { AuthorizationTemplate, LegalEntity } from "../../../types/State";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { PersonCard } from "../../components/PersonCard";
import { useCommand } from "../../hooks/useCommand";
import { useSelector } from "../../hooks/useSelector";
import { useWhatsappURL } from "../../hooks/useWhatsappURL";
import { selectMatchingAuthorizations } from "../../selectors/selectMatchingAuthorizations";
import { selectOpenInVerReqById } from "../../selectors/selectOpenInVerReqs";
import { selectProfileStatusById } from "../../selectors/selectProfile";

export function IncomingVerifReq() {
    console.log("Render");

    const { dispatch } = useCommand();
    const { reqId: id } = useParams();
    const classes = useStyles({});

    const inVReq = useSelector(id ? selectOpenInVerReqById(id) : undefined);
    const profileResult = useSelector(inVReq ? selectProfileStatusById(inVReq.verifierId) : undefined);
    const auths = useSelector(inVReq ? selectMatchingAuthorizations({ legalEntity: inVReq.legalEntity!, authority: inVReq.authority }) : undefined) || [];
    const entities = uniqWith(auths.map((a) => a.legalEntity), isEqual);

    const { getURL, getWhatsappURL } = useWhatsappURL();

    function goVerify(legalEntity: LegalEntity) {
        dispatch(AcceptVNegWithLegalEntity({ negotiationId: inVReq!.id, legalEntity }))
    }

    const authTemplate: AuthorizationTemplate | undefined = inVReq && {
        id: uuid(),
        datetime: new Date().toISOString(),
        authority: inVReq.authority,
        legalEntity: inVReq.legalEntity,
    };

    function fastAuthReq() {
        if (authTemplate) {
            dispatch(CreateAReqTemplate({ template: authTemplate }))
        }
    }

    if (!inVReq) {
        return <Box p={3}>Dit verzoek bestaat niet.</Box>
    }

    if (!profileResult || profileResult?.status === "Failed") {
        return <Box p={3}>Er ging iets fout bij het laden van het profiel.</Box>
    }

    if (profileResult.status === "Verifying") {
        return <Box p={3}>We laden even het profiel van deze gebruiker..</Box>
    }

    const profile = profileResult.profile;

    return (
        <div>

            <PersonCard profile={profile} />

            <Box pt={1} pb={1}>
                <p><strong>{profile.name}</strong> wil uw bevoegdheid controleren voor het volgende:</p>
            </Box>

            <AuthorityCard legalEntity={inVReq.legalEntity} authority={inVReq.authority} />

            {auths.length === 0 && // When we have ZERO authorizations, we can ask the Subject to request one.
                <Fragment>
                    <Box pt={1} pb={1} className={classes.warning}>
                        <p>Deze bevoegdheid zit niet in uw wallet. </p>
                    </Box>
                    <FormActions>
                        <Button component="a" href="#/home">Annuleren</Button>
                        <Button variant={"contained"} color={"primary"} component="a"
                            onClick={fastAuthReq} href={getWhatsappURL(inVReq)} target="_blank">Aanvragen</Button>
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
                        <CopyToClipboard text={getURL(authTemplate)} >
                            <Button variant={"contained"} color={"primary"} onClick={fastAuthReq}
                                component="a" href={getWhatsappURL(authTemplate)} target="_blank">Andere Organisatie</Button>
                        </CopyToClipboard>
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
