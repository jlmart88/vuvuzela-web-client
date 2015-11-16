import onionbox from './onionbox';

export default {
    sizeIntro: 36,
    sizeEncryptedIntro: 84, // 48 + 36

    forwardNonce: function(round) {
        var nonce = new Uint8Array(24),
            roundBuf = new Uint8Array(new Uint32Array([round]).buffer);
        roundBuf.reverse();
        nonce.set(roundBuf);
        nonce[4] = 0;
        return nonce;
    },

    backwardNonce: function(round) {
        var nonce = nacl.forwardNonce(round);
        nonce[4] = 1;
        return nonce; 
    },

    keyDialBucket: function(key, buckets) {
        return new Uint32Array(key.slice(28,32).buffer)[0] % buckets;
    }
}