import { BroadcastReference } from "../services/identity/id-layer/IdentityGatewayInterface";
import { VerificationTransaction } from "../services/identity/verification/types";
import { LegalEntity, VerificationTemplate } from "../types/State";

export type UserCommand =
    CmdResolveReference |
    CmdCreateVReqTemplate |
    CmdRemoveVReqTemplate |
    CmdAcceptNegotiation |
    CmdRejectNegotiation |
    CmdAllowIDVerify |
    CmdInvokeIDVerify |
    CmdAcceptNegWithLegalEntity

// @ts-ignore
export const factory = <T extends { type: string }>(type: T["type"]) => (req: Omit<T, "type">): T => ({ ...req, type })

export interface CmdResolveReference {
    type: "ResolveReference",
    reference: BroadcastReference,
}

export const ResolveReference =
    factory<CmdResolveReference>("ResolveReference");


export interface CmdCreateVReqTemplate {
    type: "CreateVReqTemplate",
    template: VerificationTemplate,
}

export const CreateVReqTemplate =
    factory<CmdCreateVReqTemplate>("CreateVReqTemplate");


export interface CmdRemoveVReqTemplate {
    type: "RemoveVReqTemplate",
    templateId: string,
}

export const RemoveVReqTemplate =
    factory<CmdRemoveVReqTemplate>("RemoveVReqTemplate");


export interface CmdAcceptNegotiation {
    type: "AcceptNegotiation",
    negotiationId: string,
}

export const AcceptNegotiation =
    factory<CmdAcceptNegotiation>("AcceptNegotiation");


export interface CmdRejectNegotiation {
    type: "RejectNegotiation",
    negotiationId: string,
}

export const RejectNegotiation =
    factory<CmdRejectNegotiation>("RejectNegotiation");


export interface CmdAcceptNegWithLegalEntity {
    type: "AcceptNegWithLegalEntity",
    negotiationId: string,
    legalEntity: LegalEntity,
}

export const AcceptNegWithLegalEntity =
    factory<CmdAcceptNegWithLegalEntity>("AcceptNegWithLegalEntity");


export interface CmdAllowIDVerify {
    type: "AllowIDVerify",
    negotiationId: string,
    transaction: VerificationTransaction,
}

export const AllowIDVerify =
    factory<CmdAllowIDVerify>("AllowIDVerify");


export interface CmdInvokeIDVerify {
    type: "InvokeIDVerify",
    negotiationId: string,
    transaction: VerificationTransaction,
}

export const InvokeIDVerify =
    factory<CmdInvokeIDVerify>("InvokeIDVerify");

