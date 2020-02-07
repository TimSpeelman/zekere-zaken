import ListItem from '@material-ui/core/ListItem';
import { default as React, Fragment } from "react";
import { CSSTransition } from "react-transition-group";
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
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 1000, enter: 100, exit: 1 }}
            classNames={"items"}
        >
            <div>
                <PageTitle title={"Machtigingen aan derden"} showBackButton backURL="/home" />

                {reqs.length > 0 && (
                    <Fragment>
                        <div className="subheader" style={{ paddingTop: 0 }}>Openstaande Verzoeken</div>
                        {reqs.map((req, i) => (
                            <a href={`#/authreqs/inbox/${req.id}`} className={`invisible-link enter-item delay-${(i % 10)}`}>
                                <AuthorityCard
                                    authType="authorizationRequest"
                                    subject={getProfile(req.subjectId)}
                                    showSubjectName={true}
                                    authority={req.authority}
                                    legalEntity={req.legalEntity}
                                />
                            </a>
                        ))}
                        <div className="subheader">Uitgegeven Machtigingen</div>
                    </Fragment>
                )}


                {given.length === 0 && <ListItem disabled>U heeft geen uitgegeven machtigingen.</ListItem>}
                {given.map((auth, i) => (
                    <a href={`#/given-authorizations/${auth.id}`} className={`invisible-link enter-item delay-${(i % 10)}`}>
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
        </CSSTransition>
    );
}
