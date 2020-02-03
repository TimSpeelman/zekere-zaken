import socketIOClient from "socket.io-client";
import { LocalStorageValueStore } from "../util/Cache";

const url = window.location;
const socketUrl = `${url.protocol}//${url.host.replace(/:[0-9]+/, "")}`;

export const SessionIDStore = new LocalStorageValueStore("socket-token");

const token = SessionIDStore.get();
const query = !!token ? { token } : {};

export const SocketConnection = socketIOClient.connect(socketUrl, { query });

SocketConnection.on("id", (id: string) => {
    SessionIDStore.set(id);
})
