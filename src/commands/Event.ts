import { VerificationTransaction, VerifyNegotiation } from "../services/identity/verification/types";
import { BroadcastReference } from "../services/references/types";

export type DomainEvent =
    EventRefResolvedToVerify |
    EventRefResolvedToAuthorize |
    EventNegotiationCompleted |
    EventNegotiationUpdated;

// @ts-ignore
export const factory = <T extends { type: string }>(type: T["type"]) => (req: Omit<T, "type">): T => ({ ...req, type })

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
