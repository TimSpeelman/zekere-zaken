import { Authority, LegalEntity } from "../../../types/State";

/** A specification of what is to be Verified. This content should be dynamic! */
export interface VerificationSpec {
    legalEntity: LegalEntity;
    authority: Authority;
}

/**
 * A fully defined transaction which has all the details to
 * verify using the underlying layer.
 */
export interface VerificationTransaction {
    sessionId: string;
    verifierId: string;
    subjectId: string;
    spec: VerificationSpec;
}

export type VerificationMessage =
    MsgOfferVerification |
    MsgAcceptVerification |
    MsgRequestVerification |
    MsgRejectVerification;

/** Offer a VerificationSpec to another Peer, perhaps in response to an earlier offer. */
export interface MsgOfferVerification extends HasSessionId {
    type: "OfferVerification";
    sessionId: string;
    spec: Partial<VerificationSpec>;
}

/** Request a Verification by another Peer, perhaps in response to an earlier offer. */
export interface MsgRequestVerification extends HasSessionId {
    type: "RequestVerification";
    sessionId: string;
    spec: Partial<VerificationSpec>;
}

/** Accept a VerificationSession, thereby triggering the verification procedure (IPv8). */
export interface MsgAcceptVerification extends HasSessionId {
    type: "AcceptVerification";
    sessionId: string;
}

/** Reject a VerificationSession, terminating it on both ends. */
export interface MsgRejectVerification extends HasSessionId {
    type: "RejectVerification";
    sessionId: string;
}

/** Outcome of a VerifyNegotiation */
export enum VerifyNegotiationResult {
    Cancelled = "Cancelled",
    Failed = "Failed",
    Succeeded = "Succeeded",
}

interface HasSessionId {
    sessionId: string;
}

export interface IDVerifyResult {
    sessionId: string;
    result: VerifyNegotiationResult;
}


/**
 * Example:
 * - V->S Request (AuthInk5k)
 * - S->V Offer (AuthInk5k, JanssenBV)
 * - V->S IDVReq
 * - S->V IDVOk
 * 
 * - V->S Request (AuthInk5, JanssenBV)
 * - S->V Ok
 */
export interface VerifyNegotiation {
    fromTemplateId?: string;
    sessionId: string;
    status: NegStatus;
    subjectId: string;
    verifierId: string;
    steps: NegStep[];
    conceptSpec?: Partial<VerificationSpec>;
    verifierAccepts: boolean;
    subjectAccepts: boolean;
}

export type NegStep =
    MsgOfferVerification | MsgRequestVerification | MsgAcceptVerification | MsgRejectVerification;

export enum NegStatus {
    Pending,
    Successful,
    Terminated
}
