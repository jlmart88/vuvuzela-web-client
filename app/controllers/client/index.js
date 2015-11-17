import nacl from '../../lib/nacl';

export default Ember.Controller.extend({
    dialeeKey: null,
    theirKey: null,
    message: null,
    dialingProtocol: Ember.inject.service(),
    conversationProtocol: Ember.inject.service(), 

    actions: {
        dial: function() {
            this.get('dialingProtocol').queueRequest(nacl.base32strToBytes(this.get('dialeeKey')));
        },
        send: function() {
            this.get('conversationProtocol').queueMessage(this.get('message'));
        },
        set: function() {
            this.get('conversationProtocol').set('theirPublicKey', this.get('theirKey'));
        }
    }
});