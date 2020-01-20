import add from "date-fns/add";
import { Actor, Authority, InAuthorizationRequest, InVerificationRequest, IState, KVKAuthorityType, LegalEntity, OutAuthorizationRequest, OutVerificationRequest } from "./types/State";

// Jan is eigenaar van Janssen B.V.
// Zijn zoon Piet wil voor 5.000 een bureau laten maken bij MeubelsEnZo
// Hij wordt geverifieerd door Kees
const JanssenBV: LegalEntity = { name: "Janssen B.V.", kvknr: "12341234", address: "Korteweg 1, Delft" }
export const Jan: Actor = { name: "Jan Janssen" };
export const Piet: Actor = { name: "Piet Janssen" };

// Kees werkt bij MeubelsEnZo en verifieert of inkopers
// bevoegd zijn namens hun onderneming.
const MeubelsEnZo: LegalEntity = { name: "MeubelsEnZo", kvknr: "89089012", address: "Dertig 21, Den Haag" }
const Kees: Actor = { name: "Kees Schoon" };

const Inkoop10k: Authority = { amount: 10000, type: KVKAuthorityType.Inkoop };
const Inkoop5k: Authority = { amount: 5000, type: KVKAuthorityType.Inkoop };

// Kees (MeubelsEnZo) vraagt Piet om verificatie
const OutVerifJanssenInkoop5k: OutVerificationRequest = {
    id: "1",
    datetime: add(new Date(), { minutes: -3 }),
    legalEntity: JanssenBV,
    authority: Inkoop5k,
};
const InVerifJanssenInkoop5k: InVerificationRequest =
    { ...OutVerifJanssenInkoop5k, from: Kees }

// Piet (Janssen BV) vraagt Jan (Janssen BV) om machtiging
const OutAuthJanssenInkoop10k: OutAuthorizationRequest = {
    id: "2",
    datetime: add(new Date(), { minutes: -3 }),
    legalEntity: JanssenBV,
    authority: Inkoop10k,
};
const InAuthJanssenInkoop10k: InAuthorizationRequest =
    { ...OutAuthJanssenInkoop10k, from: Piet }

// De Broodfabriek wordt gerund door Sarah.
// Joep werkt voor Sarah en wil voor een nieuw filiaal
// financiering regelen bij de bank.
const DeBroodfabriek: LegalEntity = { name: "De Broodfabriek", kvknr: "33123123", address: "Industrielaan 32, Amsterdam" }
export const Sarah: Actor = { name: "Sarah Visser" };
export const Joep: Actor = { name: "Joep Schoon" };

const OBARBank: LegalEntity = { name: "OBAR Bank", kvknr: "3321321", address: "Tolweg 3, Utrecht" };
const David: Actor = { name: "David Putten" };

const Financiering100k: Authority = { amount: 100000, type: KVKAuthorityType.Financiering };
const Financiering70k: Authority = { amount: 70000, type: KVKAuthorityType.Financiering };

// David stuurt Joep een verificatie:
const OutVerifDeBroodfabriekInkoop70k: OutVerificationRequest = {
    id: "3",
    datetime: add(new Date(), { minutes: -3 }),
    legalEntity: DeBroodfabriek,
    authority: Financiering70k,
};
const InVerifDeBroodfabriekFinanciering70k: InVerificationRequest =
    { ...OutVerifDeBroodfabriekInkoop70k, from: David }

// Joep vraagt Sarah om een machtiging
const OutAuthDeBroodfabriekFinanciering100k: OutAuthorizationRequest = {
    id: "4",
    datetime: add(new Date(), { minutes: -3 }),
    legalEntity: DeBroodfabriek,
    authority: Financiering100k,
};
const InAuthDeBroodfabriekFinanciering100k: InAuthorizationRequest =
    { ...OutAuthDeBroodfabriekFinanciering100k, from: Joep }


export const dummyState: IState = {

    incomingAuthReqs: [
        InAuthDeBroodfabriekFinanciering100k,
        InAuthJanssenInkoop10k,
    ],
    incomingVerifReqs: [
        InVerifDeBroodfabriekFinanciering70k,
        InVerifJanssenInkoop5k,
    ],

    outgoingAuthReqs: [
        OutAuthDeBroodfabriekFinanciering100k,
        OutAuthJanssenInkoop10k,
    ],
    outgoingVerifReqs: [
        OutVerifDeBroodfabriekInkoop70k,
        OutVerifJanssenInkoop5k,
    ],

}

export const businesses = [
    JanssenBV,
    MeubelsEnZo,
    DeBroodfabriek,
    OBARBank,
]