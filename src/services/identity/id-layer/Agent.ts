import { AuthorizeNegotiationResult } from "../authorization/types";
import { VerifyNegotiationResult } from "../verification/types";

export interface Me {
    id: string;
}

export interface IPv8VerifReq {
    verifierId: string;
    meta: string;
    credentials: { name: string, value: string }[];
}

export interface IPv8IssueReq {
    issuerId: string;
    meta: string;
    credentials: { name: string, value: string }[];
}

export type InVerifyHandler = (req: IPv8VerifReq) => Promise<boolean>;

export type InIssueHandler = (req: IPv8IssueReq) => Promise<boolean>;

export interface Agent {
    /** We connect to our agent, which returns our info */
    connect(): Promise<Me>;

    /** Sends a message over IPv8 or rejects if an error occurred */
    sendMessage(peerId: string, message: string): Promise<void>;

    /** Handle an incoming message */
    setIncomingMessageHandler(handler: (senderId: string, message: string) => void): void;

    /**  Verify a peer */
    verifyPeer(peerId: string, req: IPv8VerifReq): Promise<VerifyNegotiationResult>;

    /**  Request an issuing */
    requestIssue(peerId: string, req: IPv8IssueReq): Promise<AuthorizeNegotiationResult>;

    /** Handle a verification request */
    setVerificationRequestHandler(handler: InVerifyHandler): void;

    /** Handle an issuing request */
    setIssuingRequestHandler(handler: InIssueHandler): void;
}

export interface IVerify {
    /**  Verify a peer */
    verifyPeer(peerId: string, req: IPv8VerifReq): Promise<VerifyNegotiationResult>;
}

export interface IIssue {
    /**  Verify a peer */
    requestIssue(peerId: string, req: IPv8IssueReq): Promise<AuthorizeNegotiationResult>;
}

export interface IBeVerified {
    handleVerificationRequest(req: any): Promise<boolean>;
}

export interface ICanIssue {
    handleIssueRequest(req: IPv8IssueReq): Promise<boolean>;
}
