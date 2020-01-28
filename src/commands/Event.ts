import { VerificationTransaction, VerifyNegotiation, VerifyNegotiationResult } from "../services/identity/verification/types";
import { BroadcastReference } from "../services/references/types";

export type DomainEvent =
    EventRefResolvedToVerify |
    EventRefResolvedToAuthorize |
    EventNegotiationCompleted |
    EventNegotiationUpdated |
    EventIDVerifyCompleted;

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


export interface EventNegotiationCompleted {
    type: "NegotiationCompleted",
    transaction: VerificationTransaction,
}

export const NegotiationCompleted =
    factory<EventNegotiationCompleted>("NegotiationCompleted");


export interface EventNegotiationUpdated {
    type: "NegotiationUpdated",
    negotiation: VerifyNegotiation,
}

export const NegotiationUpdated =
    factory<EventNegotiationUpdated>("NegotiationUpdated");


export interface EventIDVerifyCompleted {
    type: "IDVerifyCompleted",
    negotiationId: string,
    result: VerifyNegotiationResult,
}

export const IDVerifyCompleted =
    factory<EventIDVerifyCompleted>("IDVerifyCompleted");
export const IsIDVerifyCompleted =
    isA<EventIDVerifyCompleted>("IDVerifyCompleted");
