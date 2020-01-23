import { Dict } from "./Dict";

export interface IState {
    incomingVerifReqs: InVerificationRequest[];
    outgoingVerifReqs: OutVerificationRequest[];

    incomingAuthReqs: InAuthorizationRequest[];
    outgoingAuthReqs: OutAuthorizationRequest[];

    profile?: Profile;

    /** A profile per peerID */
    profiles: Dict<Profile>;
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
    // from: Actor;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
    verifierId: string;
}

export interface InAuthorizationRequest {
    id: string;
    subjectId: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
}

export interface OutVerificationRequest {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
    verifierId: string;
}

export interface OutAuthorizationRequest {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: string;
    subjectId: string;
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
