import { Button } from "@material-ui/core";
import { default as React } from "react";
import { useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { useStyles } from "../../../styles";
import { LegalEntityCard } from "../../components/LegalEntityCard";
import { PageTitle } from "../../components/PageTitle";
import { useSelector } from "../../hooks/useSelector";
import { selectMyLegalEntityById } from "../../selectors/selectMyLegalEntities";

export function MyLegalEntity() {
    const classes = useStyles({});
    const { id } = useParams();

    const entity = useSelector(id ? selectMyLegalEntityById(id) : undefined);

    return !entity ? <div>Deze pagina bestaat niet (meer).</div> : (
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 3000, enter: 1, exit: 1 }}
            classNames={"items"}
        >
            <div className="my-auth">
                <PageTitle title={"Mijn Organisatie"} sub={entity.entity.name} showBackButton backURL={"/authreqs/outbox"} />

                <div className="enter-item">
                    <LegalEntityCard
                        legalEntity={entity.entity}
                        showLegalEntity={true}
                        showDetails={true}
                    />
                </div>

                <div className="show-all">
                    <Button component="a" href="#/authreqs/outbox">Toon alles</Button>
                </div>
            </div>
        </CSSTransition>
    );
}
