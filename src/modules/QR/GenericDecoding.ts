
/** Decodes from the In-type to the Out-type */
export interface Decodes<In, Out, Err> {
    decode(obj: In): DecodeResult<Out, Err>;
}

/** Encodes from the In-type to the Out-type */
export interface Encodes<In, Out> {
    encode(obj: In): Out;
}

/** Informative decoding result */
export type DecodeResult<T, Err> = SuccessfulDecode<T> | DecodeFailure<Err> | DecodeUnmatched

export interface SuccessfulDecode<T> {
    status: DecodeStatus.Succeeded,
    result: T
}

export interface DecodeUnmatched {
    status: DecodeStatus.Unmatched,
}

export interface DecodeFailure<Err> {
    status: DecodeStatus.Failed,
    error: Err,
}

export enum DecodeStatus {
    Succeeded = "Succeeded",
    Failed = "Failed",
    Unmatched = "Unmatched",
}

/**
 * A MultiDecoder simply finds the first decoder that can decode
 * the incoming object, similar to the "Chain of Responsibility"
 * design pattern.
 */
export class MultiDecoder<In, Out, Err> implements Decodes<In, Out, Err> {
    constructor(private decoders: Decodes<In, Out, Err>[]) { }

    /**
     * Finds the first codec that is able to decode the QR,
     * and return the decoded result
     */
    decode(obj: In): DecodeResult<Out, Err> {
        for (let codec of this.decoders) {
            const result = codec.decode(obj);
            if (result.status === DecodeStatus.Succeeded) {
                return result;
            } else if (result.status === DecodeStatus.Failed) {
                return result;
            }
        }
        return { status: DecodeStatus.Unmatched }
    }
}

/**
 * Chain two decoders (A-to-B + B-to-C) together, creating a
 * single decoder A-to-C.
 */
export class DecoderChain<A, B, C, Err> implements Decodes<A, C, Err> {

    constructor(
        private decodeA: Decodes<A, B, Err>,
        private decodeB: Decodes<B, C, Err>) { }

    decode(a: A): DecodeResult<C, Err> {
        const result = this.decodeA.decode(a);

        if (result.status === DecodeStatus.Succeeded) {
            return this.decodeB.decode(result.result);
        } else {
            return result;
        }
    }
}
