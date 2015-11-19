import nacl from '../../lib/nacl';

export default Ember.Controller.extend({
    message: null,

    dialingProtocol: Ember.inject.service(),
    conversationProtocol: Ember.inject.service(),
    pki: Ember.inject.service(),
    session: Ember.inject.service(),

    isInConversation: Ember.computed('activeConversation', function() {
        if (this.get('activeConversation')){
            return this.get('activeConversation') !== this.get('session').get('myName');
        }
        return false
    }),

    activeConversation: Ember.computed('conversationProtocol.theirPublicKey', function() {
        return this.get('pki').getName(this.get('conversationProtocol').get('theirPublicKey'));
    }),

    init: function() {
        var _this = this;
        this._super.apply(this, arguments);

        this.get('dialingProtocol').on('newDial', this.handleNewDial.bind(_this));
    },

    handleNewDial: function(rendezvous, key) {
        alert('dial from: ' +this.get('pki').getNameFromBytes(key));
    },
});