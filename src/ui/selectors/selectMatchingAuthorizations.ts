import { VerificationSpec } from "../../services/identity/verification/types";
import { Authority, Authorization, IState } from "../../types/State";

export function selectMatchingAuthorizations(spec: VerificationSpec) {
    return (state: IState) => state.authorizations.filter((a) => match(spec, a));
}

function match(spec: VerificationSpec, auth: Authorization): boolean {
    const correctLegalEntity = !spec.legalEntity || spec.legalEntity === auth.legalEntity;
    return correctLegalEntity && matchAuthority(spec.authority, auth.authority);
}

function matchAuthority(reqAuth: Authority, presentAuth: Authority) {
    return reqAuth.type === presentAuth.type &&
        reqAuth.amount <= presentAuth.amount;
}
