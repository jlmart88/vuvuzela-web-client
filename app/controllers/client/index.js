import Ember from 'ember';

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
        return false;
    }),

    activeConversation: Ember.computed('conversationProtocol.theirPublicKey', function() {
        return this.get('pki').getName(this.get('conversationProtocol').get('theirPublicKey'));
    }),
});