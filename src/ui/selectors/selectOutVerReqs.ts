import { VerificationSpec, VerificationTransaction } from "../../services/identity/verification/types";
import { IState, VerificationTemplate } from "../../types/State";

export interface OutVerReq {
    template: VerificationTemplate,
    transactions: VerificationTransaction[],
}

export function selectOutVerReqs(state: IState): OutVerReq[] {
    return state.outgoingVerifTemplates.map(t => ({
        template: t,
        transactions: selectCompletedTransactionsByTemplateId(t.id)(state),
    }))
}

export function selectOutVerReqByTemplateId(templateId: string) {
    return (state: IState) => selectOutVerReqs(state).find(t => t.template.id === templateId);
}

export function selectCompletedTransactionsByTemplateId(templateId: string) {
    return (state: IState) =>
        state.verified.filter(v => v.templateId === templateId).map(v =>
            state.verifyNegs.filter(n => n.sessionId === v.sessionId).map((n): VerificationTransaction => ({
                sessionId: n.sessionId,
                // @ts-ignore FIXME
                spec: n.conceptSpec! as VerificationSpec,
                subjectId: n.subjectId,
                verifierId: n.verifierId,
            }))[0]
        );
}
