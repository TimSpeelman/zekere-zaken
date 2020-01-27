import { UserCommand } from "../../../commands/Command";
import { Me } from "../../../shared/Agent";
import { Profile } from "../../../types/State";
import { Hook } from "../../../util/Hook";

export interface IdentityGatewayInterface {

    me?: Me;

    connect(): Promise<Me>;

    verifiedProfileHook: Hook<{ peerId: string, profile: Profile }>;

    dispatch(command: UserCommand): void;
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
