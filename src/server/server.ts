import socket from "socket.io";
import uuid from "uuid/v4";
import { Dict } from "../types/Dict";

const port = 80;
const server = socket(port);

const peers: Dict<socket.Socket> = {};

server.on("connection", function (peer) {
    const token = peer.handshake.query.token;
    const id = tokenIsValid(token) ? token : uuid();

    peers[id] = peer;

    console.log(`Connected new peer with ID:`, id);

    peer.emit("id", id);

    peer.on("msg", function (m: any) {
        console.log(`Received message from`, id, ':', m);

        const peerId = m.peerId;
        if (peerId in peers) {
            console.log("- Forwarding to peer", peerId);
            peers[peerId].emit("msg", { senderId: id, message: m.message });
        } else {
            console.log("- Failed, peer", peerId, "not found..");
            peer.emit("err", `Peer ${peerId} not found!`);
        }
    })
})

function tokenIsValid(token: any) {
    return !!token &&
        (typeof token) === "string" &&
        token.length > 0;
}

console.log("Waiting for connections on port", port);
