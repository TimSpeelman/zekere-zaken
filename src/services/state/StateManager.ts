import { AuthorizationTemplate, IState, OutAuthorizationRequest, Profile, SucceededIDAuthorize, SucceededIDVerify, VerificationTemplate } from "../../types/State";
import { Cache } from "../../util/Cache";
import { Hook } from "../../util/Hook";
import { AuthorizeNegotiation } from "../identity/authorization/types";
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

    private _state: IState = {
        myId: "",
        authorizeNegotiations: [],
        outgoingAuthTemplates: [],
        outgoingVerifTemplates: [],
        profiles: {},
        succeededIDAuthorize: [],
        succeededIDVerify: [],
        verifyNegotiations: [],
    }

    setState(state: Partial<IState>) {
        this._state = { ...this._state, ...state, };
        this.hook.fire(this._state);
    }

    setMyId(myId: string) {
        this.setState({ myId });
    }

    setMyProfile(profile: Profile) {
        this.cache.set("profile", profile);
        this.setState({ profile });
    }

    addProfile(peerId: string, profile: Profile) {
        this.setState({ profiles: { [peerId]: profile } });
    }

    addVerified(verified: SucceededIDVerify) {
        this.setState({ succeededIDVerify: [...this.state.succeededIDVerify, verified] })
    }

    addAuthorization(authorization: SucceededIDAuthorize) {
        this.setState({ succeededIDAuthorize: [...this.state.succeededIDAuthorize, authorization] })
    }

    updateVerifyNeg(neg: VerifyNegotiation) {
        this.setState({ verifyNegotiations: [...this.state.verifyNegotiations.filter(n => n.sessionId !== neg.sessionId), neg] })
    }

    updateAuthNeg(neg: AuthorizeNegotiation) {
        this.setState({ authorizeNegotiations: [...this.state.authorizeNegotiations.filter(n => n.id !== neg.id), neg] })
    }

    addOutAuthReq(req: OutAuthorizationRequest) {
        this.setState({ outgoingAuthTemplates: [...this.state.outgoingAuthTemplates, req] })
    }

    addOutVerifTemplate(template: VerificationTemplate) {
        this.setState({ outgoingVerifTemplates: [...this.state.outgoingVerifTemplates, template] })
    }

    addOutAuthTemplate(template: AuthorizationTemplate) {
        this.setState({ outgoingAuthTemplates: [...this.state.outgoingAuthTemplates, template] })
    }

    removeOutAuthReq(id: string) {
        this.setState({ outgoingAuthTemplates: this.state.outgoingAuthTemplates.filter(req => req.id !== id) })
    }

    removeOutVerifTemplate(id: string) {
        this.setState({ outgoingVerifTemplates: this.state.outgoingVerifTemplates.filter(template => template.id !== id) })
    }

    removeOutAuthTemplate(id: string) {
        this.setState({ outgoingAuthTemplates: this.state.outgoingAuthTemplates.filter(template => template.id !== id) })
    }
}