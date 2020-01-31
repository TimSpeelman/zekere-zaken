import Box from '@material-ui/core/Box';
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { useStyles } from "../../../styles";
import { AuthorityCard } from "../../components/AuthorityCard";
import { PersonCard } from "../../components/PersonCard";
import { useSelector } from "../../hooks/useSelector";
import { selectMyAuthorizationById } from "../../selectors/selectMyAuthorizations";
import { selectProfileById } from "../../selectors/selectProfile";

export function MyAuthorization() {
    const classes = useStyles({});
    const { id } = useParams();

    const authorization = useSelector(!!id ? selectMyAuthorizationById(id) : undefined);
    const authorizer = useSelector(!authorization ? undefined : selectProfileById(authorization.issuerId));

    return !authorization ? <div>Deze machtiging is niet bekend.</div> : (
        <div>
            <Box pt={1} pb={1}>
                <p>U heeft de volgende bevoegdheid:</p>
            </Box>

            <AuthorityCard title={"Ontvangen machtiging"} legalEntity={authorization.legalEntity} authority={authorization.authority} />

            <Box pt={1} pb={1}>
                <p>U bent hiervoor gemachtigd door:</p>
            </Box>

            {authorizer ? <PersonCard profile={authorizer} /> : <div>Onbekend</div>}

        </div>

    );
}
