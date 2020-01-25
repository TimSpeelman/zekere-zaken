import { AuthorizationMessage } from "../../shared/Authorization";
import { Envelope } from "../identity/messaging/types";
import { ISession } from "./ISession";

export class AuthorizationSession implements ISession<AuthorizationMessage | any> {
    id = "";
    peerId = "";

    public receive({ message, senderId }: Envelope<AuthorizationMessage | any>) {
        switch (message.type) {
            case "OfferAuthorization": return;
            case "AcceptAuthorization": return;
            case "RejectAuthorization": return;
        }
    }

    static fromOffer({ message, senderId }: Envelope<AuthorizationMessage | any>) {
        return new AuthorizationSession();
    }
}

