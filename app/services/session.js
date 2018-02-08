import nacl from '../lib/nacl';
import Ember from 'ember';

export default Ember.Service.extend({
    myPublicKey: null,
    myPrivateKey: null,
    myName: null,
    serverKeys: [
        nacl.base32strToBytes('pd04y1ryrfxtrayjg9f4cfsw1ayfhwrcfd7g7emhfjrsc4cd20f0'),
        nacl.base32strToBytes('349bs143gvm7n0kxwhsaayeta2ptjrybwf37s4j7sj0yfrc3dxs0'),
        nacl.base32strToBytes('fkaf8ds0a4fmdsztqzpcn4em9npyv722bxv2683n9fdydzdjwgy0')
    ],

    getPublicKeyBytes: function() {
        return nacl.base32strToBytes(this.get('myPublicKey'));
    },

    getPrivateKeyBytes: function() {
        return nacl.base32strToBytes(this.get('myPrivateKey'));
    }
});