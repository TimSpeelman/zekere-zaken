import * as readline from 'readline';
import socketIOClient from "socket.io-client";

const url = 'http://localhost:9090';
const server = socketIOClient.connect(url);

console.log("Connecting");

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

server.on("id", (id: any) => {
    console.log("my id is", id);

    server.on("err", (err: any) => console.error("Got err", err));
    server.on("msg", (msg: any) => console.log("Peer", msg.peerId, "said", msg));

    function ask() {
        rl.question('Send message to peer?', (answer) => {
            const [peerId, message] = answer.split(" ", 2);
            server.emit("msg", { peerId, msg: message })
            ask();
        });
    }
    ask();
});
