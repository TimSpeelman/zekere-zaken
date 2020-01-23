import { InAuthorizationRequest, InVerificationRequest, IState, OutAuthorizationRequest, OutVerificationRequest, Profile } from "../types/State";
import { Hook } from "../util/Hook";

export class StateManager {
    public hook: Hook<IState> = new Hook();

    constructor() {
        const _profile = localStorage.getItem("profile");
        if (_profile) {
            const profile: Profile = JSON.parse(_profile);
            if (profile) {
                this.setState({ profile });
            }
        }
    }

    get state() {
        return this._state;
    }

    private _state: IState =
        {
            incomingAuthReqs: [],
            incomingVerifReqs: [],
            outgoingAuthReqs: [],
            outgoingVerifReqs: [],
        }

    setState(state: Partial<IState>) {
        this._state = { ...this._state, ...state, };
        this.hook.fire(this._state);
        console.log("NEW STATE", this._state);
    }

    storeProfile(profile: Profile) {
        localStorage.setItem("profile", JSON.stringify(profile));
        this.setState({ profile });
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
    addOutVerifReq(req: OutVerificationRequest) {
        this.setState({ outgoingVerifReqs: [...this.state.outgoingVerifReqs, req] })
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
    removeOutVerifReq(id: string) {
        this.setState({ outgoingVerifReqs: this.state.outgoingVerifReqs.filter(req => req.id !== id) })
    }
}