import { AuthorizationTransaction, AuthorizeNegotiation, AuthorizeNegotiationResult } from "../services/identity/authorization/types";
import { VerificationTransaction, VerifyNegotiation, VerifyNegotiationResult } from "../services/identity/verification/types";
import { BroadcastReference } from "../services/references/types";

export type DomainEvent =
    EventRefResolvedToVerify |
    EventRefResolvedToAuthorize |
    EventVNegotiationCompleted |
    EventVNegotiationUpdated |
    EventANegotiationCompleted |
    EventANegotiationUpdated |
    EventIDVerifyCompleted |
    EventIDIssuingCompleted;

// @ts-ignore
export const factory = <T extends { type: string }>(type: T["type"]) => (event: Omit<T, "type">): T => ({ ...event, type })
export const isA = <T extends DomainEvent>(type: T["type"]) => (event: DomainEvent): event is T => event.type === type;

export interface EventRefResolvedToVerify {
    type: "RefResolvedToVerify",
    reference: BroadcastReference,
    negotiationId: string,
}

export const RefResolvedToVerify =
    factory<EventRefResolvedToVerify>("RefResolvedToVerify");


export interface EventRefResolvedToAuthorize {
    type: "RefResolvedToAuthorize",
    reference: BroadcastReference,
    negotiationId: string,
}

export const RefResolvedToAuthorize =
    factory<EventRefResolvedToAuthorize>("RefResolvedToAuthorize");


export interface EventVNegotiationCompleted {
    type: "VNegotiationCompleted",
    transaction: VerificationTransaction,
}

export const VNegotiationCompleted =
    factory<EventVNegotiationCompleted>("VNegotiationCompleted");


export interface EventVNegotiationUpdated {
    type: "VNegotiationUpdated",
    negotiation: VerifyNegotiation,
}

export const VNegotiationUpdated =
    factory<EventVNegotiationUpdated>("VNegotiationUpdated");


export interface EventIDVerifyCompleted {
    type: "IDVerifyCompleted",
    negotiationId: string,
    result: VerifyNegotiationResult,
}

export const IDVerifyCompleted =
    factory<EventIDVerifyCompleted>("IDVerifyCompleted");

export const IsIDVerifyCompleted =
    isA<EventIDVerifyCompleted>("IDVerifyCompleted");


export interface EventIDIssuingCompleted {
    type: "IDIssuingCompleted",
    negotiationId: string,
    result: AuthorizeNegotiationResult,
}

export const IDIssuingCompleted =
    factory<EventIDIssuingCompleted>("IDIssuingCompleted");

export const IsIDIssuingCompleted =
    isA<EventIDIssuingCompleted>("IDIssuingCompleted");


export interface EventANegotiationUpdated {
    type: "ANegotiationUpdated",
    negotiation: AuthorizeNegotiation,
}

export const ANegotiationUpdated =
    factory<EventANegotiationUpdated>("ANegotiationUpdated");


export interface EventANegotiationCompleted {
    type: "ANegotiationCompleted",
    transaction: AuthorizationTransaction,
}

export const ANegotiationCompleted =
    factory<EventANegotiationCompleted>("ANegotiationCompleted");

