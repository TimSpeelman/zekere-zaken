import socketIOClient from "socket.io-client";
import Cookies from "universal-cookie";

const url = window.location;
const socketUrl = `${url.protocol}//${url.host.replace(/:[0-9]+/, "")}`;

const cookies = new Cookies();
const token = cookies.get("socket-token");
const query = !!token ? { token } : {};

export const SocketConnection = socketIOClient.connect(socketUrl, { query });

SocketConnection.on("id", (id: string) => {
    cookies.set("socket-token", id);
})
