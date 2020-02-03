import socket from "socket.io";
import uuid from "uuid/v4";
import { Dict } from "../types/Dict";
import fs from "fs";

const port = 8080;
const httpsServer = require('https').createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/zekerezaken.nl/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/zekerezaken.nl/cert.pem')
});

const server = socket(httpsServer);
server.listen(port);


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
