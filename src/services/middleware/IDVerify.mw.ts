import { UserCommand } from "../../commands/Command";
import { DomainEvent, IDVerifyCompleted } from "../../commands/Event";
import { selectVTransactionById } from "../../ui/selectors/selectTransactionById";
import { Hook } from "../../util/Hook";
import { Agent } from "../identity/id-layer/Agent";
import { IDVerifiee } from "../identity/id-layer/IDVerifiee";
import { IDVerifier } from "../identity/id-layer/IDVerifier";
import { StateManager } from "../state/StateManager";

export class IDVerifyMiddleware {

    constructor(
        private eventHook: Hook<DomainEvent>,
        private commandHook: Hook<UserCommand>,
        private stateMgr: StateManager,
        private agent: Agent,
    ) { }

    setup() {
        this.setupVerifier();
        this.setupVerifiee();
    }

    setupVerifier() {
        const verifier = new IDVerifier(this.agent);

        // Inputs
        this.commandHook.on((cmd) => cmd.type === "InvokeIDVerify" &&
            verifier.verify(cmd.transaction));

        // Outputs
        verifier.completedVerifyHook.on((result) => {
            this.eventHook.fire(IDVerifyCompleted({
                negotiationId: result.sessionId,
                result: result.result,
            }))
        })

    }

    setupVerifiee() {
        const verifiee = new IDVerifiee((id) => this.getTransactionById(id));

        // Inputs
        this.agent.setVerificationRequestHandler((r) => verifiee.handleVerificationRequest(r));

        // Outputs
        verifiee.completedVerifyHook.on((result) => {
            this.eventHook.fire(IDVerifyCompleted({
                negotiationId: result.sessionId,
                result: result.result,
            }))
        })
    }

    getTransactionById(transactionId: string) {
        return selectVTransactionById(transactionId)(this.stateMgr.state);
    }

}