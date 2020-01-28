import { AuthorizeNegotiation } from "../services/identity/authorization/types";
import { VerificationSpec, VerifyNegotiation } from "../services/identity/verification/types";
import { Dict } from "./Dict";

export interface IState {
    verifyNegs: VerifyNegotiation[];
    authNegs: AuthorizeNegotiation[];
    verified: Verified[];

    incomingVerifReqs: InVerificationRequest[];
    outgoingVerifTemplates: VerificationTemplate[];

    incomingAuthReqs: InAuthorizationRequest[];
    outgoingAuthTemplates: AuthorizationTemplate[];

    authorizations: Authorization[];

    profile?: Profile;

    /** A profile per peerID */
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

export interface InVerificationRequest {
    id: string;
    authority: Authority;
    datetime: string;
    verifierId: string;
    legalEntity?: LegalEntity;
}

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
