import { AuthorizationTransaction } from "../services/identity/authorization/types";
import { VerificationTransaction } from "../services/identity/verification/types";
import { BroadcastReference } from "../services/references/types";
import { AuthorizationTemplate, LegalEntity, Profile, VerificationTemplate } from "../types/State";

export type UserCommand =
    CmdClearCache |
    CmdToggleConsole |
    CmdNavigateTo |
    CmdResolveReference |
    CmdAddProfile |
    CmdCreateVReqTemplate |
    CmdRemoveVReqTemplate |
    CmdCreateAReqTemplate |
    CmdRemoveAReqTemplate |
    CmdAcceptVNegotiation |
    CmdRejectVNegotiation |
    CmdRejectANegotiation |
    CmdInvokeIDVerify |
    CmdInvokeIDAuthorize |
    CmdAcceptVNegWithLegalEntity |
    CmdAcceptANegWithLegalEntity;

// @ts-ignore
export const factory = <T extends { type: string }>(type: T["type"]) => (req: Omit<T, "type">): T => ({ ...req, type })

export interface CmdClearCache {
    type: "ClearCache",
}

export const ClearCache =
    factory<CmdClearCache>("ClearCache");

export interface CmdToggleConsole {
    type: "ToggleConsole",
}

export const ToggleConsole =
    factory<CmdToggleConsole>("ToggleConsole");

export interface CmdNavigateTo {
    type: "NavigateTo",
    path: string,
}

export const NavigateTo =
    factory<CmdNavigateTo>("NavigateTo");


export interface CmdResolveReference {
    type: "ResolveReference",
    reference: BroadcastReference,
}

export const ResolveReference =
    factory<CmdResolveReference>("ResolveReference");


export interface CmdAddProfile {
    type: "AddProfile",
    peerId: string,
    profile: Profile,
}

export const AddProfile =
    factory<CmdAddProfile>("AddProfile");


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


export interface CmdCreateAReqTemplate {
    type: "CreateAReqTemplate",
    template: AuthorizationTemplate,
}

export const CreateAReqTemplate =
    factory<CmdCreateAReqTemplate>("CreateAReqTemplate");


export interface CmdRemoveAReqTemplate {
    type: "RemoveAReqTemplate",
    templateId: string,
}

export const RemoveAReqTemplate =
    factory<CmdRemoveAReqTemplate>("RemoveAReqTemplate");


export interface CmdAcceptVNegotiation {
    type: "AcceptVNegotiation",
    negotiationId: string,
}

export const AcceptVNegotiation =
    factory<CmdAcceptVNegotiation>("AcceptVNegotiation");


export interface CmdRejectVNegotiation {
    type: "RejectVNegotiation",
    negotiationId: string,
}

export const RejectVNegotiation =
    factory<CmdRejectVNegotiation>("RejectVNegotiation");


export interface CmdAcceptVNegWithLegalEntity {
    type: "AcceptVNegWithLegalEntity",
    negotiationId: string,
    legalEntity: LegalEntity,
}

export const AcceptVNegWithLegalEntity =
    factory<CmdAcceptVNegWithLegalEntity>("AcceptVNegWithLegalEntity");


export interface CmdAcceptANegWithLegalEntity {
    type: "AcceptANegWithLegalEntity",
    negotiationId: string,
    legalEntity: LegalEntity,
}

export const AcceptANegWithLegalEntity =
    factory<CmdAcceptANegWithLegalEntity>("AcceptANegWithLegalEntity");


export interface CmdRejectANegotiation {
    type: "RejectANegotiation",
    negotiationId: string,
}

export const RejectANegotiation =
    factory<CmdRejectANegotiation>("RejectANegotiation");

export interface CmdInvokeIDVerify {
    type: "InvokeIDVerify",
    negotiationId: string,
    transaction: VerificationTransaction,
}

export const InvokeIDVerify =
    factory<CmdInvokeIDVerify>("InvokeIDVerify");

export interface CmdInvokeIDAuthorize {
    type: "InvokeIDAuthorize",
    negotiationId: string,
    transaction: AuthorizationTransaction,
}

export const InvokeIDAuthorize =
    factory<CmdInvokeIDAuthorize>("InvokeIDAuthorize");

