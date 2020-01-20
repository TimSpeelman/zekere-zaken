import { Container } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import React, { useEffect } from 'react';
import { HashRouter as Router, Route, RouteProps, Switch, useParams } from "react-router-dom";
import uuid from "uuid/v4";
import './assets/css/font-awesome.min.css';
import TopBar from "./components/TopBar";
import { useLocalState } from "./hooks/useLocalState";
import { AuthReqInbox } from "./pages/Authorizations/AuthReqInbox";
import { AuthReqOutbox } from "./pages/Authorizations/AuthReqOutbox";
import { IncomingAuthReq } from "./pages/Authorizations/IncomingAuthReq";
import { OutgoingAuthReq } from "./pages/Authorizations/OutgoingAuthReq";
import { Cover } from "./pages/Cover";
import { Home } from "./pages/Home";
import { RequestAuthority } from "./pages/NewAuthFlow/RequestAuthority";
import { ScanQR } from "./pages/ScanQR";
import { IncomingVerifReq } from "./pages/Verifications/IncomingVerifReq";
import { NewVerification } from "./pages/Verifications/NewVerification";
import { OutgoingVerifReq } from "./pages/Verifications/OutgoingVerifReq";
import { VerifReqOutbox } from "./pages/Verifications/VerifReqOutbox";
import { useStyles } from "./styles";
import { InAuthorizationRequest } from "./types/State";

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
    const onScanQR = (qr: string) => {
        const id = uuid();
        // @ts-ignore
        manager.addInVerifReq({ ...JSON.parse(qr), id });
        window.location.assign(`#/verifs/inbox/${id}`)
    };
    return (
        <Switch>
            <MyRoute title="QR-code Scannen" path="/qr"><ScanQR onScanQR={onScanQR} /></MyRoute>
            <MyRoute title="Inkomend Verzoek" path="/in/:req"><ReqHandler /></MyRoute>

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
            <MyRoute title="" path="/"><Cover /></MyRoute>
        </Switch>
    );
}

function ReqHandler() {
    const { req } = useParams();
    const { manager } = useLocalState();
    useEffect(() => {

        setTimeout(() => {
            // @ts-ignore TODO Validation
            const inAuthReq: InAuthorizationRequest = JSON.parse(decodeURIComponent(req!));
            inAuthReq.id = uuid();
            manager.addInAuthReq(inAuthReq);
            console.log(inAuthReq);

            window.location.assign(`#/authreqs/inbox/${inAuthReq.id}`);
        }, 1000);

    }, [req, manager])
    return <div>Momentje..</div>
}
