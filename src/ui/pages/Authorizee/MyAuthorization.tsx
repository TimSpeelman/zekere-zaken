import { Button } from "@material-ui/core";
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { useStyles } from "../../../styles";
import { AuthorityCard } from "../../components/AuthorityCard";
import { PageTitle } from "../../components/PageTitle";
import { useSelector } from "../../hooks/useSelector";
import { selectMyAuthorizationById } from "../../selectors/selectMyAuthorizations";
import { selectProfileById } from "../../selectors/selectProfile";

export function MyAuthorization() {
    const classes = useStyles({});
    const { id } = useParams();

    const authorization = useSelector(!!id ? selectMyAuthorizationById(id) : undefined);
    const authorizer = useSelector(!authorization ? undefined : selectProfileById(authorization.issuerId));

    return !authorization ? <div>Deze machtiging is niet bekend.</div> : (
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 3000, enter: 1, exit: 1 }}
            classNames={"items"}
        >
            <div className="my-auth">
                <PageTitle title={"Mijn Bevoegdheden"} showBackButton backURL={"#/authreqs/outbox"} />

                <div className="enter-item">
                    <AuthorityCard
                        authority={authorization.authority}
                        legalEntity={authorization.legalEntity}
                        authorizer={authorizer}
                        showLegalEntity={true}
                        showDetails={true}
                        authType="authorization"
                    />
                </div>

                <div className="show-all">
                    <Button component="a" href="#/authreqs/outbox">Toon alles</Button>
                </div>
            </div>
        </CSSTransition>
    );
}
