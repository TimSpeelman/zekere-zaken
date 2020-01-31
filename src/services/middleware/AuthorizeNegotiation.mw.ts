import { InvokeIDAuthorize, UserCommand } from "../../commands/Command";
import { ANegotiationUpdated, DomainEvent, RefResolvedToAuthorize } from "../../commands/Event";
import { failIfFalsy } from "../../util/failIfFalsy";
import { Hook } from "../../util/Hook";
import { AuthorizeeNegotiationStrategy, AuthorizeManager, AuthorizerNegotiationStrategy } from "../identity/authorization/AuthorizeManager";
import { AuthorizationTransaction, AuthorizeNegotiation, NegStatus, specIsComplete } from "../identity/authorization/types";
import { Agent } from "../identity/id-layer/Agent";
import { Messenger } from "../messaging/Messenger";
import { Msg } from "../messaging/types";
import { StateManager } from "../state/StateManager";


export class AuthorizeNegotiationMiddleware {

    constructor(
        private eventHook: Hook<DomainEvent>,
        private commandHook: Hook<UserCommand>,
        private stateMgr: StateManager,
        private messenger: Messenger<Msg>,
        private agent: Agent,
    ) { }

    setup() {

        const negHook = new Hook<AuthorizeNegotiation>('neg-hook');
        negHook.on((negotiation) => {
            const isNew = !this.stateMgr.state.authorizeNegotiations.find(n => n.id === negotiation.id);

            this.eventHook.fire(ANegotiationUpdated({ negotiation }))

            if (isNew && negotiation.fromReference) {
                this.eventHook.fire(RefResolvedToAuthorize({ negotiationId: negotiation.id, reference: negotiation.fromReference }));
            }
        })
        const stgAuthorizer = new AuthorizerNegotiationStrategy(this.messenger, negHook);
        const stgAuthorizee = new AuthorizeeNegotiationStrategy(this.messenger, negHook);

        const getSessionById = (sessionId: string) => {
            return this.stateMgr.state.authorizeNegotiations.find(n => n.id === sessionId);
        }
        const authorizeManager = new AuthorizeManager(stgAuthorizer, stgAuthorizee, getSessionById);

        this.messenger.addRecipient(authorizeManager);

        this.agent.connect().then((me) => { authorizeManager.myId = me.id; })

        this.commandHook.on(cmd => {
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

        this.eventHook.on((ev) => {
            switch (ev.type) {
                case "ANegotiationUpdated": {
                    const n = ev.negotiation;

                    // If I am subject, I invoke the authorize
                    if (n.subjectId === this.messenger.me!.id && specIsComplete(n.conceptSpec)
                        && n.status === NegStatus.Successful) {
                        const transaction: AuthorizationTransaction = {
                            spec: n.conceptSpec,
                            subjectId: n.subjectId,
                            authorizerId: n.authorizerId,
                            sessionId: n.id,
                        }
                        this.commandHook.fire(InvokeIDAuthorize({ negotiationId: ev.negotiation.id, transaction }));
                    }
                }
            }
        })

        this.setupTriggerAuthorizeOnResolve(stgAuthorizee);
    }


    protected setupTriggerAuthorizeOnResolve(stgAuthorizee: AuthorizeeNegotiationStrategy) {

        this.messenger.addHandler(({ senderId, message }) => {
            if (message.type === "ResolveReference") {
                const reference = message.ref;
                const template = this.stateMgr.state.outgoingAuthTemplates.find(t => t.id === reference);
                if (template) {
                    const { legalEntity, authority } = template

                    stgAuthorizee.requestToAuthorize(this.messenger.me!.id, senderId, { legalEntity, authority }, reference, template.id);

                    return true;
                }
            }
            return false;
        });
    }


}