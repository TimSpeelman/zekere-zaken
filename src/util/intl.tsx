import React from "react";
import { Authorization, InAuthorizationRequest, InVerificationRequest, LegalEntity, OutAuthorizationRequest, OutVerificationRequest } from "../types/State";
import { eur } from "./eur";

type Request =
    InAuthorizationRequest |
    OutAuthorizationRequest |
    InVerificationRequest |
    OutVerificationRequest;

export const reqText = (req: Request) => `${req.authority.type} tot ${eur(req.authority.amount)}` + (req.legalEntity ? ` namens ${req.legalEntity.name}` : "");
export const authText = (auth: Authorization) => `${auth.authority.type} tot ${eur(auth.authority.amount)}` + (auth.legalEntity ? ` namens ${auth.legalEntity.name}` : "");
export const entityText = (entity: LegalEntity) =>
    <span><strong>{entity.name}</strong> (KVK-nummer: <strong>{entity.kvknr}</strong>),
        gevestigd te <strong>{entity.address}</strong></span>

