import { NavigateTo, UserCommand } from "../../commands/Command";
import { DomainEvent } from "../../commands/Event";
import { Hook } from "../../util/Hook";

export class UserInterfaceMiddleware {

    constructor(
        private commandHook: Hook<UserCommand>,
        private eventHook: Hook<DomainEvent>,
    ) { }

    setup() {
        this.eventHook.on((e) => {
            switch (e.type) {
                case "RefResolvedToVerify":
                case "ReceivedVerifyRequest":
                    return this.commandHook.fire(NavigateTo({ path: `#/verifs/inbox/${e.negotiationId}` }));
                case "RefResolvedToAuthorize":
                    return this.commandHook.fire(NavigateTo({ path: `#/authreqs/inbox/${e.negotiationId}` }));
            }
        })

        this.commandHook.on((cmd) => {
            if (cmd.type === "NavigateTo") {
                if (typeof window !== 'undefined') {
                    window.location.assign(cmd.path);
                }
            }
        });
    }

}
