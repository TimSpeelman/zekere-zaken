import fs from "fs";
import socket from "socket.io";
import uuid from "uuid/v4";
import { Dict } from "../types/Dict";
import { requireFromEnv } from "../util/requireFromEnv";

const PORT = requireFromEnv("ZZ_SERVER_PORT");
const USE_HTTPS = requireFromEnv("ZZ_SERVER_USE_HTTPS") === "1";
const PATH_TO_KEY = USE_HTTPS ? requireFromEnv("ZZ_PATH_TO_KEY") : "";
const PATH_TO_CERT = USE_HTTPS ? requireFromEnv("ZZ_PATH_TO_CERT") : "";

let server: SocketIO.Server;

if (USE_HTTPS) {
    const httpsServer = require('https').createServer({
        key: fs.readFileSync(PATH_TO_KEY),
        cert: fs.readFileSync(PATH_TO_CERT)
    });
    server = socket(httpsServer);
    httpsServer.listen(PORT);
} else {
    server = socket(PORT);
}

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

console.log("Waiting for connections on port", PORT);
