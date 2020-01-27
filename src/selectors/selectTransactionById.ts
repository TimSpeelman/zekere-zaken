import { NegStatus, specIsComplete, VerificationTransaction } from "../services/identity/verification/types";
import { IState } from "../types/State";

export function selectTransactionById(tId: string) {
    return (state: IState): VerificationTransaction | undefined => {
        const neg = state.negotiations.find(n => n.sessionId === tId && n.status === NegStatus.Successful);

        return !neg || !specIsComplete(neg.conceptSpec) ? undefined : {
            sessionId: neg.sessionId,
            spec: neg.conceptSpec,
            subjectId: neg.subjectId,
            verifierId: neg.verifierId,
        };
    };

};
