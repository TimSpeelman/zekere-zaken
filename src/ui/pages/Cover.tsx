import { default as React, useEffect, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { useStyles } from "../../styles";
import purpleShield from "../assets/images/shield-purple-deep.svg";
import { useLocalState } from "../hooks/useLocalState";

export function Cover() {
    const classes = useStyles({});
    const { state } = useLocalState();

    const url = state.profile ? "#/home" : "#/onboard";
    const [ready, setReady] = useState(false);

    const [exit, setExit] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setReady(false);
        }, 3000);
    }, [])

    return (
        <CSSTransition
            in={ready}
            appear={true}
            onExited={() => window.location.assign("#/home")}
            timeout={{ appear: 2000, enter: 1, exit: 1000 }}
            classNames={"items"}
        >
            <div className="cover">
                <img
                    src={purpleShield}
                    alt="Zekere Zaken App"
                    onLoad={() => setReady(true)} style={{ width: "80%", display: "block", margin: "auto" }}
                />
            </div>
        </CSSTransition>
    );
}
