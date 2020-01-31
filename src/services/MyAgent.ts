import { UserCommand } from "../commands/Command";
import { DomainEvent } from "../commands/Event";
import { Hook } from "../util/Hook";
import { Agent, Me } from "./identity/id-layer/Agent";
import { Messenger } from "./messaging/Messenger";
import { Msg } from "./messaging/types";
import { AuthorizeNegotiationMiddleware } from "./middleware/AuthorizeNegotiation.mw";
import { IDAuthorizeMiddleware } from "./middleware/IDAuthorize.mw";
import { IDVerifyMiddleware } from "./middleware/IDVerify.mw";
import { ProfileExchangeMiddleware } from "./middleware/ProfileExchange.mw";
import { ReferenceMiddleware } from "./middleware/Reference.mw";
import { StateMiddleware } from "./middleware/State.mw";
import { UserInterfaceMiddleware } from "./middleware/UserInterface.mw";
import { VerifyNegotiationMiddleware } from "./middleware/VerifyNegotiation.mw";
import { StateManager } from "./state/StateManager";

/** MyAgent wraps all services together */
export class MyAgent {

    public eventHook: Hook<DomainEvent> = new Hook('events');
    public commandHook: Hook<UserCommand> = new Hook('commands');

    private messenger: Messenger<Msg>;

    me?: Me;

    constructor(private agent: Agent, private stateMgr: StateManager) {

        // Handle sending of messages between Peers.
        const messenger = new Messenger<Msg>(agent);
        this.messenger = messenger;

        new ProfileExchangeMiddleware(this.commandHook, this.stateMgr, messenger).setup();

        new ReferenceMiddleware(messenger, this.commandHook).setup();

        new IDVerifyMiddleware(this.eventHook, this.commandHook, stateMgr, agent).setup();

        new IDAuthorizeMiddleware(this.eventHook, this.commandHook, stateMgr, agent).setup();

        new VerifyNegotiationMiddleware(this.eventHook, this.commandHook, stateMgr, messenger, agent).setup();

        new AuthorizeNegotiationMiddleware(this.eventHook, this.commandHook, stateMgr, messenger, agent).setup();

        new StateMiddleware(stateMgr, this.commandHook, this.eventHook).setup();

        new UserInterfaceMiddleware(this.commandHook, this.eventHook).setup();

        this.connect().then(me => {
            this.me = me;
            stateMgr.setMyId(me.id);
        });
    }

    dispatch(command: UserCommand) {

        this.commandHook.fire(command);

    }

    connect(): Promise<Me> {
        this.messenger.connect();
        return this.agent.connect();
    }

}
