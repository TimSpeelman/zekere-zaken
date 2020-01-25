import debug from "debug";
import { Profile } from "../types/State";
import { Hook } from "../util/Hook";
import { Envelope, IReceiveMessages, ISendMessages, MsgProfile } from "./identity/messaging/types";

const log = debug('oa:profile-exchanger');

/** 
 * Ensure that we get the profiles of the peers that we interact with, and that
 * these profiles are actually Verified (signed by trusted parties).
 * 
 * Also, take care of sharing our Profile
 */
export class ProfileExchanger implements IReceiveMessages<MsgProfile> {

    public verifiedProfileHook: Hook<{ peerId: string, profile: Profile }> = new Hook();

    private profile?: Profile;
    private profileSharedWith: string[] = [];

    constructor(
        private sender: ISendMessages<MsgProfile | any>) {

        // this.listenToIncomingMessages();
    }

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

    public setProfile(profile: Profile) {
        this.profile = profile;
    }

    public sendProfileToPeer(peerId: string, ignoreCache?: boolean) {
        this.assertProfileSet();

        if (!ignoreCache && this.profileSharedWith.indexOf(peerId) >= 0) {
            return;
        }
        const message: MsgProfile = {
            type: "Profile",
            profile: this.profile!,
        }

        // Cache the sharing of our profile
        this.profileSharedWith.push(peerId);

        this.sender.send(peerId, message);
    }



    // protected listenToIncomingMessages() {
    //     this.messenger.addHandler((m) => this.handleIncomingMessage(m));
    // }

    // protected handleIncomingMessage(envelope: Envelope<MsgProfile>) {
    //     const { message, senderId } = envelope;

    //     if (message.type === "Profile") {
    //         // TODO Verify
    //         this.verifiedProfileHook.fire({ peerId: senderId, profile: message.profile })
    //         return true;
    //     }

    //     return false;
    // }

    protected assertProfileSet() {
        if (!this.profile) {
            throw new Error("Profile not yet set!");
        }
    }
}
