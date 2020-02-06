import { Paper } from "@material-ui/core";
import QRCode from "qrcode.react";
import { default as React, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { useStyles } from "../../../styles";
import { AspectRatio } from "../../components/AspectRatio";
import { PageTitle } from "../../components/PageTitle";
import { useLocalState } from "../../hooks/useLocalState";

export function MyBadge() {
    const classes = useStyles({});
    const { id } = useParams();
    const { state } = useLocalState();
    const profile = state.profile;
    const qrValue = JSON.stringify({ peerId: state.myId })

    const [loaded, setLoaded] = useState(0);
    const onLoad = () => setLoaded(loaded + 1);

    return (
        <CSSTransition
            in={loaded >= 1}
            appear={true}
            timeout={{ appear: 1000, enter: 1, exit: 1 }}
            classNames={"items"}
        >
            <div >
                <PageTitle title={"Mijn Badge"} sub={"Laat deze scannen om uw bevoegdheid te bewijzen"}
                    onQuit={() => window.location.assign("#/home")} backURL="#/home" />

                <div className=" enter-item">
                    <Paper className="badge" elevation={6}>
                        <div className="top">
                            <img src={profile?.photo} onLoad={onLoad} />
                        </div>
                        <CopyToClipboard text={qrValue} onCopy={() => console.log("Copied to clipboard:", qrValue)}>
                            <div className="name">
                                {profile?.name}
                            </div>
                        </CopyToClipboard>
                        <div className="qr">
                            <AspectRatio heightOverWidth={1}>
                                <QRCode value={qrValue} size={256} level={"M"} onLoad={onLoad} style={{ width: "100%", height: "100%" }} />
                            </AspectRatio>
                        </div>
                    </Paper>
                </div>
            </div>

        </CSSTransition>

    );
}

