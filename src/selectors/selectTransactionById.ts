import { AuthorizationTransaction } from "../services/identity/authorization/types";
import { NegStatus, specIsComplete, VerificationTransaction } from "../services/identity/verification/types";
import { IState } from "../types/State";

export function selectVTransactionById(tId: string) {
    return (state: IState): VerificationTransaction | undefined => {
        const neg = state.verifyNegs.find(n => n.sessionId === tId && n.status === NegStatus.Successful);

        return !neg || !specIsComplete(neg.conceptSpec) ? undefined : {
            sessionId: neg.sessionId,
            spec: neg.conceptSpec,
            subjectId: neg.subjectId,
            verifierId: neg.verifierId,
        };
    };

};

export function selectATransactionById(tId: string) {
    return (state: IState): AuthorizationTransaction | undefined => {
        const neg = state.authNegs.find(n => n.sessionId === tId && n.status === NegStatus.Successful);

        return !neg || !specIsComplete(neg.conceptSpec) ? undefined : {
            sessionId: neg.sessionId,
            spec: neg.conceptSpec,
            subjectId: neg.subjectId,
            authorizerId: neg.authorizerId,
        };
    };

};
