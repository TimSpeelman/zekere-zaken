import { InvokeIDVerify, UserCommand, VerifyProfile } from "../../commands/Command";
import { DomainEvent, RefResolvedToVerify, VNegotiationUpdated, VTemplateAnswered } from "../../commands/Event";
import { failIfFalsy } from "../../util/failIfFalsy";
import { Hook } from "../../util/Hook";
import { specIsComplete } from "../identity/authorization/types";
import { Agent } from "../identity/id-layer/Agent";
import { VerificationTransaction, VerifyNegotiation } from "../identity/verification/types";
import { VerifieeNegotiationStrategy, VerifierNegotiationStrategy, VerifyManager } from "../identity/verification/VerifyManager";
import { Messenger } from "../messaging/Messenger";
import { Msg } from "../messaging/types";
import { StateManager } from "../state/StateManager";


export class VerifyNegotiationMiddleware {

    constructor(
        private eventHook: Hook<DomainEvent>,
        private commandHook: Hook<UserCommand>,
        private stateMgr: StateManager,
        private messenger: Messenger<Msg>,
        private agent: Agent,
    ) { }

    setup() {

        const negHook = new Hook<VerifyNegotiation>('neg-hook');

        negHook.on((negotiation) => {
            const isNew = !this.stateMgr.state.verifyNegotiations.find(n => n.sessionId === negotiation.sessionId);

            // FIXME
            this.commandHook.fire(VerifyProfile({ peerId: negotiation.verifierId }));
            this.commandHook.fire(VerifyProfile({ peerId: negotiation.subjectId }));
            this.eventHook.fire(VNegotiationUpdated({ negotiation }))

            if (isNew && negotiation.fromReference) {
                this.eventHook.fire(RefResolvedToVerify({ negotiationId: negotiation.sessionId, reference: negotiation.fromReference }));
            }
        })

        const stgVerifier = new VerifierNegotiationStrategy(this.messenger, negHook);
        const stgVerifiee = new VerifieeNegotiationStrategy(this.messenger, negHook);
        const verifyManager = new VerifyManager(stgVerifier, stgVerifiee, this.getSessionById);

        this.messenger.addRecipient(verifyManager);

        this.agent.connect().then((me) => { verifyManager.myId = me.id; })

        this.commandHook.on(cmd => {
            switch (cmd.type) {
                case "AcceptVNegWithLegalEntity": {
                    const sessionId = cmd.negotiationId;

                    const session = failIfFalsy(this.getSessionById(sessionId), "SessionID unknown");
                    const spec = {
                        ...session!.conceptSpec,
                        legalEntity: cmd.legalEntity,
                    }

                    stgVerifiee.offer(session!, spec);

                    break;
                } case "RejectVNegotiation": {
                    const sessionId = cmd.negotiationId;
                    const session = failIfFalsy(this.getSessionById(sessionId), "SessionID unknown");

                    stgVerifiee.reject(session!); // FIXME, always verifiee?
                    break;
                }
            }

        })

        this.eventHook.on((ev) => {
            switch (ev.type) {
                case "IDVerifyCompleted": {
                    const neg = this.stateMgr.state.verifyNegotiations.find(n => n.sessionId === ev.negotiationId);

                    if (!!neg && neg.fromTemplateId) {
                        this.eventHook.fire(VTemplateAnswered({ templateId: neg.fromTemplateId, negotiationId: ev.negotiationId }))
                    }
                    break;
                }
            }
        })

        this.setupIDVerifyTriggers();
        this.setupTriggerVerifyOnResolve(stgVerifier);
    }


    protected setupTriggerVerifyOnResolve(stgVerifier: VerifierNegotiationStrategy) {

        this.messenger.addHandler(({ senderId, message }) => {
            if (message.type === "ResolveReference") {
                const reference = message.ref;
                const template = this.stateMgr.state.outgoingVerifTemplates.find(t => t.id === reference);
                if (template) {
                    const { legalEntity, authority } = template

                    stgVerifier.startVerify(this.messenger.me!.id, senderId, { legalEntity, authority }, reference, template.id);

                    return true;
                }
            }
            return false;
        });
    }

    protected setupIDVerifyTriggers() {

        this.eventHook.on((ev) => {
            switch (ev.type) {

                case "VNegotiationCompleted": {
                    if (ev.transaction.verifierId === this.messenger.me!.id) { // FIXME ugly
                        this.commandHook.fire(InvokeIDVerify({ negotiationId: ev.transaction.sessionId, transaction: ev.transaction }))
                    }
                    break;
                }
                case "VNegotiationUpdated": {
                    const n = ev.negotiation;
                    if (n.verifierId === this.messenger.me!.id && specIsComplete(n.conceptSpec)) {
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
        });
    }

    protected getSessionById = (sessionId: string) => {
        return this.stateMgr.state.verifyNegotiations.find(n => n.sessionId === sessionId);
    }

}