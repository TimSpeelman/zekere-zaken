import Box from '@material-ui/core/Box';
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { useStyles } from "../../../styles";
import { AuthorityCard } from "../../components/AuthorityCard";
import { PersonCard } from "../../components/PersonCard";
import { useSelector } from "../../hooks/useSelector";
import { selectGivenAuthorizationById } from "../../selectors/selectGivenAuthorizations";
import { selectProfileById } from "../../selectors/selectProfile";

export function GivenAuthorization() {
    const classes = useStyles({});
    const { id } = useParams();

    const authorization = useSelector(!!id ? selectGivenAuthorizationById(id) : undefined);
    const subject = useSelector(!authorization ? undefined : selectProfileById(authorization.subjectId));

    return !authorization ? <div>Deze machtiging is niet bekend.</div> : (
        <div>
            <Box pt={1} pb={1}>
                <p>U heeft de volgende machtiging uitgegeven:</p>
            </Box>

            <AuthorityCard title={"Uitgegeven machtiging"} legalEntity={authorization.legalEntity} authority={authorization.authority} />

            <Box pt={1} pb={1}>
                <p>Deze machtiging is verleend aan:</p>
            </Box>

            {subject ? <PersonCard profile={subject} /> : <div>Onbekend</div>}

        </div>

    );
}
