import Ember from 'ember';

export default Ember.Component.extend({
    conversations:[],
    activeConversation: null,

    dialee: null,
    newDials: [],

    pki: Ember.inject.service(),
    dialingProtocol: Ember.inject.service(),
    conversationProtocol: Ember.inject.service(),
    session: Ember.inject.service(),

    latency: Ember.computed.alias('conversationProtocol.latency'),

    didInsertElement : function(){
        this.get('dialingProtocol').on('newDial', this.handleNewDial.bind(this));
    },

    handleNewDial: function(rendezvous, key) {
        var name = this.get('pki').getNameFromBytes(key);
        if (this.get('conversations').indexOf(name) !== -1) {
            //notify the user that some active conversation is redialing?
        } else {
            this.get('newDials').addObject(name);
        }
    },

    createConversation: function(name){
        this.get('conversations').addObject(name);
    },

    actions: {
        dial: function() {
            var name = this.get('dialee');
            if (name && name !== this.get('session.myName')) {
                this.get('dialingProtocol').queueRequest(this.get('pki').getKeyBytes(name));
                this.createConversation(name);
                this.send('switchConversation', name);
            }
            this.set('dialee', null);
        },

        switchConversation: function(name) {
            this.get('conversationProtocol').changeConversation(this.get('pki').getKey(name), name);
        },

        removeConversation: function(name){
            this.get('conversations').removeObject(name);
            if (this.get('activeConversation') === name) {
                this.send('switchConversation', null);
            }
        },

        acceptDial: function(name) {
            this.createConversation(name);
            this.get('newDials').removeObject(name);
            this.send('switchConversation', name);
        },

        ignoreDial: function(name) {
            this.get('newDials').removeObject(name);
        }
    }

});