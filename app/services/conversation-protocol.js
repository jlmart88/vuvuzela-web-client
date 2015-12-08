import onionbox from '../lib/onionbox';
import nacl from '../lib/nacl';
import vuvuzela from '../lib/vuvuzela-lib';

export default Ember.Service.extend(Ember.Evented, {
    session: Ember.inject.service(),

    theirPublicKey: null,
    latency: 0,
    peerResponding: false,
    userMessageQueue: [],
    pendingRounds: {},

    resetPeerResponding: function() {
        this.set('peerResponding', false);
    }.observes('theirPublicKey'),

    getTheirPublicKeyBytes: function() {
        if (this.get('theirPublicKey') == null) {
            return this.get('session').getPublicKeyBytes();
        }
        return nacl.base32strToBytes(this.get('theirPublicKey'));
    },

    queueMessage: function(message) {
        this.get('userMessageQueue').pushObject(message);
    },

    setMessageQueue: function(messages) {
        this.get('userMessageQueue').clear();
        this.get('userMessageQueue').pushObjects(messages);
    },

    changeConversation: function(key, name) {
        this.set('theirPublicKey', key);
        this.trigger('changeConversation', name);
    },

    nextConvoRequest: function(round) {
        var nextMessage = this.get('userMessageQueue').shiftObject(),
            packed,
            body = new Uint8Array(vuvuzela.sizeMessage),
            timeBuf,
            encMsg,
            nonce,
            roundBuf,
            res,
            cex,
            cex_attrs;
        if (nextMessage) {
            body[0] = 1;
            body.set(nacl.encode_latin1(nextMessage), 1);
        } else {
            body[0] = 0;
            timeBuf = vuvuzela.varintEncode(Math.floor(parseInt(moment().format('X'))));
            body.set(timeBuf, 1);
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

        if (nextMessage) {
            this.trigger('sentMessage', nextMessage, round)
        };

        return {
            'Round': round,
            'Onion': Array.prototype.slice.call(res.onion)
        }
    },

    handleConvoResponse: function(response) {
        var pr = this.get('pendingRounds')[response.Round],
            encMsg,
            isSameMsg,
            nonce,
            roundBuf,
            msgData,
            body;
        
        if (typeof pr === undefined) {
            console.error('Round ' + response.Round + ' not found for response');
            return;
        }

        encMsg = onionbox.open(nacl.encode_latin1(window.atob(response.Onion)), vuvuzela.backwardNonce(response.Round), pr.onionSharedKeys);

        if (!encMsg.ok) {
            console.error('Decrypting onion for round ' + response.Round + ' failed');
            return;
        }

        isSameMsg = true;
        for (var i = 0; i < encMsg.message.length; i++) {
            if (encMsg.message[i] != pr.sentMessage[i]) {
                isSameMsg = false;
                break;
            }
        }

        if (isSameMsg && !this.solo()) {
            this.set('peerResponding', false);
            return;
        }

        nonce = new Uint8Array(24);
        roundBuf = new Uint8Array(new Uint32Array([response.Round]).buffer);
        roundBuf.reverse(); // fix endianness
        nonce.set(roundBuf);
        nonce[23] = this.theirRole();
        msgData = nacl.crypto_box_open(encMsg.message, nonce, this.getTheirPublicKeyBytes(), this.get('session').getPrivateKeyBytes());

        if (msgData[0] == 1) {
            body = nacl.decode_latin1(msgData.slice(1));
            console.log('Received message: ' + body);
            this.trigger('receivedMessage', body, response.Round);
        } else {
            body = moment.unix(vuvuzela.varintDecode(msgData.slice(1)));
            this.set('latency', moment().diff(body));
            console.log('latency (ms): ' + this.get('latency'));
        }

        this.set('peerResponding', true);
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

        for (var i = myKey.length - 1; i >= 0; i--) {
            if (myKey[i] < theirKey[i]) {
                return 0
            } else if (myKey[i] > theirKey[i]) {
                return 1
            }
        }
        return 1;
    },

    theirRole: function() {
        var myKey = this.get('session').getPublicKeyBytes(),
            theirKey = this.getTheirPublicKeyBytes();

        for (var i = myKey.length - 1; i >= 0; i--) {
            if (theirKey[i] < myKey[i]) {
                return 0
            } else if (theirKey[i] > myKey[i]) {
                return 1
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