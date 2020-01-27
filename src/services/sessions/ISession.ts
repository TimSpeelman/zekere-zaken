import { Envelope } from "../identity/messaging/types";

export interface ISession<M> {
    peerId: string;
    id: string;
    receive: (msg: Envelope<M>) => void;
}