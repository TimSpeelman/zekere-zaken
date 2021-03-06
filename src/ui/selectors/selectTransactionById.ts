import { AuthorizationTransaction } from "../../services/identity/authorization/types";
import { specIsComplete, VerificationTransaction } from "../../services/identity/verification/types";
import { IState } from "../../types/State";

export function selectVTransactionById(tId: string) {
    return (state: IState): VerificationTransaction | undefined => {
        const neg = state.verifyNegotiations.find(n => n.sessionId === tId && n.subjectAccepts);

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
        const neg = state.authorizeNegotiations.find(n => n.id === tId && n.authorizerAccepts);

        return !neg || !specIsComplete(neg.conceptSpec) ? undefined : {
            sessionId: neg.id,
            spec: neg.conceptSpec,
            subjectId: neg.subjectId,
            authorizerId: neg.authorizerId,
        };
    };

};
