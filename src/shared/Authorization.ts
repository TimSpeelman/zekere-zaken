import { Authority, LegalEntity } from "../types/State";

/** A specification of what is to be Authorized. */
export interface AuthorizationSpec {
    legalEntity: LegalEntity;
    authority: Authority;
}

/**
 * The Subject may create a template which can be sent to multiple
 * Issuers. From this template a AuthorizationSession is created.
 */
export interface AuthorizationTemplate {
    subjectId: string;
    spec: Partial<AuthorizationSpec>;
}

/**
 * During an AuthorizationSession, Issuer and Subject compose a
 * AuthorizationTransaction together.
 */
export interface AuthorizationSession {
    issuerId: string;
    subjectId: string;
    spec: Partial<AuthorizationSpec>;
}

/**
 * A fully defined transaction which has all the details to
 * authorize using the underlying layer.
 */
export interface AuthorizationTransaction {
    issuerId: string;
    subjectId: string;
    spec: AuthorizationSpec;
}

export enum AuthorizationResult {
    Cancelled = "Cancelled",
    Failed = "Failed",
    Succeeded = "Succeeded",
}

/** Offer an AuthorizationSpec to another Peer, perhaps in response to an earlier offer. */
export interface MsgOfferAuthorization {
    type: "OfferAuthorization";
    spec: Partial<AuthorizationSpec>;
    /** This should be locally name spaced using the PeerID, to prevent conflicts. */
    sessionId: string;
    /** Set if this offer is trigger by resolving a reference. */
    reference?: string;
}

/** Accept an AuthorizationSession, thereby triggering the Issuing procedure (IPv8). */
export interface MsgAcceptAuthorization {
    type: "AcceptAuthorization";
    /** This should be locally name spaced using the PeerID, to prevent conflicts. */
    sessionId: string;
}

/** Reject an AuthorizationSession, terminating it on both ends. */
export interface MsgRejectAuthorization {
    type: "RejectAuthorization";
    /** This should be locally name spaced using the PeerID, to prevent conflicts. */
    sessionId: string;
}

export type AuthorizationMessage =
    MsgOfferAuthorization |
    MsgAcceptAuthorization |
    MsgRejectAuthorization;
