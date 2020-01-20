
export interface IState {
    incomingVerifReqs: InVerificationRequest[];
    outgoingVerifReqs: OutVerificationRequest[];

    incomingAuthReqs: InAuthorizationRequest[];
    outgoingAuthReqs: OutAuthorizationRequest[];
}

export interface InVerificationRequest {
    id: string;
    from: Actor;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: Date;
}

export interface InAuthorizationRequest {
    id: string;
    from: Actor;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: Date;
}

export interface OutVerificationRequest {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: Date;
}

export interface OutAuthorizationRequest {
    id: string;
    legalEntity?: LegalEntity;
    authority: Authority;
    datetime: Date;
}

export interface Actor {
    name: string;
    photo?: string;
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