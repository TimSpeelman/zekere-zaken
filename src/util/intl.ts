import { InAuthorizationRequest, InVerificationRequest, OutAuthorizationRequest, OutVerificationRequest } from "../types/State";
import { eur } from "./eur";

type Request =
    InAuthorizationRequest |
    OutAuthorizationRequest |
    InVerificationRequest |
    OutVerificationRequest;

export const reqText = (req: Request) => `${req.authority.type} tot ${eur(req.authority.amount)}` + (req.legalEntity ? ` namens ${req.legalEntity.name}` : "");
