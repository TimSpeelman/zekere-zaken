import socketIOClient from "socket.io-client";

const url = window.location;
const socketUrl = `${url.protocol}//${url.host.replace(/:[0-9]+/, "")}`;

export const SocketConnection = socketIOClient.connect(socketUrl);
