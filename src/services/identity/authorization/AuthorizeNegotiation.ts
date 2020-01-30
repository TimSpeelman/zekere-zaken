import { last } from "../../../util/last";
import { BroadcastReference } from "../../references/types";
import { AuthorizationSpec, AuthorizeNegotiation, NegotiationAction as Action, NegotiationStep, NegStatus, specIsComplete } from "./types";

enum Turn { Start, Authorizer, Subject, End }

/**
 * Selector that contains the rules of AuthorizeNegotiations.
 * 
 * It takes actions and provides a new instance of this selector with
 * the updated state.
 */
export class ANeg {

    constructor(readonly state: AuthorizeNegotiation) { }

    static start(subjectId: string, authorizerId: string, id: string, fromReference?: BroadcastReference, fromTemplateId?: string) {
        return new ANeg({
            id,
            fromTemplateId,
            fromReference,
            subjectId,
            authorizerId,
            steps: [],
            status: NegStatus.Pending,
            authorizerAccepts: false,
            subjectAccepts: false,
        })
    }

    get isEmpty() {
        return this.state.steps.length === 0;
    }

    get isPending() {
        return this.state.status === NegStatus.Pending;
    }

    get authorizerConsents() {
        return this.turn === Turn.Subject || this.state.authorizerAccepts;
    }

    get subjectConsents() {
        return this.turn === Turn.Authorizer || this.state.subjectAccepts;
    }

    get lastSpec() {
        return last(this.state.steps.filter(s => s.step.type === Action.Offer || s.step.type === Action.Request));
    }

    get turn() {
        const lastStep = last(this.state.steps);
        return !lastStep ? Turn.Start
            : (lastStep.peerId === this.state.authorizerId) ? Turn.Subject : Turn.Authorizer;
    }

    withOffer(fromPeerId: string, spec: Partial<AuthorizationSpec>): ANeg {
        this.assertPeerCanAct(fromPeerId, Action.Offer);

        return this
            .withAction(fromPeerId, { type: Action.Offer, spec })
            .withState({
                conceptSpec: spec,
                authorizerAccepts: true,
                subjectAccepts: false,
            });
    }

    withRequest(fromPeerId: string, spec: Partial<AuthorizationSpec>): ANeg {
        this.assertPeerCanAct(fromPeerId, Action.Request);

        return this
            .withAction(fromPeerId, { type: Action.Request, spec })
            .withState({
                conceptSpec: spec,
                authorizerAccepts: false,
                subjectAccepts: specIsComplete(spec),
            });
    }

    withAccept(fromPeerId: string): ANeg {
        this.assertPeerCanAct(fromPeerId, Action.Accept);
        const s = this
            .withAction(fromPeerId, { type: Action.Accept })
            .withState({ status: NegStatus.Successful }) // If one can accept, the neg is successful.

        return fromPeerId === this.state.authorizerId
            ? s.withState({ authorizerAccepts: true })
            : s.withState({ subjectAccepts: true })
    }

    withReject(fromPeerId: string): ANeg {
        this.assertPeerCanAct(fromPeerId, Action.Reject);

        return this
            .withAction(fromPeerId, { type: Action.Reject })
            .withState({ status: NegStatus.Terminated });
    }

    protected withState(s: Partial<AuthorizeNegotiation>) {
        return new ANeg({ ... this.state, ...s });
    }

    protected withAction(peerId: string, step: NegotiationStep) {
        return this.withState({ steps: [...this.state.steps, { peerId, step }], })
    }

    protected assertPeerCanAct(peerId: string, action: Action) {
        if (!this.peerCanAct(peerId, action)) {
            throw new Error(`Protocol Error. Peer ${peerId} cannot ${Action[action]}`);
        }
    }

    protected peerCanAct(peerId: string, action: Action) {
        return (peerId === this.state.authorizerId) ? this.authorizerCanAct(action) : this.subjectCanAct(action);
    }

    protected authorizerCanAct(action: Action) {
        if (!this.isPending) return false;
        switch (action) {
            case Action.Request: return false;
            case Action.Offer: return this.isEmpty || this.turn === Turn.Authorizer;
            case Action.Accept: return !this.isEmpty && this.turn === Turn.Authorizer;
            case Action.Reject: return !this.isEmpty && this.turn === Turn.Authorizer;
        }
    }

    protected subjectCanAct(action: Action) {
        if (!this.isPending) return false;
        switch (action) {
            case Action.Request: return this.isEmpty || this.turn === Turn.Subject;
            case Action.Offer: return false;
            case Action.Accept: return !this.isEmpty && this.turn === Turn.Subject;
            case Action.Reject: return !this.isEmpty && this.turn === Turn.Subject;
        }
    }
}
