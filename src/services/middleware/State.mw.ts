import uuid from "uuid/v4";
import { UserCommand } from "../../commands/Command";
import { AInReqAnswered, ATemplateAnswered, DomainEvent } from "../../commands/Event";
import { AuthorizationFromNeg } from "../../types/State";
import { Hook } from "../../util/Hook";
import { AuthorizeNegotiationResult } from "../identity/authorization/types";
import { VerifyNegotiationResult } from "../identity/verification/types";
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
                case "ClearCache":
                    return this.stateMgr.clearCache();
            }
        })
        this.eventHook.on((event) => {
            switch (event.type) {
                case "ProfileVerified":
                    return this.stateMgr.setState((s) => ({ profiles: { ...s.profiles, [event.peerId]: { status: "Verified", profile: event.profile } } }));
                case "ProfileRequested":
                    return this.stateMgr.setState((s) => ({ profiles: { ...s.profiles, [event.peerId]: { status: "Verifying" } } }));
                case "ProfileVerificationFailed":
                    return this.stateMgr.setState((s) => ({ profiles: { ...s.profiles, [event.peerId]: { status: "Failed" } } }));

                case "VNegotiationUpdated": {
                    this.stateMgr.updateVerifyNeg(event.negotiation);
                    break;
                } case "ANegotiationUpdated": {
                    this.stateMgr.updateAuthNeg(event.negotiation);
                    break;
                } case "ATemplateAnswered": {
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
                } case "IDVerifyCompleted": {
                    const neg = this.stateMgr.state.verifyNegotiations.find(n => n.sessionId === event.negotiationId);

                    if (neg && event.result === VerifyNegotiationResult.Succeeded) {
                        this.stateMgr.addSucceededIDVerify({
                            templateId: neg.fromTemplateId!,
                            sessionId: neg.sessionId,
                            // @ts-ignore FIXME
                            spec: neg.conceptSpec,
                        })
                    }

                    break;
                } case "IDIssuingCompleted": {

                    const neg = this.stateMgr.state.authorizeNegotiations.find(n => n.id === event.negotiationId);

                    if (!!neg) {

                        if (event.result === AuthorizeNegotiationResult.Succeeded) {
                            this.stateMgr.addSucceededIDAuthorize({
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
