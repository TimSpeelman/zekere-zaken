import { UserCommand } from "../../commands/Command";
import { DomainEvent, IDIssuingCompleted } from "../../commands/Event";
import { selectATransactionById } from "../../ui/selectors/selectTransactionById";
import { Hook } from "../../util/Hook";
import { Agent } from "../identity/id-layer/Agent";
import { IDIssuee } from "../identity/id-layer/IDIssuee";
import { IDIssuer } from "../identity/id-layer/IDIssuer";
import { StateManager } from "../state/StateManager";

export class IDAuthorizeMiddleware {

    constructor(
        private eventHook: Hook<DomainEvent>,
        private commandHook: Hook<UserCommand>,
        private stateMgr: StateManager,
        private agent: Agent,
    ) { }

    setup() {
        this.setupAuthorizer();
        this.setupAuthorizee();
    }

    setupAuthorizer() {
        const authorizer = new IDIssuer((id) => this.getTransactionById(id));

        this.agent.setIssuingRequestHandler((r) => authorizer.handleIssueRequest(r));

        authorizer.completedIssueHook.on((result) => {
            this.eventHook.fire(IDIssuingCompleted({
                negotiationId: result.sessionId,
                result: result.result,
            }))
        })

    }

    setupAuthorizee() {
        const authorizee = new IDIssuee(this.agent);

        this.commandHook.on((cmd) => cmd.type === "InvokeIDAuthorize" &&
            authorizee.requestIssuing(cmd.transaction));

        authorizee.completedIssueHook.on((result) => {
            this.eventHook.fire(IDIssuingCompleted({
                negotiationId: result.sessionId,
                result: result.result,
            }))
        })
    }

    getTransactionById(transactionId: string) {
        return selectATransactionById(transactionId)(this.stateMgr.state);
    }

}
