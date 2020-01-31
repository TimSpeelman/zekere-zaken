import { AddProfile, UserCommand } from "../../commands/Command";
import { Hook } from "../../util/Hook";
import { ProfileExchanger } from "../identity/profiles/ProfileExchanger";
import { Messenger } from "../messaging/Messenger";
import { Msg } from "../messaging/types";
import { StateManager } from "../state/StateManager";

export class ProfileExchangeMiddleware {

    constructor(
        private commandHook: Hook<UserCommand>,
        private stateMgr: StateManager,
        private messenger: Messenger<Msg>,
    ) { }

    setup() {
        // Take care of exchanging profiles between peers.
        const profileEx = new ProfileExchanger(this.messenger, () => this.stateMgr.state.profile!);
        this.messenger.addRecipient(profileEx);

        // FIXME: For now we send our profile to every peer who sends us a message
        this.messenger.addHandler((env) => { profileEx.sendProfileToPeer(env.senderId); return false });

        // Save profiles after they have been verified
        profileEx.verifiedProfileHook.on(({ peerId, profile }) =>
            this.commandHook.fire(AddProfile({ peerId, profile })));
    }

}
