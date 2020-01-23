import socket from "socket.io";
import uuid from "uuid/v4";
import { Dict } from "../types/Dict";

const port = 9090;
const server = socket(port);

const peers: Dict<socket.Socket> = {};

server.on("connection", function (peer) {
    const id = uuid();
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

console.log("Waiting for connections on port", port);
