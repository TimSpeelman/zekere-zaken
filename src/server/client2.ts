import * as readline from 'readline';
import socketIOClient from "socket.io-client";
import { Result } from "../services/IdentityGatewayInterface";
import { SockAgent } from "../services/SockAgent";

const url = 'http://localhost:9090';
const conn = socketIOClient.connect(url);

const agent = new SockAgent(conn);

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

agent.setIncomingMessageHandler((peerId, message) => {
    console.log(peerId, ":", message);
})

// Accept everything
agent.setVerificationRequestHandler((req) => {
    console.log("Asked to verify, I accept: ", req)
    return Promise.resolve(true)
});

agent.connect().then((me) => {
    console.log("I am ", me)

    function ask() {
        rl.question('Which peer to verify?', (peerId) => {
            agent.verifyPeer(peerId, { credentials: [], meta: "Yo", verifierId: me.id })
                .then((result) => {
                    console.log("Result from verification:", Result[result]);
                })
            ask();
        });
    }
    ask();

})

