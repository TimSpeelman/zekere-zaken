import { AuthorizationMessage } from "../../shared/Authorization";
import { Profile } from "../../types/State";
import { VerificationMessage } from "../identity/verification/types";

export interface Envelope<M> {
    messageId: string;
    message: M;
    senderId: string;
    respondsToMessageId?: string;
    reference?: string;
}

export type Msg =
    VerificationMessage |
    AuthorizationMessage |

    MsgResolveReference |
    MsgProfile;

export interface MsgResolveReference {
    type: "ResolveReference";
    ref: string;
}

export interface MsgProfile {
    type: "Profile";
    profile: Profile;
}

export interface IHandleMessages<MessageType> {
    /** Returns true if this message is meant for this handler. */
    receive(envelope: Envelope<MessageType>): boolean;
}

export interface ISendMessages<MessageType> {
    /** Sends messages over some channel to a peer. */
    send<M extends MessageType>(peerId: string, message: M, reference?: string): Promise<void>;
}
