/**
 * This module handles the generic encoding and decoding of QR messages. 
 * Domain specific codecs should implement these interfaces.
 * 
 * Encoding and decoding QRs is done in two steps:
 * - All QR strings are first decoded to a QRX object
 * - The QRX object is subsequently decoded to a message object
 */

import { DecoderChain, DecodeResult, Decodes, DecodeStatus, Encodes, MultiDecoder } from "./GenericDecoding";

/** The intermediate data object */
export class QRX<T> {
    constructor(
        readonly type: string,
        readonly payload: T,
    ) { }
}

export interface QRStringDecoder extends Decodes<string, QRX<string>, QRDecodeError> { }
export interface QRStringEncoder extends Encodes<QRX<string>, string> { }
export interface QRDomainDecoder<T> extends Decodes<QRX<string>, QRX<T>, QRDecodeError> { }
export interface QRDomainEncoder<T> extends Encodes<T, QRX<string>> { }

export type QRDecodeResult<T> = DecodeResult<QRX<T>, QRDecodeError>;

/** Helper for creating Successful QRDecodeResult */
export const decodeSucceded = <T>(result: QRX<T>): QRDecodeResult<T> => ({ status: DecodeStatus.Succeeded, result })
/** Helper for creating Failed QRDecodeResult */
export const decodeFailed = <T>(error: QRDecodeError): QRDecodeResult<T> => ({ status: DecodeStatus.Failed, error })
/** Helper for creating Unmatched QRDecodeResult */
export const decodeUnmatched = <T>(): QRDecodeResult<T> => ({ status: DecodeStatus.Unmatched })

export enum QRDecodeError {
    INVALID_FORMAT = "INVALID_FORMAT",
    INVALID_PAYLOAD = "INVALID_PAYLOAD",
    UNMATCHED_TYPE = "UNMATCHED_TYPE",
}

export class MultiQRDecoder<T> implements Decodes<string, QRX<T>, QRDecodeError> {

    private decoder: Decodes<string, QRX<T>, QRDecodeError>

    constructor(
        stringDecoder: QRStringDecoder,
        domainDecoders: QRDomainDecoder<T>[]) {

        this.decoder = new DecoderChain(stringDecoder, new MultiDecoder(domainDecoders));
    }

    decode(str: string): QRDecodeResult<T> {
        return this.decoder.decode(str);
    }
}
