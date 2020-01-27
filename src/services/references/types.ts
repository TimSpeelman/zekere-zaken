
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

export interface ResolveOptions {
    timeout?: number;
}
