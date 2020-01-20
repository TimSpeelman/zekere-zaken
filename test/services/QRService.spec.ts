import { DecodeStatus } from "../../src/modules/QR/GenericDecoding";
import { QRDecodeError } from "../../src/modules/QR/QREncoding";
import { qrDecoder, SimpleQRStringCodec, VerificationOfferCodec } from "../../src/services/QRService";
import { describe, expect, it } from "./setup";

describe("QRService", function () {

    it("does not decode an unmatched type", () => {
        const result = qrDecoder.decode("UnknownType|string");
        expect(result.status).to.equal(DecodeStatus.Unmatched);
    });

    it("does not decode an incorrect message format", () => {
        const result = qrDecoder.decode("randomstring");
        expect(result.status).to.equal(DecodeStatus.Failed);

        if (result.status === DecodeStatus.Failed)
            expect(result.error).to.equal(QRDecodeError.INVALID_FORMAT);
    });

    it("does not decode an incorrect payload format", () => {
        const result = qrDecoder.decode("VerifyOffer|string");
        expect(result.status).to.equal(DecodeStatus.Failed);

        if (result.status === DecodeStatus.Failed)
            expect(result.error).to.equal(QRDecodeError.INVALID_FORMAT);
    });

    it("does not decode an incorrect payload structure (missing attribute)", () => {
        const result = qrDecoder.decode('VerifyOffer|{"mid":"mymid","attribute_value":"val"}');
        expect(result.status).to.equal(DecodeStatus.Failed);

        if (result.status === DecodeStatus.Failed)
            expect(result.error).to.equal(QRDecodeError.INVALID_PAYLOAD);
    });

    it("decodes a valid message", () => {
        const result = qrDecoder.decode('VerifyOffer|{"mid":"mymid","attribute_hash":"hash","attribute_value":"val"}');
        expect(result.status).to.equal(DecodeStatus.Succeeded);

        if (result.status === DecodeStatus.Succeeded)
            expect(result.result).to.deep.equal({ mid: "mymid", attribute_hash: "hash", attribute_value: "val" });
    });

    it("can encode a message", () => {
        const original = { mid: "mymid", attribute_hash: "hash", attribute_value: "val" };
        const qrx = new VerificationOfferCodec().encode(original);
        const str = new SimpleQRStringCodec().encode(qrx);
        expect(str).to.equal('VerifyOffer|{"mid":"mymid","attribute_hash":"hash","attribute_value":"val"}');

        const result = qrDecoder.decode(str);

        expect(result.status).to.equal(DecodeStatus.Succeeded);

        if (result.status === DecodeStatus.Succeeded)
            expect(result.result).to.deep.equal(original);

    })

});
