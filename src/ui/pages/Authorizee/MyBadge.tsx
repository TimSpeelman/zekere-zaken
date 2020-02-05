import { Paper } from "@material-ui/core";
import QRCode from "qrcode.react";
import { default as React } from "react";
import { useParams } from "react-router-dom";
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
    return (
        <div>
            <PageTitle title={"Mijn Badge"} sub={"Laat deze scannen om uw bevoegdheid te bewijzen"}
                onQuit={() => window.location.assign("#/home")} />

            <Paper className="badge" elevation={6}>
                <div className="top">
                    <img src={profile?.photo} />
                </div>
                <div className="name">
                    {profile?.name}
                </div>
                <div className="qr">
                    <AspectRatio heightOverWidth={1}>
                        <QRCode value={qrValue} size={256} level={"M"} style={{ width: "100%", height: "100%" }} />
                    </AspectRatio>
                </div>
            </Paper>
        </div>

    );
}
