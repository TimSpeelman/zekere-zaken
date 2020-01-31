import { UserCommand } from "../../commands/Command";
import { Hook } from "../../util/Hook";
import { Messenger } from "../messaging/Messenger";
import { Msg } from "../messaging/types";
import { ReferenceClient } from "../references/ReferenceClient";

export class ReferenceMiddleware {

    constructor(
        private messenger: Messenger<Msg>,
        private commandHook: Hook<UserCommand>,
    ) { }

    setup() {
        // Resolves references created by other peers
        const referenceClient = new ReferenceClient<Msg>(this.messenger);
        this.messenger.addRecipient(referenceClient);

        // On ResolveReference command, resolve a reference
        this.commandHook.on((a) => a.type === "ResolveReference" &&
            referenceClient.requestToResolveBroadcast(a.reference));
    }

}
