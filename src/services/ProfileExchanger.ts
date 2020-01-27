import debug from "debug";
import { Profile } from "../types/State";
import { failIfFalsy } from "../util/failIfFalsy";
import { Hook } from "../util/Hook";
import { Envelope, IHandleMessages, ISendMessages, MsgProfile } from "./identity/messaging/types";

const log = debug('oa:profile-exchanger');

/** 
 * Ensure that we get the profiles of the peers that we interact with, and that
 * these profiles are actually Verified (signed by trusted parties).
 * 
 * When it succesfully verified a new profile, fires its hook.
 */
export class ProfileExchanger implements IHandleMessages<MsgProfile> {

    public verifiedProfileHook: Hook<{ peerId: string, profile: Profile }> = new Hook('profile-ex:verified');

    private profileSharedWith: string[] = [];

    constructor(
        private sender: ISendMessages<MsgProfile | any>,
        private getMyProfile: () => Profile) { }

    public receive(envelope: Envelope<MsgProfile | any>): boolean {
        const { message, senderId } = envelope;

        if (message.type === "Profile") {
            log('received profile from', senderId);
            // TODO Verify
            this.verifiedProfileHook.fire({ peerId: senderId, profile: message.profile })

            return true;
        }

        return false;
    }

    public sendProfileToPeer(peerId: string, ignoreCache?: boolean) {
        const profile = this.requireProfile();

        if (this.sharedWith(peerId) && !ignoreCache) return;

        // Cache the sharing of our profile
        this.profileSharedWith.push(peerId);

        this.sender.send<MsgProfile>(peerId, {
            type: "Profile",
            profile,
        });
    }

    protected sharedWith(peerId: string) {
        return this.profileSharedWith.indexOf(peerId) >= 0;
    }

    protected requireProfile() {
        return failIfFalsy(this.getMyProfile(), "Could not get my profile.");
    }
}
