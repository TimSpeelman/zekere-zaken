import uuid from "uuid";
import { InvokeIDAuthorize, InvokeIDVerify, NavigateTo, UserCommand } from "../commands/Command";
import { ANegotiationUpdated, DomainEvent, IDIssuingCompleted, IDVerifyCompleted, RefResolvedToAuthorize, RefResolvedToVerify, VNegotiationUpdated } from "../commands/Event";
import { selectATransactionById, selectVTransactionById } from "../ui/selectors/selectTransactionById";
import { failIfFalsy } from "../util/failIfFalsy";
import { Hook } from "../util/Hook";
import { AuthorizeeNegotiationStrategy, AuthorizeManager, AuthorizerNegotiationStrategy } from "./identity/authorization/AuthorizeManager";
import { AuthorizationTransaction, AuthorizeNegotiation, AuthorizeNegotiationResult, NegStatus } from "./identity/authorization/types";
import { Agent, Me } from "./identity/id-layer/Agent";
import { IDIssuee } from "./identity/id-layer/IDIssuee";
import { IDIssuer } from "./identity/id-layer/IDIssuer";
import { IDVerifiee } from "./identity/id-layer/IDVerifiee";
import { IDVerifier } from "./identity/id-layer/IDVerifier";
import { ProfileExchanger } from "./identity/profiles/ProfileExchanger";
import { specIsComplete, VerificationTransaction, VerifyNegotiation, VerifyNegotiationResult } from "./identity/verification/types";
import { VerifieeNegotiationStrategy, VerifierNegotiationStrategy, VerifyManager } from "./identity/verification/VerifyManager";
import { Messenger } from "./messaging/Messenger";
import { Msg } from "./messaging/types";
import { ReferenceClient } from "./references/ReferenceClient";
import { StateManager } from "./state/StateManager";

/** MyAgent wraps all services together */
export class MyAgent {

    public eventHook: Hook<DomainEvent> = new Hook('events');
    public commandHook: Hook<UserCommand> = new Hook('commands');

    private messenger: Messenger<Msg>;

    me?: Me;

    constructor(private agent: Agent, private stateMgr: StateManager) {

        // Handle sending of messages between Peers.
        const messenger = new Messenger<Msg>(agent);
        this.messenger = messenger;

        this.setupProfileExchange(messenger, stateMgr);

        this.setupReferenceSystem(messenger, this.commandHook);

        this.setupIDVerify(agent, stateMgr, this.commandHook, this.eventHook);

        this.setupIDAuthorize(agent, stateMgr, this.commandHook, this.eventHook);

        this.setupVerifyNegotiation(agent, messenger, stateMgr, this.commandHook, this.eventHook);

        this.setupAuthorizeNegotiation(agent, messenger, stateMgr, this.commandHook, this.eventHook);

        this.setupStateTriggers(this.commandHook);

        this.setupUITriggers(this.commandHook, this.eventHook);

        this.connect().then(me => {
            this.me = me;
            stateMgr.setMyId(me.id);
        });
    }

    dispatch(command: UserCommand) {

        this.commandHook.fire(command);

    }

    connect(): Promise<Me> {
        this.messenger.connect();
        return this.agent.connect();
    }

    protected setupUITriggers(commandHook: Hook<UserCommand>, eventHook: Hook<DomainEvent>) {
        eventHook.on((e) => {
            switch (e.type) {
                case "RefResolvedToVerify":
                    return commandHook.fire(NavigateTo({ path: `#/verifs/inbox/${e.negotiationId}` }));
                case "RefResolvedToAuthorize":
                    return commandHook.fire(NavigateTo({ path: `#/authreqs/inbox/${e.negotiationId}` }));
            }
        })

        commandHook.on((cmd) => {
            if (cmd.type === "NavigateTo") {
                if (typeof window !== 'undefined') {
                    window.location.assign(cmd.path);
                }
            }
        });
    }

    protected setupProfileExchange(messenger: Messenger<Msg>, stateMgr: StateManager) {
        // Take care of exchanging profiles between peers.
        const profileEx = new ProfileExchanger(messenger, () => stateMgr.state.profile!);
        messenger.addRecipient(profileEx);

        // FIXME: For now we send our profile to every peer who sends us a message
        messenger.addHandler((env) => { profileEx.sendProfileToPeer(env.senderId); return false });

        // Save profiles after they have been verified
        profileEx.verifiedProfileHook.on(({ peerId, profile }) => stateMgr.addProfile(peerId, profile));
    }

    protected setupReferenceSystem(messenger: Messenger<Msg>, commandHook: Hook<UserCommand>) {

        // Resolves references created by other peers
        const referenceClient = new ReferenceClient<Msg>(messenger);
        messenger.addRecipient(referenceClient);

        // On ResolveReference command, resolve a reference
        commandHook.on((a) => a.type === "ResolveReference" &&
            referenceClient.requestToResolveBroadcast(a.reference));

    }

    protected setupIDVerify(agent: Agent, stageMgr: StateManager, commandHook: Hook<UserCommand>, eventHook: Hook<DomainEvent>) {

        const getTransactionById = (transactionId: string) =>
            selectVTransactionById(transactionId)(stageMgr.state);

        const verifier = new IDVerifier(agent);

        const verifiee = new IDVerifiee(getTransactionById);
        agent.setVerificationRequestHandler((r) => verifiee.handleVerificationRequest(r));

        verifiee.completedVerifyHook.on((result) => {
            eventHook.fire(IDVerifyCompleted({
                negotiationId: result.sessionId,
                result: result.result,
            }))
        })

        verifier.completedVerifyHook.on((result) => {
            const neg = stageMgr.state.verifyNegotiations.find(n => n.sessionId === result.sessionId);
            if (neg && result.result === VerifyNegotiationResult.Succeeded) {
                stageMgr.addVerified({
                    templateId: neg.fromTemplateId!,
                    sessionId: neg.sessionId,
                    // @ts-ignore FIXME
                    spec: neg.conceptSpec,
                })

                eventHook.fire(IDVerifyCompleted({
                    negotiationId: result.sessionId,
                    result: result.result,
                }))
            }
        })

        commandHook.on((cmd) => cmd.type === "InvokeIDVerify" &&
            verifier.verify(cmd.transaction));
    }

    protected setupIDAuthorize(agent: Agent, stageMgr: StateManager, commandHook: Hook<UserCommand>, eventHook: Hook<DomainEvent>) {

        const getTransactionById = (transactionId: string) =>
            selectATransactionById(transactionId)(stageMgr.state);

        const authorizer = new IDIssuer(getTransactionById);

        const authorizee = new IDIssuee(agent);
        agent.setIssuingRequestHandler((r) => authorizer.handleIssueRequest(r));

        authorizee.completedIssueHook.on((result) => {
            eventHook.fire(IDIssuingCompleted({
                negotiationId: result.sessionId,
                result: result.result,
            }))

            const neg = stageMgr.state.authorizeNegotiations.find(n => n.id === result.sessionId);
            if (neg && result.result === AuthorizeNegotiationResult.Succeeded) {
                stageMgr.addAuthorization({
                    fromTemplateId: neg.fromTemplateId!,
                    sessionId: neg.id,
                    // @ts-ignore FIXME
                    spec: neg.conceptSpec,
                    legalEntity: neg.conceptSpec!.legalEntity!,
                    authority: neg.conceptSpec!.authority!,
                    issuedAt: new Date().toISOString(), // FIXME
                    issuerId: neg.authorizerId,
                    subjectId: neg.subjectId,
                    id: uuid(),
                })
            }
        })

        authorizer.completedIssueHook.on((result) => {
            const neg = stageMgr.state.authorizeNegotiations.find(n => n.id === result.sessionId);
            if (neg && result.result === AuthorizeNegotiationResult.Succeeded) {
                stageMgr.addAuthorization({
                    fromTemplateId: neg.fromTemplateId!,
                    sessionId: neg.id,
                    // @ts-ignore FIXME
                    spec: neg.conceptSpec,
                    legalEntity: neg.conceptSpec!.legalEntity!,
                    authority: neg.conceptSpec!.authority!,
                    issuedAt: new Date().toISOString(), // FIXME
                    issuerId: neg.authorizerId,
                    subjectId: neg.subjectId,
                    id: uuid(),
                })

                eventHook.fire(IDIssuingCompleted({
                    negotiationId: result.sessionId,
                    result: result.result,
                }))
            }
        })

        commandHook.on((cmd) => cmd.type === "InvokeIDAuthorize" &&
            authorizee.requestIssuing(cmd.transaction));
    }

    protected setupVerifyNegotiation(agent: Agent, messenger: Messenger<Msg>, stateMgr: StateManager, commandHook: Hook<UserCommand>, eventHook: Hook<DomainEvent>) {

        const negHook = new Hook<VerifyNegotiation>('neg-hook');
        negHook.on((negotiation) => {
            const isNew = !stateMgr.state.verifyNegotiations.find(n => n.sessionId === negotiation.sessionId);

            eventHook.fire(VNegotiationUpdated({ negotiation }))

            if (isNew && negotiation.fromReference) {
                eventHook.fire(RefResolvedToVerify({ negotiationId: negotiation.sessionId, reference: negotiation.fromReference }));
            }
        })
        const stgVerifier = new VerifierNegotiationStrategy(messenger, negHook);
        const stgVerifiee = new VerifieeNegotiationStrategy(messenger, negHook);

        const getSessionById = (sessionId: string) => {
            return stateMgr.state.verifyNegotiations.find(n => n.sessionId === sessionId);
        }
        const verifyManager = new VerifyManager(stgVerifier, stgVerifiee, getSessionById);

        messenger.addRecipient(verifyManager);

        agent.connect().then((me) => { verifyManager.myId = me.id; })

        commandHook.on(cmd => {
            switch (cmd.type) {
                case "AcceptVNegWithLegalEntity": {
                    const sessionId = cmd.negotiationId;

                    const session = failIfFalsy(getSessionById(sessionId), "SessionID unknown");
                    const spec = {
                        ...session!.conceptSpec,
                        legalEntity: cmd.legalEntity,
                    }

                    stgVerifiee.offer(session!, spec);

                    break;
                } case "RejectVNegotiation": {
                    const sessionId = cmd.negotiationId;
                    const session = failIfFalsy(getSessionById(sessionId), "SessionID unknown");

                    stgVerifiee.reject(session!); // FIXME, always verifiee?
                    break;
                }
            }

        })

        eventHook.on((ev) => {
            switch (ev.type) {
                case "VNegotiationCompleted": {
                    if (ev.transaction.verifierId === messenger.me!.id) { // FIXME ugly
                        commandHook.fire(InvokeIDVerify({ negotiationId: ev.transaction.sessionId, transaction: ev.transaction }))
                    }
                    break;
                }
                case "VNegotiationUpdated": {
                    const n = ev.negotiation;
                    this.stateMgr.updateVerifyNeg(n);
                    if (n.verifierId === messenger.me!.id && specIsComplete(n.conceptSpec)) {
                        const transaction: VerificationTransaction = {
                            spec: n.conceptSpec,
                            subjectId: n.subjectId,
                            verifierId: n.verifierId,
                            sessionId: n.sessionId,
                        }
                        commandHook.fire(InvokeIDVerify({ negotiationId: ev.negotiation.sessionId, transaction }));
                    }
                }
            }
        })

        this.setupTriggerVerifyOnResolve(messenger, stgVerifier);

        return { verifyManager, stgVerifier };
    }

    protected setupAuthorizeNegotiation(agent: Agent, messenger: Messenger<Msg>, stateMgr: StateManager, commandHook: Hook<UserCommand>, eventHook: Hook<DomainEvent>) {

        const negHook = new Hook<AuthorizeNegotiation>('neg-hook');
        negHook.on((negotiation) => {
            const isNew = !stateMgr.state.authorizeNegotiations.find(n => n.id === negotiation.id);

            eventHook.fire(ANegotiationUpdated({ negotiation }))

            if (isNew && negotiation.fromReference) {
                eventHook.fire(RefResolvedToAuthorize({ negotiationId: negotiation.id, reference: negotiation.fromReference }));
            }
        })
        const stgAuthorizer = new AuthorizerNegotiationStrategy(messenger, negHook);
        const stgAuthorizee = new AuthorizeeNegotiationStrategy(messenger, negHook);

        const getSessionById = (sessionId: string) => {
            return stateMgr.state.authorizeNegotiations.find(n => n.id === sessionId);
        }
        const authorizeManager = new AuthorizeManager(stgAuthorizer, stgAuthorizee, getSessionById);

        messenger.addRecipient(authorizeManager);

        agent.connect().then((me) => { authorizeManager.myId = me.id; })

        commandHook.on(cmd => {
            switch (cmd.type) {
                case "AcceptANegWithLegalEntity": {
                    const sessionId = cmd.negotiationId;

                    const session = failIfFalsy(getSessionById(sessionId), "SessionID unknown");
                    const spec = {
                        ...session!.conceptSpec,
                        legalEntity: cmd.legalEntity,
                    }

                    stgAuthorizer.offer(session!, spec);

                    break;
                } case "RejectANegotiation": {
                    const sessionId = cmd.negotiationId;
                    const session = failIfFalsy(getSessionById(sessionId), "SessionID unknown");

                    stgAuthorizee.reject(session!); // FIXME, always verifiee?
                    break;
                }
            }

        })

        eventHook.on((ev) => {
            switch (ev.type) {
                // case "ANegotiationCompleted": {
                //     if (ev.transaction.verifierId === messenger.me!.id) { // FIXME ugly
                //         commandHook.fire(InvokeIDAuthorize({ negotiationId: ev.transaction.sessionId, transaction: ev.transaction }))
                //     }
                //     break;
                // }
                case "ANegotiationUpdated": {
                    const n = ev.negotiation;
                    this.stateMgr.updateAuthNeg(n);
                    // If I am subject, I invoke the authorize
                    if (n.subjectId === messenger.me!.id && specIsComplete(n.conceptSpec)
                        && n.status === NegStatus.Successful) {
                        const transaction: AuthorizationTransaction = {
                            spec: n.conceptSpec,
                            subjectId: n.subjectId,
                            authorizerId: n.authorizerId,
                            sessionId: n.id,
                        }
                        commandHook.fire(InvokeIDAuthorize({ negotiationId: ev.negotiation.id, transaction }));
                    }
                }
            }
        })

        this.setupTriggerAuthorizeOnResolve(messenger, stgAuthorizee);

    }

    protected setupStateTriggers(commandHook: Hook<UserCommand>) {
        commandHook.on((command) => {
            switch (command.type) {
                case "CreateVReqTemplate":
                    return this.stateMgr.addOutVerifTemplate(command.template);
                case "RemoveVReqTemplate":
                    return this.stateMgr.removeOutVerifTemplate(command.templateId);
                case "CreateAReqTemplate":
                    return this.stateMgr.addOutAuthTemplate(command.template);
                case "RemoveAReqTemplate":
                    return this.stateMgr.removeOutAuthTemplate(command.templateId);
            }
        })
        this.eventHook.on((event) => {
            switch (event.type) {
                case "IDIssuingCompleted":

            }
        })
    }

    protected setupTriggerVerifyOnResolve(messenger: Messenger<Msg>, stgVerifier: VerifierNegotiationStrategy) {

        messenger.addHandler(({ senderId, message }) => {
            if (message.type === "ResolveReference") {
                const reference = message.ref;
                const template = this.stateMgr.state.outgoingVerifTemplates.find(t => t.id === reference);
                if (template) {
                    const { legalEntity, authority } = template

                    stgVerifier.startVerify(this.me!.id, senderId, { legalEntity, authority }, reference, template.id);

                    return true;
                }
            }
            return false;
        });
    }

    protected setupTriggerAuthorizeOnResolve(messenger: Messenger<Msg>, stgAuthorizee: AuthorizeeNegotiationStrategy) {

        messenger.addHandler(({ senderId, message }) => {
            if (message.type === "ResolveReference") {
                const reference = message.ref;
                const template = this.stateMgr.state.outgoingAuthTemplates.find(t => t.id === reference);
                if (template) {
                    const { legalEntity, authority } = template

                    stgAuthorizee.requestToAuthorize(this.me!.id, senderId, { legalEntity, authority }, reference, template.id);

                    return true;
                }
            }
            return false;
        });
    }

}
