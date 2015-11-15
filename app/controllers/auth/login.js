export default Ember.Controller.extend({
    socket: Ember.inject.service(),
    session: Ember.inject.service(),

    publicKey: null,
    privateKey: null,
    name: null,

    listenForConnection: function() {
        console.log(this.socket);
        if (this.get('socket').get('isConnected')) {
            this.transitionToRoute('client');
        }
    }.observes('socket.isConnected'),

    actions: {
        login: function() {
            this.get('session').set('myPublicKey', this.get('publicKey'));
            this.get('session').set('myPrivateKey', this.get('privateKey'));
            this.get('session').set('name', this.get('name'));
            this.get('socket').connectToWS(this.get('publicKey'));
        }
    }
});