import { AuthorizationTemplate } from "../../types/State";
import { eur } from "../../util/eur";
import { useLocalState } from "./useLocalState";

const url = window.location;
const baseUrl = `${url.protocol}//${url.host}`;

export function useWhatsappURL() {
    const { state } = useLocalState();
    const myId = state.myId;

    function getURL(template?: AuthorizationTemplate) {
        if (!template) return "";
        return `${baseUrl}/#/in/${myId}/${template.id}`;
    }

    function getWhatsappURL(template?: AuthorizationTemplate) {
        if (!template) {
            return "";
        } else {
            const textMsg = `Wil je mij machtigen voor '${template?.authority.type}'`
                + ` tot ${eur(template!.authority.amount)}?`
                + ` Ga naar ${getURL(template)}`;
            return `https://wa.me/?text=${encodeURIComponent(textMsg)}`
        }
    }

    return { getURL, getWhatsappURL };
}
