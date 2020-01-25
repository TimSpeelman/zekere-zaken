export { };
// // import { Result } from "../../src/services/identity/IdentityGatewayInterface";
// import { Agent, InVerifyHandler, IPv8VerifReq } from "../../src/shared/Agent";
// import { Dict } from "../../src/types/Dict";
// import { KVKAuthorityType, OutVerificationRequest } from "../../src/types/State";
// import { Hook } from "../../src/util/Hook";
// import { describe, expect, it, makeDone, TestSequence } from "../setup";
// import { MyAgent } from "../../src/services/identity/MyAgent";
// import { VerificationResult } from "../../src/shared/Verification";

// describe("IDGateway", () => {

//     it("connects", (_done) => {
//         const done = makeDone(_done);

//         const agent = makeAgent("MYID");
//         const gateway = new MyAgent(agent);
//         gateway.connect().then(() => {
//             expect(gateway.me!.id).to.equal("MYID");
//             done();
//         }).catch(done);
//     })

//     // Verifier, before sending QR:
//     it("provides a BroadcastReference", (_done) => {
//         const done = makeDone(_done);

//         const agent = makeAgent("VERIF");
//         const gateway = new MyAgent(agent);
//         gateway.connect().then(() => {
//             const req = makeVerifReq();
//             const reference = gateway.makeReferenceToVerificationRequest(req);

//             expect(reference).to.haveOwnProperty("senderId", "VERIF");
//             expect(reference).to.haveOwnProperty("reference");

//             done();
//         }).catch(done);
//     })

//     // Verifier, upon receiving ResolveReference
//     it("two peers can transfer a VerificationRequest using references (e.g. over QR)", (_done) => {
//         const done = makeDone(_done);
//         const { gatewayA: subjectAgent, gatewayB: verifierAgent } = mockPair("SUBJ", "VERIF");


//         Promise.all([
//             subjectAgent.connect(),
//             verifierAgent.connect(),
//         ]).then(() => {

//             const seq = new TestSequence();

//             // The Verifier creates a request and gets a reference, which it sends to the Subject.
//             const verificationRequest = makeVerifReq();
//             const reference = verifierAgent.makeReferenceToVerificationRequest(verificationRequest);

//             seq.then(() => subjectAgent.requestToResolveBroadcast(reference));

//             // When the Subject asks to resolve the reference, the Verifier answers with the 
//             // intended VerificationRequest. This triggers an event on the Subject side.
//             subjectAgent.sessionsV.newSessionHook.on((session) => {
//                 const { peerId, request } = inVer;

//                 expect(request.authority).to.deep.equal(verificationRequest.authority)
//                 expect(request.legalEntity).to.deep.equal(verificationRequest.legalEntity)
//                 expect(request.datetime).to.deep.equal(verificationRequest.datetime)
//                 done();
//             })

//             seq.go();

//         }).catch(done);

//     })

//     // Verifier, upon receiving ResolveReference
//     it("two peers can execute a Verification", (_done) => {
//         const done = makeDone(_done, 2);

//         const { gatewayA: subject, gatewayB: verifier } = mockPair("SUBJ", "VERIF");

//         Promise.all([
//             subject.connect(),
//             verifier.connect(),
//         ]).then(() => {

//             const seq = new TestSequence();

//             // The Verifier creates a request and gets a reference, which it 'sends' (via QR/NFC/etc.) to the Subject.
//             const verificationRequest = makeVerifReq();
//             const reference = verifier.makeReferenceToVerificationRequest(verificationRequest);

//             // The Subject resolves the reference, triggering a verification request.
//             seq.then(() => subject.requestToResolveBroadcast(reference))

//             // The Subject accepts the verification request.
//             subject.incomingVerifReqHook.on(({ peerId, request }) => {
//                 subject.answerVerificationRequest(peerId, request.id, request, true);
//             })

//             // The Verifier now asks IPv8 to verify
//             // The Subject's agent approves the Verification (as per consent)
//             // Both receive positive confirmation
//             subject.verifiee.completedVerifyHook.on(({ subjectId, verifierId, request, result }) => {
//                 expect(verifierId).to.equal("VERIF");
//                 expect(subjectId).to.equal("SUBJ");
//                 expect(result).to.equal(Result.Succeeded);
//                 done();
//             })
//             verifier.verifier.completedVerifyHook.on(({ subjectId, verifierId, request, result }) => {
//                 expect(verifierId).to.equal("VERIF");
//                 expect(subjectId).to.equal("SUBJ");
//                 expect(result).to.equal(Result.Succeeded);
//                 done();
//             })

//             seq.go();

//         }).catch(done);

//     })

//     function makeVerifReq(): OutVerificationRequest {
//         return { authority: { amount: 10, type: KVKAuthorityType.Inkoop }, datetime: new Date().toISOString(), id: "123", verifierId: "VERIF" }
//     }

//     function makeAgent(peerId: string): MockAgent {
//         const hookMsg: Hook<{ pId: string, msg: string }> = new Hook();
//         const hookVerif: Hook<{ pId: string, req: IPv8VerifReq }> = new Hook();
//         let _handler: null | InVerifyHandler = null;
//         return {
//             connect: () => Promise.resolve({ id: peerId }),
//             sendMessage: (pId: string, msg: string) => Promise.resolve(),
//             setIncomingMessageHandler: (handler: any) => { hookMsg.on(({ pId, msg }) => handler(pId, msg)) },
//             setVerificationRequestHandler: (handler: InVerifyHandler) => { _handler = handler },
//             verifyPeer: (peerId: string) => Promise.resolve(VerificationResult.Failed),
//             mockReceive: (pId: string, msg: string) => hookMsg.fire({ pId, msg }),
//             mockVerify: (pId: string, req: IPv8VerifReq) => {
//                 if (!_handler) {
//                     throw new Error("No Verification Handler set");
//                 } else {
//                     // Mock that verification will always succeed if consented
//                     return _handler(req).then(consent => VerificationResult.Succeeded);
//                 }
//             }
//         };
//     }

//     /** Mock a pair of peers that can send each other messages */
//     function mockPair(idA: string, idB: string) {
//         const agentA = makeAgent(idA);
//         const gatewayA = new MyAgent(agentA);

//         const agentB = makeAgent(idB);
//         const gatewayB = new MyAgent(agentB);

//         const peers: Dict<MockAgent> = {
//             [idA]: agentA,
//             [idB]: agentB,
//         }

//         agentA.sendMessage = (pId: string, msg: string) => { peers[pId].mockReceive(idA, msg); return Promise.resolve() };
//         agentB.sendMessage = (pId: string, msg: string) => { peers[pId].mockReceive(idB, msg); return Promise.resolve() };

//         agentA.verifyPeer = (pId: string, req: IPv8VerifReq) => peers[pId].mockVerify(idA, req);
//         agentB.verifyPeer = (pId: string, req: IPv8VerifReq) => peers[pId].mockVerify(idB, req);

//         return { gatewayA, gatewayB, agentA, agentB };
//     }

// })

// interface MockAgent extends Agent {
//     mockReceive: (pId: string, msg: string) => void
//     mockVerify: (pId: string, req: IPv8VerifReq) => Promise<Result>
// }