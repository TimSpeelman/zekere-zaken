import { UserCommand } from "../../commands/Command";
import { DomainEvent, ProfileRequested, ProfileVerificationFailed, ProfileVerified } from "../../commands/Event";
import { Hook } from "../../util/Hook";
import { ProfileExchanger } from "../identity/profiles/ProfileExchanger";
import { Messenger } from "../messaging/Messenger";
import { Msg } from "../messaging/types";
import { StateManager } from "../state/StateManager";

export class ProfileExchangeMiddleware {

    constructor(
        private eventHook: Hook<DomainEvent>,
        private commandHook: Hook<UserCommand>,
        private stateMgr: StateManager,
        private messenger: Messenger<Msg>,
    ) { }

    setup() {
        // Take care of exchanging profiles between peers.
        const profileEx = new ProfileExchanger(this.messenger, () => this.stateMgr.state.profile!);
        this.messenger.addRecipient(profileEx);

        this.commandHook.on((command) => {
            if (command.type === "VerifyProfile") {
                if (!(command.peerId in this.stateMgr.state.profiles)) {
                    profileEx.requestProfileFromPeer(command.peerId);
                }
            }
        })

        // Save profiles after they have been verified
        profileEx.verifiedProfileHook.on(({ peerId, result }) => {
            switch (result.status) {
                case "Verifying": return this.eventHook.fire(ProfileRequested({ peerId }));
                case "Verified": return this.eventHook.fire(ProfileVerified({ peerId, profile: result.profile }));
                case "Failed": return this.eventHook.fire(ProfileVerificationFailed({ peerId }));
            }
        });

    }

}
