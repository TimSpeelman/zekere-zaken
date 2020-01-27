import { InvokeIDVerify, NavigateTo, UserCommand } from "../commands/Command";
import { DomainEvent, IDVerifyCompleted, NegotiationUpdated } from "../commands/Event";
import { selectTransactionById } from "../selectors/selectTransactionById";
import { Agent, Me } from "../shared/Agent";
import { failIfFalsy } from "../util/failIfFalsy";
import { Hook } from "../util/Hook";
import { IDVerifiee } from "./identity/id-layer/IDVerifiee";
import { IDVerifier } from "./identity/id-layer/IDVerifier";
import { ProfileExchanger } from "./identity/profiles/ProfileExchanger";
import { VerificationSpec, VerificationTransaction, VerifyNegotiation, VerifyNegotiationResult } from "./identity/verification/types";
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
        this.messenger = new Messenger<Msg>(agent);

        this.setupProfileExchange(this.messenger, this.stateMgr);

        this.setupReferenceSystem(this.messenger);

        this.setupIDVerify(this.agent, this.stateMgr);

        const { verifyManager, stgVerifier } = this.setupNegotiation(this.agent, this.messenger, this.stateMgr);

        this.setupSaveTemplatesToState();

        this.setupTriggerVerifyOnResolve(this.messenger, stgVerifier);

        this.eventHook.on((e) => {
            switch (e.type) {
                case "RefResolvedToVerify":
                    return this.commandHook.fire(NavigateTo({ path: `#/verifs/inbox/${e.negotiationId}` }));

            }
        })

        this.connect().then(me => {
            this.me = me;
        });

        this.commandHook.on((cmd) => {
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

    protected setupReferenceSystem(messenger: Messenger<Msg>) {

        // Resolves references created by other peers
        const referenceClient = new ReferenceClient<Msg>(messenger);
        messenger.addRecipient(referenceClient);

        // On ResolveReference command, resolve a reference
        this.commandHook.on((a) => a.type === "ResolveReference" &&
            referenceClient.requestToResolveBroadcast(a.reference));

    }

    protected setupIDVerify(agent: Agent, stageMgr: StateManager) {

        const getTransactionById = (transactionId: string) =>
            selectTransactionById(transactionId)(stageMgr.state);

        const verifier = new IDVerifier(agent);

        const verifiee = new IDVerifiee(getTransactionById);
        agent.setVerificationRequestHandler((r) => verifiee.handleVerificationRequest(r));

        verifiee.completedVerifyHook.on((result) => {
            this.eventHook.fire(IDVerifyCompleted({
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

                this.eventHook.fire(IDVerifyCompleted({
                    negotiationId: result.sessionId,
                    result: result.result,
                }))
            }
        })

        this.commandHook.on((cmd) => cmd.type === "InvokeIDVerify" &&
            verifier.verify(cmd.transaction));
    }

    protected setupNegotiation(agent: Agent, messenger: Messenger<Msg>, stateMgr: StateManager) {

        const negHook = new Hook<VerifyNegotiation>('neg-hook');
        negHook.on((negotiation) => {
            this.eventHook.fire(NegotiationUpdated({ negotiation }))
        })
        const stgVerifier = new VerifierNegotiationStrategy(messenger, negHook);
        const stgVerifiee = new VerifieeNegotiationStrategy(messenger, negHook);

        const getSessionById = (sessionId: string) => {
            return stateMgr.state.negotiations.find(n => n.sessionId === sessionId);
        }
        const verifyManager = new VerifyManager(stgVerifier, stgVerifiee, getSessionById, this.eventHook);

        messenger.addRecipient(verifyManager);

        agent.connect().then((me) => { verifyManager.myId = me.id; })

        this.commandHook.on(cmd => {
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

        this.eventHook.on((ev) => {
            switch (ev.type) {
                case "NegotiationCompleted": {
                    if (ev.transaction.verifierId === messenger.me!.id) { // FIXME ugly
                        this.commandHook.fire(InvokeIDVerify({ negotiationId: ev.transaction.sessionId, transaction: ev.transaction }))
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
                        this.commandHook.fire(InvokeIDVerify({ negotiationId: ev.negotiation.sessionId, transaction }));
                    }
                }
            }
        })

        return { verifyManager, stgVerifier };
    }

    dispatch(command: UserCommand) {

        this.commandHook.fire(command);

    }

    connect(): Promise<Me> {
        this.messenger.connect();
        return this.agent.connect();
    }

    protected setupSaveTemplatesToState() {
        this.commandHook.on((command) => {
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

function specIsComplete(spec?: Partial<VerificationSpec>): spec is VerificationSpec {
    return !!spec && !!spec.authority && !!spec.legalEntity;
}
