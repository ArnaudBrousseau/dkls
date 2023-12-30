import { bytesToHex, bytesToNumberBE } from '@noble/curves/abstract/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { gcm } from '@noble/ciphers/aes';
import { randomBytes } from '@noble/ciphers/webcrypto/utils';

/**
 * Implementation of Simplest OT as described in https://eprint.iacr.org/2015/267.pdf
 */

export type EncryptedMessage = {
    ciphertext: Uint8Array,
    nonce: Uint8Array,
}

export class OTSender {
    #privateKey: Uint8Array;
    #message0: Uint8Array;
    #message1: Uint8Array;

    constructor(config: {
        privateKey: Uint8Array | undefined,
        message0: Uint8Array,
        message1: Uint8Array,
    }) {
        this.#privateKey = config.privateKey || secp256k1.utils.randomPrivateKey();
        this.#message0 = config.message0;
        this.#message1 = config.message1;
    }

    publicKey(): Uint8Array {
        return secp256k1.getPublicKey(this.#privateKey);
    }

    encryptMessages(receiverPublicKey: Uint8Array): [EncryptedMessage, EncryptedMessage] {
        const receiverPublicPoint = secp256k1.ProjectivePoint.fromHex(bytesToHex(receiverPublicKey));
        const senderPublicPoint = secp256k1.ProjectivePoint.fromPrivateKey(this.#privateKey);


        // Key 0: H(sR)
        const key0 = sha256(receiverPublicPoint.multiply(bytesToNumberBE(this.#privateKey)).toRawBytes());
        
        // Key 1: H(s(R-S)
        const key1 = sha256(receiverPublicPoint.subtract(senderPublicPoint).multiply(bytesToNumberBE(this.#privateKey)).toRawBytes())

        return [encryptMessage(this.#message0, key0), encryptMessage(this.#message1, key1)];
    }


}

export class OTReceiver {
    #choiceBit: boolean;
    #privateKey: Uint8Array;
    #key: Uint8Array | null;
    #message: Uint8Array | null;
    

    constructor(config: {
        privateKey: Uint8Array | undefined,
        choiceBit: boolean
    }) {
        this.#choiceBit = config.choiceBit
        this.#privateKey = config.privateKey || secp256k1.utils.randomPrivateKey();
        this.#key = null;
        this.#message = null;
    }

    // Compute public key and encryption key given a sender public key
    publicKey(senderPublicKey: Uint8Array) {
        const ownPublicKey = secp256k1.getPublicKey(this.#privateKey);
        const senderPublicPoint = secp256k1.ProjectivePoint.fromHex(bytesToHex(senderPublicKey));

        // Set the encryption key to sha256(r*S)
        this.#key = sha256(senderPublicPoint.multiply(bytesToNumberBE(this.#privateKey)).toRawBytes());
        
        if (this.#choiceBit) {
            // R = S + rG (when c=1)
            const receiverPublicPoint = secp256k1.ProjectivePoint.fromPrivateKey(this.#privateKey);
            return senderPublicPoint.add(receiverPublicPoint).toRawBytes();
        } else {
            // R = rG (when c=0)
            return ownPublicKey
        }
    }

    decrypt(messages: [EncryptedMessage, EncryptedMessage]) {
        for (let encryptedMessage of messages) {
            try {
                this.#message = decryptMessage(encryptedMessage, this.#key!)
            } catch(e: any) {
                // A bit weird but we need to swallow exceptions here. Otherwise it reveals which message was which
                // not a huge deal but I figured better safe than sorry with exceptions.
            }
        }
    }

    /**
     * XXX: dangerous? 
     * This returns the decrypted message. Useful in tests, but might want to cut this down the line for security.
     */
    getMessage(): Uint8Array {
        if (this.#message) {
            return this.#message
        } else {
            throw new Error("no message received yet")
        }
    }
}

/**
 * Runs Simplest OT between a sender and a receiver
 */
export function runObliviousTransfer(s: OTSender, r: OTReceiver) {
    const S = s.publicKey();
    const R = r.publicKey(S);
    const encryptedMessages = s.encryptMessages(R);
    r.decrypt(encryptedMessages);
}

/**
 * Util function to encrypt a message (bytes) with AES-GCM
 */
const encryptMessage = function(message: Uint8Array, key: Uint8Array): EncryptedMessage {
    const nonce = randomBytes(24);
    const aes = gcm(key, nonce);
    const ciphertext = aes.encrypt(message);
    return {
        ciphertext,
        nonce
    }
}

/**
 * Util function to decrypt an encrypted message (bytes and nonce) with AES-GCM
 */
const decryptMessage = function(encrypted: EncryptedMessage, key: Uint8Array): Uint8Array {
    const aes = gcm(key, encrypted.nonce);
    return aes.decrypt(encrypted.ciphertext);
}