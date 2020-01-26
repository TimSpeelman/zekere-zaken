import { IPv8VerifReq } from "../../../shared/Agent";
import { Authority, LegalEntity } from "../../../types/State";

/** A specification of what is to be Verified. */
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
 * During a VerificationSession, Verified and Subject compose a
 * VerificationTransaction together.
 */
export interface VerifyDraft {
    draftId: string;
    verifierId: string;
    subjectId: string;
    spec: Partial<VerificationSpec>;
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

/** Offer a VerificationSpec to another Peer, perhaps in response to an earlier offer. */
export interface MsgOfferVerification extends HasSessionId {
    type: "OfferVerification";
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
    MsgRejectVerification;

interface HasSessionId {
    sessionId: string;
}

export interface IVerifier {
    verify(transaction: VerificationTransaction): Promise<VerificationResult>;
}

export interface IVerifiee {
    allowToVerify(transaction: VerificationTransaction): void;
    handleVerificationRequest(request: IPv8VerifReq): Promise<boolean>;
}

export interface VerifyResult {
    sessionId: string;
    result: VerificationResult;
}
