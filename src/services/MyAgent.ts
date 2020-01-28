import { InvokeIDVerify, NavigateTo, UserCommand } from "../commands/Command";
import { DomainEvent, IDVerifyCompleted, NegotiationUpdated, RefResolvedToVerify } from "../commands/Event";
import { selectTransactionById } from "../selectors/selectTransactionById";
import { Agent, Me } from "../shared/Agent";
import { failIfFalsy } from "../util/failIfFalsy";
import { Hook } from "../util/Hook";
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
    private commandHook: Hook<UserCommand> = new Hook('commands');

    private messenger: Messenger<Msg>;

    me?: Me;

    constructor(private agent: Agent, private stateMgr: StateManager) {

        // Handle sending of messages between Peers.
        const messenger = new Messenger<Msg>(agent);
        this.messenger = messenger;

        this.setupProfileExchange(messenger, stateMgr);

        this.setupReferenceSystem(messenger, this.commandHook);

        this.setupIDVerify(agent, stateMgr, this.commandHook, this.eventHook);

        this.setupVerifyNegotiation(agent, messenger, stateMgr, this.commandHook, this.eventHook);

        this.setupStateTriggers(this.commandHook);

        this.setupUITriggers(this.commandHook, this.eventHook);

        this.connect().then(me => {
            this.me = me;
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
            selectTransactionById(transactionId)(stageMgr.state);

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
            const neg = stageMgr.state.negotiations.find(n => n.sessionId === result.sessionId);
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

    protected setupVerifyNegotiation(agent: Agent, messenger: Messenger<Msg>, stateMgr: StateManager, commandHook: Hook<UserCommand>, eventHook: Hook<DomainEvent>) {

        const negHook = new Hook<VerifyNegotiation>('neg-hook');
        negHook.on((negotiation) => {
            const isNew = !stateMgr.state.negotiations.find(n => n.sessionId === negotiation.sessionId);

            eventHook.fire(NegotiationUpdated({ negotiation }))

            if (isNew && negotiation.fromReference) {
                eventHook.fire(RefResolvedToVerify({ negotiationId: negotiation.sessionId, reference: negotiation.fromReference }));
            }
        })
        const stgVerifier = new VerifierNegotiationStrategy(messenger, negHook);
        const stgVerifiee = new VerifieeNegotiationStrategy(messenger, negHook);

        const getSessionById = (sessionId: string) => {
            return stateMgr.state.negotiations.find(n => n.sessionId === sessionId);
        }
        const verifyManager = new VerifyManager(stgVerifier, stgVerifiee, getSessionById);

        messenger.addRecipient(verifyManager);

        agent.connect().then((me) => { verifyManager.myId = me.id; })

        commandHook.on(cmd => {
            switch (cmd.type) {
                case "AcceptNegWithLegalEntity": {
                    const sessionId = cmd.negotiationId;

                    const session = failIfFalsy(getSessionById(sessionId), "SessionID unknown");
                    const spec = {
                        ...session!.conceptSpec,
                        legalEntity: cmd.legalEntity,
                    }

                    stgVerifiee.offer(session!, spec);

                    break;
                } case "RejectNegotiation": {
                    const sessionId = cmd.negotiationId;
                    const session = failIfFalsy(getSessionById(sessionId), "SessionID unknown");

                    stgVerifiee.reject(session!); // FIXME, always verifiee?
                    break;
                }
            }

        })

        eventHook.on((ev) => {
            switch (ev.type) {
                case "NegotiationCompleted": {
                    if (ev.transaction.verifierId === messenger.me!.id) { // FIXME ugly
                        commandHook.fire(InvokeIDVerify({ negotiationId: ev.transaction.sessionId, transaction: ev.transaction }))
                    }
                    break;
                }
                case "NegotiationUpdated": {
                    const n = ev.negotiation;
                    this.stateMgr.updateNeg(n);
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

    protected setupStateTriggers(commandHook: Hook<UserCommand>) {
        commandHook.on((command) => {
            switch (command.type) {
                case "CreateVReqTemplate":
                    return this.stateMgr.addOutVerifTemplate(command.template);
                case "RemoveVReqTemplate":
                    return this.stateMgr.removeOutVerifTemplate(command.templateId);
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

}
