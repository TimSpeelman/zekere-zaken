import { InAuthorizationRequest, InVerificationRequest, IState, OutAuthorizationRequest, Profile, VerificationTemplate, Verified } from "../../types/State";
import { Cache } from "../../util/Cache";
import { Hook } from "../../util/Hook";
import { VerifyNegotiation } from "../identity/verification/types";

export class StateManager {
    public hook: Hook<IState> = new Hook('state-manager');

    constructor(private cache: Cache<Profile>) {
        const profile = cache.get("profile");
        if (profile) {
            this.setState({ profile });
        }
    }

    get state() {
        return this._state;
    }

    private _state: IState =
        {
            verified: [],
            negotiations: [],
            incomingAuthReqs: [],
            incomingVerifReqs: [],
            outgoingAuthReqs: [],
            outgoingVerifTemplates: [],
            profiles: {},
            authorizations: [],
        }

    setState(state: Partial<IState>) {
        this._state = { ...this._state, ...state, };
        this.hook.fire(this._state);
    }

    setMyProfile(profile: Profile) {
        this.cache.set("profile", profile);
        this.setState({ profile });
    }

    addProfile(peerId: string, profile: Profile) {
        this.setState({ profiles: { [peerId]: profile } });
    }

    addVerified(verified: Verified) {
        this.setState({ verified: [...this.state.verified, verified] })
    }

    updateNeg(neg: VerifyNegotiation) {
        this.setState({ negotiations: [...this.state.negotiations.filter(n => n.sessionId !== neg.sessionId), neg] })
    }

    addInAuthReq(req: InAuthorizationRequest) {
        this.setState({ incomingAuthReqs: [...this.state.incomingAuthReqs, req] })
    }
    addOutAuthReq(req: OutAuthorizationRequest) {
        this.setState({ outgoingAuthReqs: [...this.state.outgoingAuthReqs, req] })
    }
    addInVerifReq(req: InVerificationRequest) {
        this.setState({ incomingVerifReqs: [...this.state.incomingVerifReqs, req] })
    }
    addOutVerifTemplate(template: VerificationTemplate) {
        this.setState({ outgoingVerifTemplates: [...this.state.outgoingVerifTemplates, template] })
    }

    removeInAuthReq(id: string) {
        this.setState({ incomingAuthReqs: this.state.incomingAuthReqs.filter(req => req.id !== id) })
    }
    removeOutAuthReq(id: string) {
        this.setState({ outgoingAuthReqs: this.state.outgoingAuthReqs.filter(req => req.id !== id) })
    }
    removeInVerifReq(id: string) {
        this.setState({ incomingVerifReqs: this.state.incomingVerifReqs.filter(req => req.id !== id) })
    }
    removeOutVerifTemplate(id: string) {
        this.setState({ outgoingVerifTemplates: this.state.outgoingVerifTemplates.filter(template => template.id !== id) })
    }
}