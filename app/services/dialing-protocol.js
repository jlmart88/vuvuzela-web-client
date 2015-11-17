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
            intro_attrs,
            packed,
            ctxt,
            res,
            ex,
            ex_attrs;
        console.log("Next dial request: "+nextRequest);
        if (nextRequest) {
            intro = {
                'Rendezvous': round + 4,
                'LongTermKey': this.get('session').getPublicKeyBytes()
            };
            intro_attrs = [
                {name:'Rendezvous', type:'uint32_t'},
                {name:'LongTermKey', type:'uint8_t', len:32}
            ];
            packed = vuvuzela.marshal(intro, intro_attrs);
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
        ex_attrs = [
            {name:'Bucket', type:'uint32_t'},
            {name:'EncryptedIntro', type:'uint8_t', len:vuvuzela.sizeEncryptedIntro}
        ];
        packed = vuvuzela.marshal(ex, ex_attrs);
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
            intro_attrs,
            data,
            pk;

        for (var i = 0; i < dialBucket.Intros.length; i++) {
            encIntro = dialBucket.Intros[i];
            pk = encIntro.slice(0,32);
            try {
                data = nacl.crypto_box_open(encIntro.slice(32), nonce, pk, this.get('session').getPrivateKeyBytes());
                intro_attrs = [
                    {name:'Rendezvous', type:'uint32_t'},
                    {name:'LongTermKey', type:'uint8_t', len:32}
                ];
                intro = vuvuzela.unmarshal(data, intro_attrs);
            } catch (e) {
                continue;
            }   

            console.log("dial from " + intro.LongTermKey);
        }
    }
});