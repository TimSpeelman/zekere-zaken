import { UserCommand } from "../../commands/Command";
import { AInReqAnswered, ATemplateAnswered, DomainEvent } from "../../commands/Event";
import { AuthorizationFromNeg } from "../../types/State";
import { Hook } from "../../util/Hook";
import { StateManager } from "../state/StateManager";

export class StateMiddleware {

    constructor(
        private stateMgr: StateManager,
        private commandHook: Hook<UserCommand>,
        private eventHook: Hook<DomainEvent>,
    ) { }

    setup() {
        this.commandHook.on((command) => {
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
                case "ATemplateAnswered": {
                    const { state } = this.stateMgr;
                    this.stateMgr.setState({
                        outgoingAuthTemplates: state.outgoingAuthTemplates
                            .map(template => template.id !== event.templateId ? template :
                                { ...template, answeredWithAuthorizationId: event.authorizationId })
                    })
                    break;
                } case "AInReqAnswered": {
                    const { state } = this.stateMgr;
                    this.stateMgr.setState({
                        authorizeNegotiations: state.authorizeNegotiations
                            .map(neg => neg.id !== event.negotiationId ? neg :
                                { ...neg, resultedInAuthId: event.authorizationId })
                    })
                    break;
                } case "IDIssuingCompleted": {
                    const neg = this.stateMgr.state.authorizeNegotiations.find(n => n.id === event.negotiationId);
                    if (!!neg) {

                        if (neg.subjectId === this.stateMgr.state.myId) {

                            this.stateMgr.addMyAuthorization(AuthorizationFromNeg(neg)!);

                            if (neg.fromTemplateId) {
                                this.eventHook.fire(ATemplateAnswered({
                                    templateId: neg.fromTemplateId,
                                    authorizationId: neg.id
                                }))
                            }

                        } else {
                            this.stateMgr.addGivenAuthorization(AuthorizationFromNeg(neg)!);

                            this.eventHook.fire(AInReqAnswered({
                                negotiationId: neg.id,
                                authorizationId: neg.id
                            }))
                        }
                    } else {
                        throw new Error('Completed negotiation could not be found')
                    }
                }
            }
        })
    }

}
