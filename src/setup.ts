import { useEffect, useState } from "react";
import { dummyState } from "./dummy";
import { SockAgent } from "./services/identity/id-layer/SockAgent";
import { MyAgent } from "./services/MyAgent";
import { SocketConnection } from "./services/socket";
import { StateManager } from "./services/state/StateManager";

export interface Deps {
    myId: string;
}

export const stateManager = new StateManager();
export const socketAgent = new SockAgent(SocketConnection);
export const gateway = new MyAgent(socketAgent, stateManager);

export function useDependenciesAfterSetup(): Deps | undefined {

    const [myId, setMyId] = useState("");

    useEffect(() => {
        gateway.connect().then((me) => {
            setMyId(me.id);

            // For demo purposes, we use a dummy state to prefill the app.
            stateManager.setState(dummyState(me.id))
        });
    }, []);

    return !!myId ? {
        myId
    } : undefined;
}
