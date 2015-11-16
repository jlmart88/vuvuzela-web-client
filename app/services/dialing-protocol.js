import onionbox from '../lib/onionbox';
import nacl from '../lib/nacl';
import vuvuzela from '../lib/vuvuzela-lib';

export default Ember.Service.extend({
    session: Ember.inject.service(),

    userDialRequests: [],

    queueRequest: function(request) {
        this.get('userDialRequests').pushObject(request);
    },

    nextDialRequest: function(round, buckets) {
        var nextRequest = this.get('userDialRequests').shiftObject(),
            intro,
            packed,
            ctxt,
            res,
            ex;
        console.log("Next dial request: "+nextRequest);
        if (nextRequest) {
            intro = {
                'Rendezvous': round + 4,
                'LongTermKey': this.get('session').getPublicKeyBytes()
            };
            packed = new Uint8Array(36);
            packed.set(new Uint8Array(new Uint32Array([intro.Rendezvous]).buffer));
            packed.set(intro.LongTermKey, 4);
            ctxt = onionbox.seal(packed, vuvuzela.forwardNonce(round),[nextRequest]);
            console.log(ctxt.onion);
            ex = {
                'Bucket': vuvuzela.keyDialBucket(nextRequest, buckets),
                'EncryptedIntro': ctxt.onion,
            };
        } else {
            intro = new Uint8Array(vuvuzela.sizeEncryptedIntro);
            window.crypto.getRandomValues(intro);
            ex = {
                'Bucket': 4294967295,
                'EncryptedIntro': intro
            };
        }

        packed = new Uint8Array(4 + vuvuzela.sizeEncryptedIntro);
        packed.set(new Uint8Array(new Uint32Array([ex.Bucket]).buffer));
        packed.set(ex.EncryptedIntro, 4);
        console.log("ex: "+packed);
        res = onionbox.seal(packed, vuvuzela.forwardNonce(round), this.get('session').get('serverKeys'));
        console.log("res.onion length: " + res.onion.length);
        return {
            'Round': round,
            'Onion': Array.prototype.slice.call(res.onion)
        }
    },

    handleDialBucket: function(dialBucket) {
        var nonce = vuvuzela.forwardNonce(dialBucket.Round),
            encIntro,
            intro,
            data,
            pk;

        for (var i = 0; i < dialBucket.Intros.length; i++) {
            encIntro = dialBucket.Intros[i];
            pk = encIntro.slice(0,32);
            try {
                data = nacl.crypto_box_open(encIntro.slice(32), nonce, pk, this.get('session').getPrivateKeyBytes());
                intro = {
                    'Rendezvous': new Uint32Array(data.buffer, 0, 1),
                    'LongTermKey': new Uint8Array(data.buffer, 4)
                };
            } catch (e) {
                continue;
            }   

            console.log("dial from " + intro.LongTermKey);
        }
    }
});