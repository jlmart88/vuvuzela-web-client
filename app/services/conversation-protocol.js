import onionbox from '../lib/onionbox';
import nacl from '../lib/nacl';
import vuvuzela from '../lib/vuvuzela-lib';

export default Ember.Service.extend({
    session: Ember.inject.service(),

    theirPublicKey: null,

    getTheirPublicKeyBytes: function() {
        if (this.get('theirPublicKey') == null) {
            this.set('theirPublicKey', this.get('session').get('myPublicKey'));
        }
        return nacl.base32strToBytes(this.get('theirPublicKey'));
    },

    userMessageQueue: [],
    pendingRounds: {},

    queueMessage: function(message) {
        this.get('userMessageQueue').pushObject(message);
    },

    nextConvoRequest: function(round) {
        var nextMessage = this.get('userMessageQueue').shiftObject(),
            packed,
            body = new Uint8Array(vuvuzela.sizeMessage),
            encMsg,
            nonce,
            roundBuf,
            res,
            cex,
            cex_attrs;
        console.log('Next message: ' + nextMessage);
        if (nextMessage) {
            body[0] = 1;
            body.set(nacl.encode_latin1(nextMessage), 1);
        } else {
            body[0] = 0;
            body.set(new Uint8Array((new Float64Array([parseInt(moment().format('X'))]).buffer)), 1);
        }
        nonce = new Uint8Array(24);
        roundBuf = new Uint8Array(new Uint32Array([round]).buffer);
        roundBuf.reverse(); // fix endianness
        nonce.set(roundBuf);
        nonce[23] = this.myRole();
        encMsg = nacl.crypto_box(body, nonce, this.getTheirPublicKeyBytes(), this.get('session').getPrivateKeyBytes());
        cex = {
            'DeadDrop': this.deadDrop(round),
            'EncryptedMessage': encMsg
        }
        cex_attrs = [
            {name:'DeadDrop', type:'uint8_t', len:16},
            {name:'EncryptedMessage', type:'uint8_t', len:vuvuzela.sizeEncryptedMessage}
        ]

        packed = vuvuzela.marshal(cex, cex_attrs);
        res = onionbox.seal(packed, vuvuzela.forwardNonce(round), this.get('session').get('serverKeys'));
        this.get('pendingRounds')[round] = {onionSharedKeys: res.sharedKeys, sentMessage: encMsg};
        return {
            'Round': round,
            'Onion': Array.prototype.slice.call(res.onion)
        }
    },

    handleConvoResponse: function() {

    },

    solo: function() {
        var myKey = this.get('session').getPublicKeyBytes(),
            theirKey = this.getTheirPublicKeyBytes();

        for (var i = 0; i < myKey.length; i++) {
            if (myKey[i] !== theirKey[i]) {
                return 0
            }
        }
        return 1;
    },

    myRole: function() {
        var myKey = this.get('session').getPublicKeyBytes(),
            theirKey = this.getTheirPublicKeyBytes();

        for (var i = 0; i < myKey.length; i++) {
            if (myKey[i] < theirKey[i]) {
                return 0
            }
        }
        return 1;
    },

    theirRole: function() {
        var myKey = this.get('session').getPublicKeyBytes(),
            theirKey = this.getTheirPublicKeyBytes();

        for (var i = 0; i < myKey.length; i++) {
            if (theirKey[i] < myKey[i]) {
                return 0
            }
        }
        return 1;
    },

    deadDrop: function(round) {
        var id = new Uint8Array(16),
            sharedKey,
            shaObj,
            roundBuf;

        if (this.solo()) {
            window.crypto.getRandomValues(id);
        } else {
            sharedKey = nacl.crypto_box_precompute(this.getTheirPublicKeyBytes(), this.get('session').getPrivateKeyBytes());
            shaObj = new jsSHA('SHA-256', 'HEX');
            shaObj.setHMACKey(nacl.to_hex(sharedKey.boxK), 'HEX');
            roundBuf = new Uint8Array(new Uint32Array([round]).buffer);
            roundBuf.reverse(); // fix endianness
            shaObj.update(nacl.to_hex(roundBuf));
            id.set(nacl.from_hex(shaObj.getHMAC('HEX')).slice(0,16));
        }
        return id;
    }

});