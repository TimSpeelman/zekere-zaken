import { Container } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import React, { useEffect } from 'react';
import { HashRouter as Router, Route, RouteProps, Switch, useParams } from "react-router-dom";
import { NavigateTo, ResolveReference } from "../commands/Command";
import { isBroadcastReference } from "../services/references/types";
import { useStyles } from "../styles";
import './assets/css/font-awesome.min.css';
import TopBar from "./components/TopBar";
import { useCommand } from "./hooks/useCommand";
import { useLocalState } from "./hooks/useLocalState";
import { useProfile } from "./hooks/useProfile";
import { AuthReqOutbox } from "./pages/Authorizee/AuthReqOutbox";
import { OutgoingAuthReq } from "./pages/Authorizee/OutgoingAuthReq";
import { RequestAuthority } from "./pages/Authorizee/RequestAuthority";
import { AuthReqInbox } from "./pages/Authorizer/AuthReqInbox";
import { IncomingAuthReq } from "./pages/Authorizer/IncomingAuthReq";
import { Cover } from "./pages/Cover";
import { Home } from "./pages/Home";
import { Onboard } from "./pages/Onboard";
import { ScanQR } from "./pages/ScanQR";
import { IncomingVerifReq } from "./pages/Verifiee/IncomingVerifReq";
import { NewVerification } from "./pages/Verifier/NewVerification";
import { OutgoingVerifReq } from "./pages/Verifier/OutgoingVerifReq";
import { VerifReqOutbox } from "./pages/Verifier/VerifReqOutbox";

export const App: React.FC = () => <Router><AppBody /></Router>

export function MyRoute({ title, ...props }: { title: string } & RouteProps) {
    const classes = useStyles({});

    const body = title === "" ? <Route {...props} /> : (

        <React.Fragment>
            <div className={classes.appBarSpacer}></div>

            <Container maxWidth="lg" className={classes.contentContainer}>
                <Route {...props} />
            </Container>
        </React.Fragment>
    );

    return (
        <div className={classes.root}>
            <CssBaseline />
            {title && <TopBar title={title} />}

            <main className={classes.content}>
                {body}
            </main>
        </div>
    )
}

export const AppBody: React.FC = () => {
    const { manager } = useLocalState();
    const { dispatch } = useCommand();
    const { myId } = useProfile();
    const isConnected = !!myId;

    const onScanQR = (qr: string) => {
        try {
            const reference: any = JSON.parse(qr);
            if (!isBroadcastReference(reference)) {
                return false;
            }

            dispatch(ResolveReference({ reference }))
            dispatch(NavigateTo({ path: `#/resolve/${reference.senderId}/${reference.reference}` })); // Or do upon command?

            return true;
        } catch (e) {
            return false;
        }
    };

    return !isConnected ? <div>Connecting to ID Gateway</div> : (
        <Switch>
            <MyRoute title="Verbinden met peer.." path="/resolve/:senderId/:reference"><div>Resolving reference..</div></MyRoute>
            <MyRoute title="QR-code Scannen" path="/qr"><ScanQR onScanQR={onScanQR} /></MyRoute>
            <MyRoute title="Inkomend Verzoek" path="/in/:senderId/:reference"><ReqHandler /></MyRoute>

            {/* Verifiers */}
            <MyRoute title="Verifiëren" path="/verifs/new"><NewVerification /></MyRoute>
            <MyRoute title="Verifiëren" path="/verifs/outbox/:reqId"><OutgoingVerifReq /></MyRoute>
            <MyRoute title="Verificatiegeschiedenis" path="/verifs/outbox"><VerifReqOutbox /></MyRoute>

            {/* Subjects */}
            <MyRoute title="Inkomende Verificate" path="/verifs/inbox/:reqId"><IncomingVerifReq /></MyRoute>
            {/* <MyRoute title="Verificaties" path="/verifs/inbox"><Verifications tab={"inbox"} /></MyRoute> */}

            <MyRoute title="Nieuw Machtigingsverzoek" path="/authreqs/new"><RequestAuthority /></MyRoute>
            <MyRoute title="Uitgaand Machtigingsverzoek" path="/authreqs/outbox/:reqId"><OutgoingAuthReq /></MyRoute>
            <MyRoute title="Mijn Bevoegdheden" path="/authreqs/outbox"><AuthReqOutbox /></MyRoute>


            {/* Authorizers */}
            <MyRoute title="Inkomend Machtigingsverzoek" path="/authreqs/inbox/:reqId"><IncomingAuthReq /></MyRoute>
            <MyRoute title="Machtigingen" path="/authreqs/inbox"><AuthReqInbox /></MyRoute>
            <MyRoute title="Zekere Zaken App" path="/home"><Home /></MyRoute>
            <MyRoute title="Zekere Zaken App" path="/onboard"><Onboard /></MyRoute>
            <MyRoute title="" path="/"><Cover /></MyRoute>
        </Switch>
    );
}

function ReqHandler() {
    const { senderId, reference } = useParams();
    const { manager } = useLocalState();
    const { dispatch } = useCommand();

    useEffect(() => {
        if (senderId && reference) {

            const ref = { senderId, reference };
            dispatch(ResolveReference({ reference: ref }))
            dispatch(NavigateTo({ path: `#/resolve/${senderId}/${reference}` }));
        }

    }, [senderId, reference, manager]);
    return <div>Momentje..</div>
}
