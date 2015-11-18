import nacl from '../../lib/nacl';

export default Ember.Controller.extend({
    dialee: null,
    theirKey: null,
    message: null,

    dialingProtocol: Ember.inject.service(),
    conversationProtocol: Ember.inject.service(),
    pki: Ember.inject.service(),

    init: function() {
        var _this = this;
        this._super.apply(this, arguments);

        this.get('dialingProtocol').on('newDial', this.handleNewDial.bind(_this));
    },

    handleNewDial: function(rendezvous, key) {
        alert('dial from: ' +this.get('pki').getName(key));
    },

    actions: {
        dial: function() {
            this.get('dialingProtocol').queueRequest(this.get('pki').getKeyBytes(this.get('dialee')));
        },
        send: function() {
            this.get('conversationProtocol').queueMessage(this.get('message'));
        },
        set: function() {
            this.get('conversationProtocol').set('theirPublicKey', this.get('theirKey'));
        }
    }
});