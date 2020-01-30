import { AuthorizeNegotiation } from "../services/identity/authorization/types";
import { VerificationSpec, VerifyNegotiation } from "../services/identity/verification/types";
import { Dict } from "./Dict";

export interface IState {
    /** For Verifier. Templates to verify one or more subjects. */
    outgoingVerifTemplates: VerificationTemplate[];

    /** For Verifier and Subject. Ongoing and past negotiations to Verify. */
    verifyNegs: VerifyNegotiation[];

    /** For Verifier and Subject. Results of IDVerify procedure. */
    verified: Verified[];

    /** For Subject. Templates to request authorization from an authorizer. */
    outgoingAuthTemplates: AuthorizationTemplate[];

    /** For Subject and Authorizer. Ongoing and past negotiations to Authorize. */
    authNegs: AuthorizeNegotiation[];

    /** For Subject. Authorizations issued to the current user. */
    myAuthorizations: Authorization[];
    
    /** For Authorizer. Authorizations issued by the current user to other subjects. */
    givenAuthorizations: Authorization[];

    /** Profile of current user */
    profile?: Profile;

    /** Profiles of other users (indexed by PeerID) */
    profiles: Dict<Profile>;
}


export interface Verified {
    templateId: string;
    sessionId: string;
    spec: VerificationSpec;
}

export interface VerificationRequest {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
    verifierId: string;
}

/** Derived from VNeg */
export interface InVerificationRequest {
    id: string;
    authority: Authority;
    datetime: string;
    verifierId: string;
    legalEntity?: LegalEntity;
}

/** Derived from ANeg */
export interface InAuthorizationRequest {
    id: string;
    subjectId: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
}

export interface VerificationTemplate {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
}

export interface AuthorizationTemplate {
    id: string;
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
