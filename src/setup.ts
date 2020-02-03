import { useEffect, useState } from "react";
import { dummyState } from "./dummy";
import { SockAgent } from "./services/identity/id-layer/SockAgent";
import { MyAgent } from "./services/MyAgent";
import { SocketConnection } from "./services/socket";
import { StateManager } from "./services/state/StateManager";
import { LocalStorageKeyValueStore } from "./util/Cache";

export interface Deps {
    myId: string;
    kicked: boolean;
}

const localS = new LocalStorageKeyValueStore();
export const stateManager = new StateManager(localS, localS);

export const socketAgent = new SockAgent(SocketConnection);
export const gateway = new MyAgent(socketAgent, stateManager);

export function useDependenciesAfterSetup(): Deps | undefined {

    const [myId, setMyId] = useState("");
    const [kicked, setKicked] = useState(false);

    useEffect(() => {
        SocketConnection.on("kick", () => setKicked(true));
        gateway.connect().then((me) => {
            setMyId(me.id);

            // For demo purposes, we use a dummy state to prefill the app.
            if (!stateManager.usedCache) {
                console.log("Using dummy state");
                stateManager.setState(dummyState(me.id))
            }
        });
    }, []);

    return !!myId ? {
        myId, kicked
    } : undefined;
}
