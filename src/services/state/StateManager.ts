import { Authorization, AuthorizationTemplate, IState, OutAuthorizationRequest, Profile, SucceededIDAuthorize, SucceededIDVerify, VerificationTemplate } from "../../types/State";
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
        myAuthorizations: [],
        givenAuthorizations: [],
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
        this.setState({ profiles: { ...this.state.profiles, [peerId]: profile } });
    }

    addSucceededIDVerify(verified: SucceededIDVerify) {
        this.setState({ succeededIDVerify: [...this.state.succeededIDVerify, verified] })
    }

    addSucceededIDAuthorize(authorization: SucceededIDAuthorize) {
        this.setState({ succeededIDAuthorize: [...this.state.succeededIDAuthorize, authorization] })
    }

    addOutVerifTemplate(template: VerificationTemplate) {
        this.setState({ outgoingVerifTemplates: [...this.state.outgoingVerifTemplates, template] })
    }

    removeOutVerifTemplate(id: string) {
        this.setState({ outgoingVerifTemplates: this.state.outgoingVerifTemplates.filter(template => template.id !== id) })
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

    addOutAuthTemplate(template: AuthorizationTemplate) {
        this.setState({ outgoingAuthTemplates: [...this.state.outgoingAuthTemplates, template] })
    }

    removeOutAuthTemplate(id: string) {
        this.setState({ outgoingAuthTemplates: this.state.outgoingAuthTemplates.filter(template => template.id !== id) })
    }

    addMyAuthorization(authorization: Authorization) {
        this.setState({ myAuthorizations: [...this.state.myAuthorizations, authorization] })
    }

    removeMyAuthorization(id: string) {
        this.setState({ myAuthorizations: this.state.myAuthorizations.filter(item => item.id !== id) })
    }

    addGivenAuthorization(authorization: Authorization) {
        this.setState({ givenAuthorizations: [...this.state.givenAuthorizations, authorization] })
    }

    removeGivenAuthorization(id: string) {
        this.setState({ givenAuthorizations: this.state.givenAuthorizations.filter(item => item.id !== id) })
    }

}
