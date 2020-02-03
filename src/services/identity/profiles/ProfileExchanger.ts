import debug from "debug";
import { Profile, ProfileResult } from "../../../types/State";
import { failIfFalsy } from "../../../util/failIfFalsy";
import { Hook } from "../../../util/Hook";
import { Envelope, IHandleMessages, ISendMessages, MsgProfile, MsgRequestProfile } from "../../messaging/types";

const log = debug('oa:profile-exchanger');

/** 
 * Ensure that we get the profiles of the peers that we interact with, and that
 * these profiles are actually Verified (signed by trusted parties).
 * 
 * When it succesfully verified a new profile, fires its hook.
 */
export class ProfileExchanger implements IHandleMessages<MsgProfile> {

    public verifiedProfileHook: Hook<{ peerId: string, result: ProfileResult }> = new Hook('profile-ex:verified');

    private profileSharedWith: string[] = [];

    constructor(
        private sender: ISendMessages<MsgProfile | any>,
        private getMyProfile: () => Profile) { }

    public receive(envelope: Envelope<MsgProfile | MsgRequestProfile>): boolean {
        const { message, senderId } = envelope;

        switch (message.type) {
            case "Profile": {
                log('received profile from', senderId);
                // TODO Verify
                this.verifiedProfileHook.fire({ peerId: senderId, result: { status: "Verified", profile: message.profile } })

                return true;
            } case "RequestProfile": {
                this.sendProfileToPeer(senderId);
            }
        }

        return false;
    }

    public requestProfileFromPeer(peerId: string) {
        this.sender.send<MsgRequestProfile>(peerId, { type: "RequestProfile" });
        this.verifiedProfileHook.fire({ peerId, result: { status: "Verifying" } })
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
