import { Paper } from "@material-ui/core";
import { default as React } from "react";
import { useStyles } from "../../styles";
import { LegalEntity } from "../../types/State";
import shieldImg from "../assets/images/shield-yellow.svg";

interface Props {
    legalEntity: LegalEntity;
    title?: string;
    showLegalEntity?: boolean;
    showDetails?: boolean;
}

export function LegalEntityCard({
    legalEntity,
    showLegalEntity,
    showDetails,
    title,
}: Props) {
    const classes = useStyles({});

    return (
        <Paper className="menu-item">
            <div className="section spec">
                <div className="icon">
                    <img src={shieldImg} />
                </div>
                <div>
                    <p className="primary">{legalEntity.name}</p>
                    <p>Volmacht</p>
                </div>
            </div>

            {showLegalEntity &&
                <div className="section legal-entity">
                    <p className="primary">{legalEntity.name}</p>
                    <p>KVK-nr {legalEntity.kvknr}</p>
                    <p>{legalEntity.address}</p>
                </div>
            }

            {showDetails &&
                <div className="section details">
                    {<p>Uitgegeven door <span>Kamer van Koophandel</span></p>}
                    <p>Uitgegeven op <span>13 januari 2020</span></p> {/** FIXME */}
                    <p>Geldig tot <span>13 januari 2021</span></p> {/** FIXME */}
                </div>
            }
        </Paper>
    );
}

