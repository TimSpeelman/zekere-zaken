import { InAuthorizationRequest } from "../types/State";
import { eur } from "../util/eur";
import { useProfile } from "./useProfile";

export function useWhatsappURL() {
    const { myId } = useProfile();

    function getURL(req: Omit<InAuthorizationRequest, "subjectId">) {
        let textMsg = "";
        if (req) {
            const inAuthReq: InAuthorizationRequest = { ...req, subjectId: myId! };
            const uriReq = encodeURIComponent(JSON.stringify(inAuthReq))
            textMsg = `Wil je mij machtigen voor '${req?.authority.type}' tot '${eur(req!.authority.amount)}'? https://zekerezaken.nl/#/in/${uriReq}`;
        }
        return `https://wa.me/?text=${encodeURIComponent(textMsg)}`
    }

    return { getURL };
}
