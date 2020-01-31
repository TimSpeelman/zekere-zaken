import { Authority, LegalEntity } from "../../../types/State";
import { BroadcastReference } from "../../references/types";

/** A specification of what is to be Authorized. This content should be dynamic! */
export interface AuthorizationSpec {
    legalEntity: LegalEntity;
    authority: Authority;
}

export function specIsComplete(spec?: Partial<AuthorizationSpec>): spec is AuthorizationSpec {
    return !!spec && !!spec.authority && !!spec.legalEntity;
}

/**
 * A fully defined transaction which has all the details to
 * Authorize using the underlying layer.
 */
export interface AuthorizationTransaction {
    sessionId: string;
    authorizerId: string;
    subjectId: string;
    spec: AuthorizationSpec;
}

export type AuthorizationMessage =
    MsgOfferAuthorization |
    MsgAcceptAuthorization |
    MsgRequestAuthorization |
    MsgRejectAuthorization;

/** Offer a AuthorizationSpec to another Peer, perhaps in response to an earlier offer. */
export interface MsgOfferAuthorization extends HasSessionId {
    type: "OfferAuthorization";
    sessionId: string;
    spec: Partial<AuthorizationSpec>;
}

/** Request a Authorization by another Peer, perhaps in response to an earlier offer. */
export interface MsgRequestAuthorization extends HasSessionId {
    type: "RequestAuthorization";
    sessionId: string;
    spec: Partial<AuthorizationSpec>;
}

/** Accept a AuthorizationSession, thereby triggering the Authorization procedure (IPv8). */
export interface MsgAcceptAuthorization extends HasSessionId {
    type: "AcceptAuthorization";
    sessionId: string;
}

/** Reject a AuthorizationSession, terminating it on both ends. */
export interface MsgRejectAuthorization extends HasSessionId {
    type: "RejectAuthorization";
    sessionId: string;
}

/** Outcome of a AuthorizeNegotiation */
export enum AuthorizeNegotiationResult {
    Cancelled = "Cancelled",
    Failed = "Failed",
    Succeeded = "Succeeded",
}

interface HasSessionId {
    sessionId: string;
}

export interface IDAuthorizeResult {
    sessionId: string;
    result: AuthorizeNegotiationResult;
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
export interface AuthorizeNegotiation {
    fromReference?: BroadcastReference;
    fromTemplateId?: string;
    id: string;
    status: NegStatus;
    subjectId: string;
    authorizerId: string;
    steps: Step[];
    conceptSpec?: Partial<AuthorizationSpec>;
    authorizerAccepts: boolean;
    subjectAccepts: boolean;
    resultedInAuthId?: string;
}

export interface Step {
    peerId: string;
    step: NegotiationStep;
}

export enum NegotiationAction {
    Offer,
    Request,
    Accept,
    Reject
}

export type NegotiationStep = Offer | Request | Accept | Reject
export interface Offer { type: NegotiationAction.Offer, spec: Partial<AuthorizationSpec> }
export interface Request { type: NegotiationAction.Request, spec: Partial<AuthorizationSpec> }
export interface Accept { type: NegotiationAction.Accept, }
export interface Reject { type: NegotiationAction.Reject, }

export type NegStep =
    MsgOfferAuthorization | MsgRequestAuthorization | MsgAcceptAuthorization | MsgRejectAuthorization;

export enum NegStatus {
    Pending,
    Successful,
    Terminated
}
