import nacl from '../../lib/nacl';

export default Ember.Controller.extend({
    dialeeKey: null,
    dialingProtocol: Ember.inject.service(), 

    actions: {
        dial: function() {
            this.get('dialingProtocol').queueRequest(nacl.base32strToBytes(this.get('dialeeKey')));
        }
    }
});