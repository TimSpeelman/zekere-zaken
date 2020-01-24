import { Authority, Authorization, InVerificationRequest, IState } from "../types/State";

export function selectMatchingAuthorizations(req: InVerificationRequest) {
    return (state: IState) => state.authorizations.filter((a) => match(req, a));
}

function match(req: InVerificationRequest, auth: Authorization): boolean {
    const correctLegalEntity = !req.legalEntity || req.legalEntity === auth.legalEntity;
    return correctLegalEntity && matchAuthority(req.authority, auth.authority);
}

function matchAuthority(reqAuth: Authority, presentAuth: Authority) {
    return reqAuth.type === presentAuth.type &&
        reqAuth.amount <= presentAuth.amount;
}
