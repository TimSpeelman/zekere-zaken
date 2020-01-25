import { Agent, Me } from "../../shared/Agent";
import { Dict } from "../../types/Dict";
import { Profile, VerificationRequest } from "../../types/State";
import { Hook } from "../../util/Hook";
import { ProfileExchanger } from "../ProfileExchanger";
import { ReferenceResolver } from "../ReferenceResolver";
import { StateManager } from "../StateManager";
import { BroadcastReference, IdentityGatewayInterface } from "./IdentityGatewayInterface";
import { Messenger } from "./messaging/Messenger";
import { Envelope, Msg } from "./messaging/types";
import { Verifiee } from "./verification/Verifiee";
import { Verifier } from "./verification/Verifier";
import { VerifyManager } from "./verification/VerifyManager";

/** MyAgent wraps all services together */
export class MyAgent implements IdentityGatewayInterface {

    readonly messenger: Messenger<Msg>;
    readonly profileEx: ProfileExchanger;
    readonly referenceResolver: ReferenceResolver<Msg>;
    readonly verifier: Verifier;
    readonly verifiee: Verifiee;
    readonly verifyManager: VerifyManager;

    me?: Me;
    verifiedProfileHook: Hook<{ peerId: string; profile: Profile; }> = new Hook();

    waitingForRefs: Dict<(env: Envelope<Msg>) => void> = {};


    constructor(
        private agent: Agent,
        private stateMgr: StateManager) {

        this.messenger = new Messenger<Msg>(agent);

        this.profileEx = new ProfileExchanger(this.messenger);
        this.profileEx.verifiedProfileHook.on(({ peerId, profile }) => stateMgr.addProfile(peerId, profile));
        this.messenger.addRecipient(this.profileEx);

        // FIXME: currently sends our profile to anyone who sends us a message.
        this.messenger.addHandler((env) => { this.profileEx.sendProfileToPeer(env.senderId); return false });

        this.referenceResolver = new ReferenceResolver<Msg>(this.messenger);
        this.messenger.addRecipient(this.referenceResolver);

        this.verifier = new Verifier(agent);
        this.verifiee = new Verifiee();
        agent.setVerificationRequestHandler((r) => this.verifiee.handleVerificationRequest(r));

        this.verifyManager = new VerifyManager(this.messenger, this.verifier, this.verifiee);
        this.messenger.addRecipient(this.verifyManager);

        this.verifyManager.newDraftHook.on(
            (draft) => stateMgr.addInVerifReq({
                id: draft.draftId,
                verifierId: draft.verifierId,
                authority: draft.spec.authority!,
                legalEntity: draft.spec.legalEntity,
                datetime: new Date().toISOString(), // FIXME
            })
        );

        this.connect().then(me => {
            this.me = me;
            this.verifyManager.myId = me.id;
        });
    }

    public get requestToResolveBroadcast() {
        return this.referenceResolver.requestToResolveBroadcast.bind(this.referenceResolver);
    }

    connect(): Promise<Me> {
        this.messenger.connect();
        return this.agent.connect();
    }

    setProfile(profile: Profile): void {
        this.profileEx.setProfile(profile);
    }

    makeReferenceToVerificationRequest(req: VerificationRequest): BroadcastReference {
        const reference = this.referenceResolver.registerCallback((peerId) => {
            const session = this.verifyManager.startVerify(peerId, {
                authority: req.authority,
                legalEntity: req.legalEntity
            }, reference)
            // const session = new VerificationSession(this.messenger, this.verifier, this.verifiee);
            // this.sessionsV.addSession(session);
        })
        return { reference, senderId: this.me!.id };
    }

    answerVerificationRequest(peerId: string, requestId: string, req: VerificationRequest, accept: boolean): void {
        // FIXME
        const session = this.verifyManager.getSessionById(peerId, requestId.replace(`${peerId}:`, ""));
        session.offer({
            authority: req.authority,
            legalEntity: req.legalEntity,
        })
    }

}
