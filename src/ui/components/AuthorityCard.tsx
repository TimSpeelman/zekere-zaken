import { Paper } from "@material-ui/core";
import { default as React } from "react";
import { useStyles } from "../../styles";
import { Authority, LegalEntity, Profile } from "../../types/State";
import { authorityShort } from "../../util/intl";
import shieldAuthReqImg from "../assets/images/shield-authreq-v2.svg";
import shieldImg from "../assets/images/shield-purple.svg";

interface Props {
    legalEntity?: LegalEntity;
    authority: Authority;
    title?: string;
    showLegalEntity?: boolean;
    showDetails?: boolean;
    subject?: Profile;
    authorizer?: Profile;
    showSubjectName?: boolean;
    authType: "authorization" | "authorizationRequest" | "verification";
}

export function AuthorityCard({
    legalEntity,
    authority,
    subject,
    authorizer,
    showLegalEntity,
    showDetails,
    authType,
    title,
    showSubjectName,
}: Props) {
    const classes = useStyles({});

    const typeImg = {
        authorization: shieldImg,
        authorizationRequest: shieldAuthReqImg,
        verification: shieldAuthReqImg,
    };

    return (
        <Paper className="menu-item">
            <div className="section spec">
                <img src={typeImg[authType]} />
                <div>
                    {showSubjectName && subject && subject.name}
                    <p className="primary">{authorityShort(authority)}</p>
                    {legalEntity && <p className="">namens {legalEntity.name}</p>}
                </div>
            </div>

            {showLegalEntity && legalEntity &&
                <div className="section legal-entity">
                    <p className="primary">{legalEntity.name}</p>
                    <p>KVK-nr {legalEntity.kvknr}</p>
                    <p>{legalEntity.address}</p>
                </div>
            }

            {showDetails &&
                <div className="section details">
                    {authorizer && <p>Uitgegeven door <span>{authorizer.name}</span></p>}
                    <p>Uitgegeven op <span>13 januari 2020</span></p> {/** FIXME */}
                    <p>Geldig tot <span>13 januari 2021</span></p> {/** FIXME */}
                </div>
            }
        </Paper>
    );
}

