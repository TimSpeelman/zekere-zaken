import { AuthorizationSpec, AuthorizeNegotiation } from "../services/identity/authorization/types";
import { VerificationSpec, VerifyNegotiation } from "../services/identity/verification/types";
import { Dict } from "./Dict";

export interface IState {
    myId: string;

    /** For Verifier. Templates to verify one or more subjects. */
    outgoingVerifTemplates: VerificationTemplate[];

    /** For Verifier and Subject. Ongoing and past negotiations to Verify. */
    verifyNegotiations: VerifyNegotiation[];

    /** For Verifier and Subject. Successful results of IDVerify procedure. */
    succeededIDVerify: SucceededIDVerify[];

    /** For Subject. Templates to request authorization from an authorizer. */
    outgoingAuthTemplates: AuthorizationTemplate[];

    /** For Subject and Authorizer. Ongoing and past negotiations to Authorize. */
    authorizeNegotiations: AuthorizeNegotiation[];

    /** For Subject and Authorizer. Successful results of IDAuthorize procedure.  */
    succeededIDAuthorize: SucceededIDAuthorize[];

    /** For Authorizer. Authorizations issued to the current user. */
    myAuthorizations: Authorization[];

    /** For Authorizer. Authorizations issued by the current user to other subjects. */
    givenAuthorizations: Authorization[];

    /** Profile of current user */
    profile?: Profile;

    /** Profiles of other users (indexed by PeerID) */
    profiles: Dict<Profile>;
}

/** For Verifier. Templates to verify one or more subjects. */
export interface VerificationTemplate {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
}

/** For Verifier and Subject. Successful results of IDVerify procedure. */
export interface SucceededIDVerify {
    templateId: string;
    sessionId: string;
    spec: VerificationSpec;
}

/** Derived from VNeg */
export interface InVerificationRequest {
    id: string;
    authority: Authority;
    datetime: string;
    verifierId: string;
    legalEntity?: LegalEntity;
}

/** For Subject. Templates to request authorization from an authorizer. */
export interface AuthorizationTemplate {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
}

/** Derived from ANeg */
export interface InAuthorizationRequest {
    id: string;
    subjectId: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
}

export interface OutAuthorizationRequest {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
    subjectId: string;
}

/** For Subject and Authorizer. Successful results of IDAuthorize procedure.  */
export interface SucceededIDAuthorize {
    templateId?: string;
    sessionId: string;
    spec: AuthorizationSpec;
}

/** Derived */
export interface Authorization {
    fromTemplateId?: string;
    id: string;
    legalEntity: LegalEntity;
    authority: Authority;
    issuedAt: string;
    issuerId: string;
    subjectId: string;
    sessionId: string;
}

export function AuthorizationFromNeg(neg: AuthorizeNegotiation): Authorization | undefined {
    return {
        authority: neg.conceptSpec!.authority!,
        id: neg.id,
        issuedAt: new Date().toISOString(), // FIXME
        issuerId: neg.authorizerId,
        legalEntity: neg.conceptSpec!.legalEntity!,
        sessionId: neg.id,
        subjectId: neg.subjectId,
        fromTemplateId: neg.fromTemplateId,
    };
}

export interface Actor {
    name: string;
    photo: string;
}

export interface LegalEntity {
    name: string;
    kvknr: string;
    address: string;
}

export interface Authority {
    type: KVKAuthorityType;
    amount: number;
}

export enum KVKAuthorityType {
    Inkoop = "Inkoop",
    Verkoop = "Verkoop",
    Garantie = "Garantie",
    Lease = "Lease",
    Financiering = "Financiering",
    Software = "Software",
    Onderhoud = "Onderhoud",
}

export interface Profile {
    name: string;
    photo: string;
}
