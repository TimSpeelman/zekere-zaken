import { IPv8VerifReq } from "../../../shared/Agent";
import { Authority, LegalEntity } from "../../../types/State";

/** A specification of what is to be Verified. This content should be dynamic! */
export interface VerificationSpec {
    legalEntity: LegalEntity;
    authority: Authority;
}

/**
 * The Verifier may create a template which can be sent to multiple
 * subjects. From this template a VerificationSession is created.
 */
export interface VerificationTemplate {
    verifierId: string;
    spec: Partial<VerificationSpec>;
}

/**
 * A fully defined transaction which has all the details to
 * verify using the underlying layer.
 */
export interface VerificationTransaction {
    // iVerify: boolean; // FIXME can we do without?
    sessionId: string;
    verifierId: string;
    subjectId: string;
    spec: VerificationSpec;
}

/** Offer a VerificationSpec to another Peer, perhaps in response to an earlier offer. */
export interface MsgOfferVerification extends HasSessionId {
    type: "OfferVerification";
    spec: Partial<VerificationSpec>;
    /** This should be locally name spaced using the PeerID, to prevent conflicts. */
    sessionId: string;
}

/** Request a Verification by another Peer, perhaps in response to an earlier offer. */
export interface MsgRequestVerification extends HasSessionId {
    type: "RequestVerification";
    spec: Partial<VerificationSpec>;
    /** This should be locally name spaced using the PeerID, to prevent conflicts. */
    sessionId: string;
}

/** Accept a VerificationSession, thereby triggering the verification procedure (IPv8). */
export interface MsgAcceptVerification extends HasSessionId {
    type: "AcceptVerification";
    /** This should be locally name spaced using the PeerID, to prevent conflicts. */
    sessionId: string;
}

/** Reject a VerificationSession, terminating it on both ends. */
export interface MsgRejectVerification extends HasSessionId {
    type: "RejectVerification";
    /** This should be locally name spaced using the PeerID, to prevent conflicts. */
    sessionId: string;
}

export enum VerificationResult {
    Cancelled = "Cancelled",
    Failed = "Failed",
    Succeeded = "Succeeded",
}

export type VerificationMessage =
    MsgOfferVerification |
    MsgAcceptVerification |
    MsgRequestVerification |
    MsgRejectVerification;

interface HasSessionId {
    sessionId: string;
}

export interface IVerifier {
    verify(transaction: VerificationTransaction): Promise<VerificationResult>;
}

export interface IVerifiee {
    handleVerificationRequest(request: IPv8VerifReq): Promise<boolean>;
}

export interface VerifyResult {
    sessionId: string;
    result: VerificationResult;
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
