import ListItem from '@material-ui/core/ListItem';
import { default as React, Fragment } from "react";
import { AuthorityCard } from "../../components/AuthorityCard";
import { PageTitle } from "../../components/PageTitle";
import { useLocalState } from "../../hooks/useLocalState";
import { useSelector } from "../../hooks/useSelector";
import { selectGivenAuthorizations } from "../../selectors/selectGivenAuthorizations";
import { selectOpenInAuthReqs } from "../../selectors/selectOpenInAuthReqs";

export function AuthReqInbox() {

    const { state } = useLocalState();
    const reqs = useSelector(selectOpenInAuthReqs) || [];
    const given = useSelector(selectGivenAuthorizations) || [];
    const getProfile = (subjectId: string) => {
        const p = state.profiles[subjectId];
        return (p && p.status === "Verified") ? p.profile : undefined;
    }

    return (
        <div>
            <PageTitle title={"Machtigingen aan derden"} backURL={"#/home"} />

            {reqs.length > 0 && (
                <Fragment>
                    <div className="subheader">Openstaande Verzoeken</div>
                    {reqs.map(req => (
                        <a href={`#/authreqs/inbox/${req.id}`} className="invisible-link">
                            <AuthorityCard
                                authType="authorizationRequest"
                                subject={getProfile(req.subjectId)}
                                showSubjectName={true}
                                authority={req.authority}
                                legalEntity={req.legalEntity}
                            />
                        </a>
                    ))}
                </Fragment>
            )}

            <div className="subheader">Uitgegeven Machtigingen</div>

            {given.length === 0 && <ListItem disabled>U heeft geen uitgegeven machtigingen.</ListItem>}
            {given.map(auth => (
                <a href={`#/given-authorizations/${auth.id}`} className="invisible-link">
                    <AuthorityCard
                        authType="authorization"
                        subject={getProfile(auth.subjectId)}
                        showSubjectName={true}
                        authority={auth.authority}
                        legalEntity={auth.legalEntity}
                    />
                </a>
            ))}

        </div >
    );
}
