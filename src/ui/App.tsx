import clsx from "clsx";
import React, { useEffect, useState } from 'react';
import { HashRouter, Redirect, Route, RouteComponentProps, RouteProps, Switch, useParams, withRouter } from "react-router-dom";
import { NavigateTo, ResolveReference } from "../commands/Command";
import { isBroadcastReference } from "../services/references/types";
import { useStyles } from "../styles";
import './assets/css/font-awesome.min.css';
import { useCommand } from "./hooks/useCommand";
import { useLocalState } from "./hooks/useLocalState";
import { AuthReqOutbox } from "./pages/Authorizee/AuthReqOutbox";
import { MyAuthorization } from "./pages/Authorizee/MyAuthorization";
import { MyBadge } from "./pages/Authorizee/MyBadge";
import { OutgoingAuthReq } from "./pages/Authorizee/OutgoingAuthReq";
import { RequestAuthority } from "./pages/Authorizee/RequestAuthority";
import { AuthReqInbox } from "./pages/Authorizer/AuthReqInbox";
import { GivenAuthorization } from "./pages/Authorizer/GivenAuthorization";
import { IncomingAuthReq } from "./pages/Authorizer/IncomingAuthReq";
import { Cover } from "./pages/Cover";
import { Home } from "./pages/Home";
import { MyLegalEntity } from "./pages/LegalEntityOfficial/MyLegalEntity";
import { RequestLegalEntity } from "./pages/LegalEntityOfficial/RequestLegalEntity";
import { LoadingScreen } from "./pages/Special/LoadingScreen";
import { Onboard } from "./pages/Special/Onboard";
import { Resolve } from "./pages/Special/Resolve";
import { ScanQR } from "./pages/Special/ScanQR";
import { Settings } from "./pages/Special/Settings";
import { IncomingVerifReq } from "./pages/Verifiee/IncomingVerifReq";
import { NewVerification } from "./pages/Verifier/NewVerification";
import { OutgoingVerifReq } from "./pages/Verifier/OutgoingVerifReq";
import { VerifReqOutbox } from "./pages/Verifier/VerifReqOutbox";

type Color = "purple" | "white" | "green" | "yellow"

export function MyRoute({ title, backURI, ...props }: { title: string, backURI?: string, color: Color } & RouteProps) {
    const classes = useStyles({});

    const body = title === "" ? <Route {...props} /> : (

        <Route {...props} />
    );

    return (
        <div className={classes.root}>

            {/* <CssBaseline />
            {title && <TopBar title={title} backURI={backURI} />} */}

            <main className={clsx(classes.content, props.color)}>
                <div className="bg purple"></div>
                <div className="bg yellow"></div>
                <div className="bg green"></div>
                <div className="bg white"><div className={classes.whiteShieldBg}></div></div>
                <div className="content container">
                    {body}
                </div>
            </main>
        </div>
    )
}

export const AppBody = withRouter((props: RouteComponentProps) => {
    const { manager, state } = useLocalState();
    const { dispatch } = useCommand();

    const isConnected = !!state.myId;

    // Ugly way for determining the background color from within a page.
    const [mood, setMood] = useState("normal");
    const isSuccess = mood === "succeeded";

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

    const currentPath = props.location.pathname;
    if (!state.profile && !currentPath.startsWith("/onboard") && currentPath !== "/") {
        return <Redirect to={"/onboard/" + encodeURIComponent(props.location.pathname)} />
    }

    const home = "#/home";


    return (
        <Switch>
            <MyRoute color="white" title="Instellingen" path="/settings" backURI={home}><Settings /></MyRoute>
            <MyRoute color="white" title="Verbinden.." path="/resolve/:senderId/:reference" backURI={home}><Resolve /></MyRoute>
            <MyRoute color="purple" title="QR-code Scannen" path="/qr" backURI={home}><ScanQR onScanQR={onScanQR} /></MyRoute>
            <MyRoute color="white" title="Inkomend Verzoek" path="/in/:senderId/:reference" backURI={home}><ReqHandler /></MyRoute>

            {/* Verifiers */}
            <MyRoute color="purple" title="Verifiëren" path="/verifs/new" backURI={home}><NewVerification /></MyRoute>
            <MyRoute color={isSuccess ? "green" : "purple"} title="Verifiëren" path="/verifs/outbox/:reqId" backURI={home}><OutgoingVerifReq onMoodChange={setMood} /></MyRoute>
            <MyRoute color="purple" title="Verificatiegeschiedenis" path="/verifs/outbox" backURI={home}><VerifReqOutbox /></MyRoute>

            {/* Subjects */}
            <MyRoute color="yellow" title="Badge" path="/badge" backURI={home}><MyBadge /></MyRoute>
            <MyRoute color={isSuccess ? "green" : "purple"} title="Inkomende Verificate" path="/verifs/inbox/:reqId" backURI={home}><IncomingVerifReq onMoodChange={setMood} /></MyRoute>
            {/* <MyRoute color="white" title="Verificaties" path="/verifs/inbox"><Verifications tab={"inbox"} /></MyRoute> */}

            <MyRoute color="white" title="" path="/my-legal-entities/new" backURI={home}><RequestLegalEntity /></MyRoute>
            <MyRoute color="white" title="" path="/my-legal-entities/:id" backURI={home}><MyLegalEntity /></MyRoute>

            <MyRoute color="white" title="Nieuw Machtigingsverzoek" path="/authreqs/new" backURI={home}><RequestAuthority /></MyRoute>
            <MyRoute color="white" title="Uitgaand Machtigingsverzoek" path="/authreqs/outbox/:reqId" backURI={"#/authreqs/outbox"}><OutgoingAuthReq /></MyRoute>
            <MyRoute color="white" title="Mijn Bevoegdheden" path="/authreqs/outbox" backURI={home}><AuthReqOutbox /></MyRoute>
            <MyRoute color="white" title="Mijn Bevoegdheid" path="/my-authorizations/:id" backURI={"#/authreqs/outbox"}><MyAuthorization /></MyRoute>


            {/* Authorizers */}
            <MyRoute color="white" title="Uitgegeven Machtiging" path="/given-authorizations/:id" backURI={home}><GivenAuthorization /></MyRoute>
            <MyRoute color="white" title="Inkomend Machtigingsverzoek" path="/authreqs/inbox/:reqId" backURI={home}><IncomingAuthReq /></MyRoute>
            <MyRoute color="white" title="Machtigingen" path="/authreqs/inbox" backURI={home}><AuthReqInbox /></MyRoute>
            <MyRoute color="purple" title="Zekere Zaken App" path="/home"><Home /></MyRoute>
            <MyRoute color="white" title="Zekere Zaken App" path="/onboard/:redirectTo"><Onboard /></MyRoute>
            <MyRoute color="white" title="Zekere Zaken App" path="/onboard"><Onboard /></MyRoute>
            <MyRoute color="purple" title="" path="/"><Cover /></MyRoute>
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
