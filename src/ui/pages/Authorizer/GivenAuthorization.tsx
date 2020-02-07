import { default as React } from "react";
import { useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { useStyles } from "../../../styles";
import { AuthorityCard } from "../../components/AuthorityCard";
import { PageTitle } from "../../components/PageTitle";
import { useSelector } from "../../hooks/useSelector";
import { selectGivenAuthorizationById } from "../../selectors/selectGivenAuthorizations";
import { selectProfileById } from "../../selectors/selectProfile";

export function GivenAuthorization() {
    const classes = useStyles({});
    const { id } = useParams();

    const authorization = useSelector(!!id ? selectGivenAuthorizationById(id) : undefined);
    const subject = useSelector(!authorization ? undefined : selectProfileById(authorization.subjectId));

    return !authorization ? <div>Deze machtiging is niet bekend.</div> : (
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 3000, enter: 1, exit: 1 }}
            classNames={"items"}
        >
            <div>
                <PageTitle title={"Machtigingen aan derden"} sub={"Door mij uitgegeven"} showBackButton backURL={"/authreqs/inbox"} />

                <div className="enter-item">
                    <AuthorityCard

                        authType={"givenAuthorization"}
                        legalEntity={authorization.legalEntity}
                        showSubjectName
                        subject={subject}
                        authority={authorization.authority}
                        showDetails={true}
                    />
                </div>

            </div>
        </CSSTransition>

    );
}
