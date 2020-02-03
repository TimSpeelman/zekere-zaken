import debug from "debug";
import { Authorization, AuthorizationTemplate, IState, OutAuthorizationRequest, Profile, SucceededIDAuthorize, SucceededIDVerify, VerificationTemplate } from "../../types/State";
import { Cache } from "../../util/Cache";
import { Hook } from "../../util/Hook";
import { AuthorizeNegotiation } from "../identity/authorization/types";
import { VerifyNegotiation } from "../identity/verification/types";

/** Use this to clear cache when the schema changes */
const SCHEMA_VERSION = 1;
type CachedState = IState & { SCHEMA_VERSION: number };

const log = debug("oa:state-manager");

export class StateManager {

    public hook: Hook<IState> = new Hook('state-manager');
    public usedCache = false;

    constructor(private myProfileCache: Cache<Profile>, private stateCache: Cache<CachedState>) {
        this.readProfileFromCache();
        this.readStateFromCache();
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
        this.stateCache.set("state", { SCHEMA_VERSION, ...this._state });
    }

    setMyId(myId: string) {
        this.setState({ myId });
    }

    setMyProfile(profile: Profile) {
        this.myProfileCache.set("profile", profile);
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

    protected readProfileFromCache() {
        const profile = this.myProfileCache.get("profile");
        if (profile) {
            log("using profile from cache");
            this.setState({ profile });
        }
    }

    protected readStateFromCache() {
        const state = this.stateCache.get("state");
        if (state && state.SCHEMA_VERSION === SCHEMA_VERSION) {
            log("using cached state", state);
            this.usedCache = true;
            this.setState(state);
        } else {
            log("using fresh state");
            this.stateCache.remove("state");
        }
    }

}
