import { Me } from "../../shared/Agent";
import { Profile, VerificationRequest } from "../../types/State";
import { Hook } from "../../util/Hook";
import { Envelope, Msg } from "./messaging/types";

export interface IdentityGatewayInterface {

    me?: Me;

    connect(): Promise<Me>;

    setProfile(profile: Profile): void;

    verifiedProfileHook: Hook<{ peerId: string, profile: Profile }>;

    makeReferenceToVerificationRequest(req: VerificationRequest): BroadcastReference

    requestToResolveBroadcast(ref: BroadcastReference, options?: ResolveOptions): Promise<Envelope<Msg>>;

    answerVerificationRequest(peerId: string, requestId: string, req: VerificationRequest, accept: boolean): void;
}

export interface ResolveOptions {
    timeout?: number;
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
