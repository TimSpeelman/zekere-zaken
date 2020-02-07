import add from "date-fns/add";
import { Actor, Authority, Authorization, IState, KVKAuthorityType, LegalEntity } from "./types/State";

export const Jan: Actor = { name: "Jan Janssen", photo: "" };
export const Piet: Actor = { name: "Piet Janssen", photo: "" };

const Inkoop10k: Authority = { amount: 10000, type: KVKAuthorityType.Inkoop };

const JanssenBV: LegalEntity = { name: "Janssen B.V.", kvknr: "12341234", address: "Korteweg 1, Delft" }
const MeubelsEnZo: LegalEntity = { name: "MeubelsEnZo", kvknr: "89089012", address: "Dertig 21, Den Haag" }
const DeBroodfabriek: LegalEntity = { name: "De Broodfabriek", kvknr: "33123123", address: "Industrielaan 32, Amsterdam" }
const OBARBank: LegalEntity = { name: "OBAR Bank", kvknr: "3321321", address: "Tolweg 3, Utrecht" };

export const dummyState = (myId: string): IState => {

    const AuthJanssenInkoop10k: Authorization = {
        id: "5",
        issuedAt: add(new Date(), { minutes: -3 }).toISOString(),
        legalEntity: JanssenBV,
        authority: Inkoop10k,
        issuerId: "jan",
        subjectId: myId,
        sessionId: "x",
    };

    const AuthJanssenInkoop5k: Authorization = {
        id: "5",
        issuedAt: add(new Date(), { minutes: -3 }).toISOString(),
        legalEntity: JanssenBV,
        authority: Inkoop10k,
        subjectId: "piet",
        issuerId: myId,
        sessionId: "x",
    };

    return {
        myId,
        succeededIDVerify: [],
        authorizeNegotiations: [],
        myAuthorizations: [
            AuthJanssenInkoop10k
        ],
        givenAuthorizations: [
            AuthJanssenInkoop5k
        ],
        verifyNegotiations: [],
        outgoingAuthTemplates: [],
        outgoingVerifTemplates: [],
        profiles: {
            jan: { status: "Verified", profile: Jan },
            piet: { status: "Verified", profile: Piet },
        },
        succeededIDAuthorize: [],
        myLegalEntities: [],
    };
}

export const businesses = [
    JanssenBV,
    MeubelsEnZo,
    DeBroodfabriek,
    OBARBank,
];
