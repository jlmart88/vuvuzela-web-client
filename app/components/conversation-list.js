export default Ember.Component.extend({
    conversations:[],
    activeConversation: null,

    dialee: null,

    pki: Ember.inject.service(),
    dialingProtocol: Ember.inject.service(),
    conversationProtocol: Ember.inject.service(),

    createConversation: function(name){
        console.log('adding dialee '+name);
        this.get('conversations').addObject(name);
    },

    actions: {
        dial: function() {
            var name = this.get('dialee');
            this.get('dialingProtocol').queueRequest(this.get('pki').getKeyBytes(name));
            this.createConversation(name);
            this.send('switchConversation', name);
            this.set('dialee', null);
        },

        switchConversation: function(name) {
            this.get('conversationProtocol').set('theirPublicKey', this.get('pki').getKey(name));
        }
    }

});