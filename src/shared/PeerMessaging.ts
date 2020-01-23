import { Authority, LegalEntity, Profile, VerificationRequest } from "../types/State";


export interface Envelope {
    messageId: string;
    message: Msg;
    senderId: string;
    respondsToMessageId?: string;
}

export type Msg =
    MsgResolveReference |
    MsgSendVerificationRequestDetails |
    MsgSendAuthRequestDetails |
    MsgReplyToVerifReq |
    MsgReplyToAuthReq |
    MsgProfile;

export interface MsgResolveReference {
    type: "ResolveReference";
    ref: string;
}

export interface MsgSendVerificationRequestDetails {
    type: "SendVerificationRequestDetails";
    reference?: string;
    requestId: string;
    request: VerificationRequest;
}

export interface MsgSendAuthRequestDetails {
    type: "SendAuthRequestDetails";
    authority: Authority;
    legalEntity?: LegalEntity;
}

export interface MsgReplyToVerifReq {
    type: "ReplyToVerifReq";
    requestId: string;
    accept: boolean;
}

export interface MsgReplyToAuthReq {
    type: "ReplyToAuthReq";
    accept: boolean;
}

export interface MsgProfile {
    type: "Profile";
    profile: Profile;
}
