import { Me } from "../shared/Agent";
import { Msg } from "../shared/PeerMessaging";
import { Profile, VerificationRequest } from "../types/State";
import { Hook } from "../util/Hook";

export interface IdentityGatewayInterface {

    me?: Me;

    connect(): Promise<Me>;

    setProfile(profile: Profile): void;

    /** When a peer sends a message to us, this hook fires */
    incomingMessageHook: Hook<InMsg>;

    verifiedProfileHook: Hook<{ peerId: string, profile: Profile }>;

    makeReferenceToVerificationRequest(req: VerificationRequest): BroadcastReference

    requestToResolveBroadcast(ref: BroadcastReference, options?: ResolveOptions): Promise<VerificationRequest>;

    answerVerificationRequest(peerId: string, requestId: string, req: VerificationRequest, accept: boolean): void;
}

export interface ResolveOptions {
    timeout?: number;
}

export interface InMsg {
    senderId: string;
    message: Msg;
}

export interface VerificationSpec {
    credentialName: string;
}

export interface AuthorizationSpec {
    credentialName: string;
}

export enum Result {
    Cancelled = "Cancelled",
    Failed = "Failed",
    Succeeded = "Succeeded",
}

export interface BroadcastReference {
    senderId: string;
    reference: string;
}

export function isBroadcastReference(obj: any): obj is BroadcastReference {
    return !!obj
        && (typeof obj === "object")
        && (typeof obj.senderId === "string")
        && (typeof obj.reference === "string");
}
