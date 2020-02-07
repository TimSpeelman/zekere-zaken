import { isEqual } from "lodash";
import { VerificationSpec } from "../../services/identity/verification/types";
import { Authority, Authorization, IState } from "../../types/State";
import { selectMyAuthorizations } from "./selectMyAuthorizations";

export function selectMatchingAuthorizations(spec: VerificationSpec) {
    return (state: IState) => selectMyAuthorizations(state).filter((a) => match(spec, a));
}

function match(spec: VerificationSpec, auth: Authorization): boolean {
    const correctLegalEntity = !spec.legalEntity || isEqual(spec.legalEntity, auth.legalEntity);
    return correctLegalEntity && matchAuthority(spec.authority, auth.authority);
}

function matchAuthority(reqAuth: Authority, presentAuth: Authority) {
    return reqAuth.type === presentAuth.type &&
        reqAuth.amount <= presentAuth.amount;
}
