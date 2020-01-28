import debug from "debug";
import uuid from "uuid/v4";
import { Hook } from "../../../util/Hook";
import { AuthorizeNegotiationResult } from "../authorization/types";
import { VerifyNegotiationResult } from "../verification/types";
import { Agent, InIssueHandler, InVerifyHandler, IPv8IssueReq, IPv8VerifReq, Me } from "./Agent";

const log = debug("oa:sock-agent");

export class SockAgent implements Agent {

    private inMsgHandler: (senderId: string, message: string) => void = () => { throw new Error("Not implemented") };
    private inVerifHandler: InVerifyHandler = () => { throw new Error("Not implemented") };
    private inIssueHandler: InIssueHandler = () => { throw new Error("Not implemented") };
    private me?: Me;
    private meHook: Hook<Me> = new Hook('sock-agent:me');
    private verifAnsHook: Hook<{ id: string, result: VerifyNegotiationResult }> = new Hook('sock-agent:verif-ans');
    private issueAnsHook: Hook<{ id: string, result: AuthorizeNegotiationResult }> = new Hook('sock-agent:issue-ans');

    constructor(private socket: SocketIOClient.Socket) {
        this.subscribeToSocket();
    }

    connect(): Promise<Me> {
        if (this.me) {
            return Promise.resolve(this.me);
        } else {
            return new Promise(resolve => this.meHook.on(resolve));
        }
    }

    sendMessage(peerId: string, message: string): Promise<void> {
        this.send(peerId, { text: message, type: "message" });
        return Promise.resolve();
    }

    setIncomingMessageHandler(handler: (senderId: string, message: string) => void): void {
        this.inMsgHandler = handler;
    }

    requestIssue(peerId: string, request: IPv8IssueReq): Promise<AuthorizeNegotiationResult> {
        const id = uuid();
        this.send(peerId, { request, type: "ipv8 issue request", id });
        return new Promise((resolve) => this.issueAnsHook.on(ans => ans.id === id && resolve(ans.result)));
    }

    verifyPeer(peerId: string, request: IPv8VerifReq): Promise<VerifyNegotiationResult> {
        const id = uuid();
        this.send(peerId, { request, type: "ipv8 verify request", id });
        return new Promise((resolve) => this.verifAnsHook.on(ans => ans.id === id && resolve(ans.result)));
    }

    setVerificationRequestHandler(handler: InVerifyHandler): void {
        this.inVerifHandler = handler;
    }

    setIssuingRequestHandler(handler: InIssueHandler): void {
        this.inIssueHandler = handler;
    }

    protected subscribeToSocket() {
        this.socket.on("id", (id: string) => {
            log("connected with ID", id)
            this.me = { id };
            this.meHook.fire(this.me);
        });
        this.socket.on("err", (e: any) => { throw new Error("Socket Reported:" + e) });
        this.socket.on("msg", (msg: InMsg) => {
            log("received message", msg);

            const { senderId, message } = msg;
            switch (message.type) {
                case "message":
                    return this.inMsgHandler(senderId, message.text);
                case "ipv8 verify request":
                    return this.inVerifHandler(message.request).then((answer) => {
                        this.send(senderId, { answer, type: "ipv8 verify answer", id: message.id });
                    });
                case "ipv8 verify answer":
                    return this.verifAnsHook.fire({ id: message.id, result: message.answer ? VerifyNegotiationResult.Succeeded : VerifyNegotiationResult.Cancelled })
                case "ipv8 issue request":
                    return this.inIssueHandler(message.request).then((answer) => {
                        this.send(senderId, { answer, type: "ipv8 issue answer", id: message.id });
                    });
                case "ipv8 issue answer":
                    return this.issueAnsHook.fire({ id: message.id, result: message.answer ? AuthorizeNegotiationResult.Succeeded : AuthorizeNegotiationResult.Cancelled })
            }
        })
    }

    protected send(peerId: string, message: any) {
        log("sending message to peer", peerId, ":", message);
        this.socket.emit("msg", { peerId, message });
    }

}

interface InMsg {
    senderId: string;
    message: any;
}
