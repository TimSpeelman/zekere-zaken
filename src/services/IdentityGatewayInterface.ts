import { Msg } from "../shared/PeerMessaging";
import { Hook } from "../util/Hook";

export interface IdentityGatewayInterface {

    /** When a peer sends a message to us, this hook fires */
    incomingMessageHook: Hook<Message>;

    sendMessageToPeer(message: Msg): Promise<boolean>;

    allowToVerifyMe(peerId: string, verificationSpec: VerificationSpec, expireMillis: number): void;

    verifyAPeer(peerId: string, verificationSpec: VerificationSpec): Promise<Result>;

    allowToAuthorizeMe(peerId: string, authorizationSpec: AuthorizationSpec): void;

    authorizeAPeer(peerId: string, authorizationSpec: AuthorizationSpec): Promise<Result>;

}

export interface Message {
    peerId: string;
    message: string;
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
