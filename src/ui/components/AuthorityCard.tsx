import { Paper } from "@material-ui/core";
import { default as React } from "react";
import { useStyles } from "../../styles";
import { Authority, LegalEntity, Profile } from "../../types/State";
import { authorityShort } from "../../util/intl";
import shieldAuthReqImg from "../assets/images/shield-authreq-v2.svg";
import shieldImg from "../assets/images/shield-purple.svg";
import shieldVReqImg from "../assets/images/shield-vreq.svg";
import { AspectRatio } from "./AspectRatio";

interface Props {
    legalEntity?: LegalEntity;
    authority: Authority;
    title?: string;
    showLegalEntity?: boolean;
    showDetails?: boolean;
    subject?: Profile;
    authorizer?: Profile;
    showSubjectName?: boolean;
    authType: "authorization" | "authorizationRequest" | "verification" | "givenAuthorization";
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
        verification: shieldVReqImg,
        givenAuthorization: subject && subject.photo,
    };

    const isVerif = authType === "verification";

    const isGiven = authType === "givenAuthorization"
    const showPhoto = isGiven;

    return (
        <Paper className="menu-item">
            <div className="section spec">
                <div className="icon">
                    {showPhoto ?
                        <AspectRatio heightOverWidth={1.3} style={{
                            overflow: "hidden",
                            backgroundImage: `url(${subject?.photo})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}>
                        </AspectRatio>
                        :
                        <img src={typeImg[authType]} />
                    }
                </div>
                <div>

                    {isVerif && <p>Verificatieverzoek</p>}
                    {showSubjectName && subject && <p>{subject.name}</p>}
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
                    {isGiven && <p>Uitgegeven door <span>mij</span></p>}
                    <p>Uitgegeven op <span>13 januari 2020</span></p> {/** FIXME */}
                    <p>Geldig tot <span>13 januari 2021</span></p> {/** FIXME */}
                </div>
            }
        </Paper>
    );
}

