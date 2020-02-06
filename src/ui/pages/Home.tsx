import { default as React, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { useStyles } from "../../styles";
import iconBadge from "../assets/images/icon-badge.svg";
import iconShieldWhite from "../assets/images/shield-white-vreq.svg";
import iconShieldYellowHalf from "../assets/images/shield-yellow-half.svg";
import iconShieldYellow from "../assets/images/shield-yellow.svg";
import { BottomTools } from "../components/BottomTools";
import { useLocalState } from "../hooks/useLocalState";

export function Home() {
    const classes = useStyles({});
    const items = [
        { path: "#/badge", label: "Mijn Badge", sub: "Laat u controleren." },
        { path: "#/verifs/new", label: "Verifiëren", sub: "Controleer iemand anders" },
        { path: "#/authreqs/outbox", label: "Mijn Bevoegdheden", sub: "Beheer, deel, vraag aan." },
        { path: "#/authreqs/inbox", label: "Machtigingen", sub: "Machtig derden namens uw organisatie(s)." },
    ]

    const { state } = useLocalState()
    const profile = state.profile;
    const [loaded, setLoaded] = useState(0);

    return (
        <CSSTransition
            in={loaded === 4}
            appear={true}
            timeout={{ appear: 1000, enter: 100, exit: 1 }}
            classNames={"items"}
        >
            <div className="full-height">
                <div className={classes.homeLogo + " enter-item home-logo"}>Zekere Zaken</div>
                <div className="home-menu">

                    <div>
                        <div className="row">
                            <a className="invisible-link purple enter-item delay-1" href="#/badge">
                                <img src={iconBadge} onLoad={() => setLoaded(loaded + 1)} />
                                <span className="title">Mijn Badge</span>
                            </a>
                            <a className="invisible-link purple enter-item delay-2" href="#/verifs/new">
                                <img src={iconShieldWhite} onLoad={() => setLoaded(loaded + 1)} />
                                <span className="title">Bevoegdheid Controleren</span>
                            </a>
                        </div>
                        <a className="invisible-link white enter-item delay-3" href="#/authreqs/outbox">
                            <div className="shield-with-number">
                                <img src={iconShieldYellow} onLoad={() => setLoaded(loaded + 1)} />
                                <span>3</span>
                            </div>
                            <span className="title">Mijn Bevoegdheden</span>
                            <span className="sub">U heeft nieuwe bevoegdheden</span>
                        </a>

                        <a className="invisible-link white enter-item delay-4" href="#/authreqs/inbox">
                            <div className="shield-with-number">
                                <img src={iconShieldYellowHalf} onLoad={() => setLoaded(loaded + 1)} />
                                <span>0</span>
                            </div>
                            <span className="title">Mijn Machtigingen</span>
                            <span className="sub">U heeft nog niemand gemachtigd</span>
                        </a>
                    </div>
                </div>

                <div className="bottom-tools">
                    <BottomTools showQR />
                </div>
            </div>
        </CSSTransition>
    );
}
