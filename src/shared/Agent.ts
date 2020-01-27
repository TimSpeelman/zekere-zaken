import { VerificationResult } from "../services/identity/verification/types";

export interface Me {
    id: string;
}

export interface IPv8VerifReq {
    verifierId: string;
    meta: string;
    credentials: { name: string, value: string }[];
}

export type InVerifyHandler = (req: IPv8VerifReq) => Promise<boolean>;

export interface Agent {
    /** We connect to our agent, which returns our info */
    connect(): Promise<Me>;

    /** Sends a message over IPv8 or rejects if an error occurred */
    sendMessage(peerId: string, message: string): Promise<void>;

    /** Handle an incoming message */
    setIncomingMessageHandler(handler: (senderId: string, message: string) => void): void;

    /**  Verify a peer */
    verifyPeer(peerId: string, req: IPv8VerifReq): Promise<VerificationResult>;

    /** Handle a verification request */
    setVerificationRequestHandler(handler: InVerifyHandler): void;
}

export interface IVerify {
    /**  Verify a peer */
    verifyPeer(peerId: string, req: IPv8VerifReq): Promise<VerificationResult>;
}

export interface IBeVerified {
    handleVerificationRequest(req: any): Promise<boolean>;
}
