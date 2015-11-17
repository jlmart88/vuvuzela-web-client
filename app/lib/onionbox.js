import nacl from './nacl';

export default {
    overhead: 48, // 32 (key size) + 16 (box.overhead)
    seal: function(messageBytes, nonce, publicKeys) {
        //console.log('Sealing: ' + message)
        var onion = messageBytes,
            sharedKeys = [],
            newKeys,
            res;

        for (var i = publicKeys.length - 1; i >=0; i--) {
            newKeys = nacl.crypto_box_keypair();
            sharedKeys[i] = nacl.crypto_box_precompute(publicKeys[i], newKeys.boxSk);
            res = nacl.crypto_box_precomputed(onion, nonce, sharedKeys[i]);
            onion = new Uint8Array(res.length + newKeys.boxPk.length);
            onion.set(newKeys.boxPk);
            onion.set(res, newKeys.boxPk.length);
        }

        return {
            'onion': onion,
            'sharedKeys': sharedKeys
        }
    },

    open: function(onion, nonce, sharedKeys) {
        var message = onion;

        for (var i = 0; i < sharedKeys.length; i++) {
            try {
                message = nacl.crypto_box_open_precomputed(message, nonce, sharedKeys[i]);
            } catch(e) {
                return {
                    'message': null,
                    'ok': false
                }
            }
        }

        return {
            'message': message,
            'ok': true
        }
    }
}