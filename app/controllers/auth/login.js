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
            // this.get('session').set('myPublicKey', this.get('publicKey'));
            // this.get('session').set('myPrivateKey', this.get('privateKey'));
            // this.get('session').set('name', this.get('name'));
            if (this.get('name') == 'david') {
                this.get('session').set('myPublicKey', 'st50pjmxgzv6pybrnxrxjd330s8hf37g5gzs1dqywy4bw3kdvcgg');
                this.get('session').set('myPrivateKey', '0h863xcmx65w852dxzxjmdn81x8vz5jg0p4s92nd59k8xvaz0w3g');
                this.get('session').set('name', 'david');
            } else {
                this.get('session').set('myPublicKey', 'j10hpqtgnqc1y21xp5y7yamwa32jvdp89888q2semnxg95j4v82g');
                this.get('session').set('myPrivateKey', '82v7008ke1dyzatzq04mrtnxt5s92vnfxpdgr61rbtw30hbge330');
                this.get('session').set('name', 'alice');
            }
            this.get('socket').connectToWS(this.get('publicKey'));
        }
    }
});