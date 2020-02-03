import { Container } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import React, { useEffect } from 'react';
import { HashRouter, Redirect, Route, RouteComponentProps, RouteProps, Switch, useParams, withRouter } from "react-router-dom";
import { NavigateTo, ResolveReference } from "../commands/Command";
import { isBroadcastReference } from "../services/references/types";
import { useStyles } from "../styles";
import './assets/css/font-awesome.min.css';
import TopBar from "./components/TopBar";
import { useCommand } from "./hooks/useCommand";
import { useLocalState } from "./hooks/useLocalState";
import { AuthReqOutbox } from "./pages/Authorizee/AuthReqOutbox";
import { MyAuthorization } from "./pages/Authorizee/MyAuthorization";
import { OutgoingAuthReq } from "./pages/Authorizee/OutgoingAuthReq";
import { RequestAuthority } from "./pages/Authorizee/RequestAuthority";
import { AuthReqInbox } from "./pages/Authorizer/AuthReqInbox";
import { GivenAuthorization } from "./pages/Authorizer/GivenAuthorization";
import { IncomingAuthReq } from "./pages/Authorizer/IncomingAuthReq";
import { Cover } from "./pages/Cover";
import { Home } from "./pages/Home";
import { LoadingScreen } from "./pages/Special/LoadingScreen";
import { Onboard } from "./pages/Special/Onboard";
import { Resolve } from "./pages/Special/Resolve";
import { ScanQR } from "./pages/Special/ScanQR";
import { Settings } from "./pages/Special/Settings";
import { IncomingVerifReq } from "./pages/Verifiee/IncomingVerifReq";
import { NewVerification } from "./pages/Verifier/NewVerification";
import { OutgoingVerifReq } from "./pages/Verifier/OutgoingVerifReq";
import { VerifReqOutbox } from "./pages/Verifier/VerifReqOutbox";


export function MyRoute({ title, backURI, ...props }: { title: string, backURI?: string } & RouteProps) {
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
            {title && <TopBar title={title} backURI={backURI} />}

            <main className={classes.content}>
                {body}
            </main>
        </div>
    )
}

export const AppBody = withRouter((props: RouteComponentProps) => {
    const { manager, state } = useLocalState();
    const { dispatch } = useCommand();

    const isConnected = !!state.myId;


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

    if (!isConnected) {
        return <LoadingScreen />
    }

    if (!state.profile && !props.location.pathname.startsWith("/onboard")) {
        return <Redirect to={"/onboard/" + encodeURIComponent(props.location.pathname)} />
    }

    const home = "#/home";

    return (
        <Switch>
            <MyRoute title="Instellingen" path="/settings" backURI={home}><Settings /></MyRoute>
            <MyRoute title="Verbinden.." path="/resolve/:senderId/:reference" backURI={home}><Resolve /></MyRoute>
            <MyRoute title="QR-code Scannen" path="/qr" backURI={home}><ScanQR onScanQR={onScanQR} /></MyRoute>
            <MyRoute title="Inkomend Verzoek" path="/in/:senderId/:reference" backURI={home}><ReqHandler /></MyRoute>

            {/* Verifiers */}
            <MyRoute title="Verifiëren" path="/verifs/new" backURI={home}><NewVerification /></MyRoute>
            <MyRoute title="Verifiëren" path="/verifs/outbox/:reqId" backURI={home}><OutgoingVerifReq /></MyRoute>
            <MyRoute title="Verificatiegeschiedenis" path="/verifs/outbox" backURI={home}><VerifReqOutbox /></MyRoute>

            {/* Subjects */}
            <MyRoute title="Inkomende Verificate" path="/verifs/inbox/:reqId" backURI={home}><IncomingVerifReq /></MyRoute>
            {/* <MyRoute title="Verificaties" path="/verifs/inbox"><Verifications tab={"inbox"} /></MyRoute> */}

            <MyRoute title="Nieuw Machtigingsverzoek" path="/authreqs/new" backURI={home}><RequestAuthority /></MyRoute>
            <MyRoute title="Uitgaand Machtigingsverzoek" path="/authreqs/outbox/:reqId" backURI={"#/authreqs/outbox"}><OutgoingAuthReq /></MyRoute>
            <MyRoute title="Mijn Bevoegdheden" path="/authreqs/outbox" backURI={home}><AuthReqOutbox /></MyRoute>
            <MyRoute title="Mijn Bevoegdheid" path="/my-authorizations/:id" backURI={"#/authreqs/outbox"}><MyAuthorization /></MyRoute>


            {/* Authorizers */}
            <MyRoute title="Uitgegeven Machtiging" path="/given-authorizations/:id" backURI={home}><GivenAuthorization /></MyRoute>
            <MyRoute title="Inkomend Machtigingsverzoek" path="/authreqs/inbox/:reqId" backURI={home}><IncomingAuthReq /></MyRoute>
            <MyRoute title="Machtigingen" path="/authreqs/inbox" backURI={home}><AuthReqInbox /></MyRoute>
            <MyRoute title="Zekere Zaken App" path="/home"><Home /></MyRoute>
            <MyRoute title="Zekere Zaken App" path="/onboard/:redirectTo"><Onboard /></MyRoute>
            <MyRoute title="Zekere Zaken App" path="/onboard"><Onboard /></MyRoute>
            <MyRoute title="" path="/"><Cover /></MyRoute>
        </Switch>
    );
});

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
export const App = () => <HashRouter><AppBody /></HashRouter>;
