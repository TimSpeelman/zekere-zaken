import { AllowIDVerify, InvokeIDVerify, UserCommand } from "../../commands/Command";
import { DomainEvent, NegotiationUpdated } from "../../commands/Event";
import { Agent, Me } from "../../shared/Agent";
import { Dict } from "../../types/Dict";
import { Profile } from "../../types/State";
import { failIfFalsy } from "../../util/failIfFalsy";
import { Hook } from "../../util/Hook";
import { ProfileExchanger } from "../ProfileExchanger";
import { IDVerifiee } from "./id-layer/IDVerifiee";
import { IDVerifier } from "./id-layer/IDVerifier";
import { IdentityGatewayInterface } from "./IdentityGatewayInterface";
import { Messenger } from "./messaging/Messenger";
import { Envelope, Msg } from "./messaging/types";
import { ReferenceClient } from "./references/ReferenceClient";
import { ReferenceServer } from "./references/ReferenceServer";
import { StateManager } from "./state/StateManager";
import { NegStatus, VerificationResult, VerificationSpec, VerificationTransaction, VerifyNegotiation } from "./verification/types";
import { VerifieeNegotiationStrategy, VerifierNegotiationStrategy, VerifyManager } from "./verification/VerifyManager";

/** MyAgent wraps all services together */
export class MyAgent implements IdentityGatewayInterface {

    readonly eventHook: Hook<DomainEvent> = new Hook('events');
    readonly commandHook: Hook<UserCommand> = new Hook('commands');

    readonly messenger: Messenger<Msg>;

    me?: Me;
    verifiedProfileHook: Hook<{ peerId: string; profile: Profile; }> = new Hook('my-agent:verified-profile');

    waitingForRefs: Dict<(env: Envelope<Msg>) => void> = {};

    constructor(private agent: Agent, private stateMgr: StateManager) {

        // Handle sending of messages between Peers.
        this.messenger = new Messenger<Msg>(agent);

        this.setupProfileExchange(this.messenger, this.stateMgr);

        const { referenceServer } = this.setupReferenceSystem(this.messenger);

        this.setupIDVerify(this.agent, this.stateMgr);

        const { verifyManager, stgVerifier } = this.setupNegotiation(this.agent, this.messenger, this.stateMgr);

        this.setupSaveTemplatesToState();

        this.setupTriggerVerifyOnResolve(referenceServer, stgVerifier);

        this.eventHook.on((e) => {
            switch (e.type) {
                case "RefResolvedToVerify":
                    return window.location.assign(`#/verifs/inbox/${e.negotiationId}`);

            }
        })

        this.connect().then(me => {
            this.me = me;
        });
    }

    setupProfileExchange(messenger: Messenger<Msg>, stateMgr: StateManager) {
        // Take care of exchanging profiles between peers.
        const profileEx = new ProfileExchanger(messenger, () => stateMgr.state.profile!);
        messenger.addRecipient(profileEx);

        // FIXME: For now we send our profile to every peer who sends us a message
        messenger.addHandler((env) => { profileEx.sendProfileToPeer(env.senderId); return false });

        // Save profiles after they have been verified
        profileEx.verifiedProfileHook.on(({ peerId, profile }) => stateMgr.addProfile(peerId, profile));
    }

    setupReferenceSystem(messenger: Messenger<Msg>) {

        // Ensure that references we create can be resolved
        const referenceServer = new ReferenceServer();
        messenger.addRecipient(referenceServer);

        // Resolves references created by other peers
        const referenceClient = new ReferenceClient<Msg>(messenger);
        messenger.addRecipient(referenceClient);

        // On ResolveReference command, resolve a reference
        this.commandHook.on((a) => a.type === "ResolveReference" &&
            referenceClient.requestToResolveBroadcast(a.reference));

        return { referenceServer };
    }

    setupIDVerify(agent: Agent, stageMgr: StateManager) {


        const getTransactionById = (tId: string): VerificationTransaction | undefined => {
            const neg = stageMgr.state.negotiations.find(n => n.sessionId === tId && n.status === NegStatus.Successful);

            return !neg || !specIsComplete(neg.conceptSpec) ? undefined : {
                sessionId: neg.sessionId,
                spec: neg.conceptSpec,
                subjectId: neg.subjectId,
                verifierId: neg.verifierId,
            };
        };

        const verifier = new IDVerifier(agent);

        const verifiee = new IDVerifiee(getTransactionById);
        agent.setVerificationRequestHandler((r) => verifiee.handleVerificationRequest(r));

        verifier.completedVerifyHook.on((result) => {
            const neg = stageMgr.state.negotiations.find(n => n.sessionId === result.sessionId);
            if (neg && result.result === VerificationResult.Succeeded) {
                stageMgr.addVerified({
                    templateId: neg.fromTemplateId!,
                    sessionId: neg.sessionId,
                    // @ts-ignore FIXME
                    spec: neg.conceptSpec,
                })
            }
        })

        this.commandHook.on((cmd) => cmd.type === "InvokeIDVerify" &&
            verifier.verify(cmd.transaction));
    }

    setupNegotiation(agent: Agent, messenger: Messenger<Msg>, stateMgr: StateManager) {

        const negHook = new Hook<VerifyNegotiation>('neg-hook');
        negHook.on((negotiation) => {
            this.eventHook.fire(NegotiationUpdated({ negotiation }))
        })
        const stgVerifier = new VerifierNegotiationStrategy(messenger, negHook);
        const stgVerifiee = new VerifieeNegotiationStrategy(messenger, negHook);

        const getSessionById = (sessionId: string) => {
            console.log("Looking up session", sessionId, "in", stateMgr.state.negotiations);
            return stateMgr.state.negotiations.find(n => n.sessionId === sessionId);
        }
        const verifyManager = new VerifyManager(stgVerifier, stgVerifiee, getSessionById, this.eventHook);

        messenger.addRecipient(verifyManager);

        // verifyManager.newDraftHook.on(
        //     (draft) => {
        //         stateMgr.addInVerifReq({
        //             id: draft.draftId,
        //             verifierId: draft.verifierId,
        //             authority: draft.spec?.authority!,
        //             legalEntity: draft.spec?.legalEntity,
        //             datetime: new Date().toISOString(), // FIXME
        //         })
        //     }
        // );

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

                    // const session = verifyManager.getSessionById(peerId, sessionId);
                    // session.offer({
                    //     authority: session.spec?.authority,
                    //     legalEntity: cmd.legalEntity
                    // });

                    // this.commandHook.fire(AllowIDVerify({ negotiationId: cmd.negotiationId, transaction: session.getTransaction()! }))
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
                    } else {
                        this.commandHook.fire(AllowIDVerify({ negotiationId: ev.transaction.sessionId, transaction: ev.transaction }))
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

    protected setupTriggerVerifyOnResolve(referenceServer: ReferenceServer, stgVerifier: VerifierNegotiationStrategy) {

        referenceServer.addHandler(({ requesterId, reference }) => {
            const template = this.stateMgr.state.outgoingVerifTemplates.find(t => t.id === reference);
            if (template) {
                const { legalEntity, authority } = template

                stgVerifier.startVerify(this.me!.id, requesterId, { legalEntity, authority }, reference, template.id);

                return true;
            }
            return false;
        });
    }

}

function specIsComplete(spec?: Partial<VerificationSpec>): spec is VerificationSpec {
    return !!spec && !!spec.authority && !!spec.legalEntity;
}
