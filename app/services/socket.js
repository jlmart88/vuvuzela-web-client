import config from '../config/environment';

export default Ember.Service.extend({
    socketService: Ember.inject.service('websockets'),
    session: Ember.inject.service(),

    ws: null,
    isConnected: false,

    connectToWS: function() {
        var ws;

        this.set('ws', this.get('socketService').socketFor(config.wsAddress + '/ws?publickey=' + this.get('session').get('myPublicKey')));

        ws = this.get('ws');
     
        ws.on('open', this.myOpenHandler, this);
        ws.on('message', this.myMessageHandler, this);
        ws.on('close', this.myCloseHandler, this);
    },
     
    myOpenHandler: function(event) {
        console.log('On open event has been called: ' + event);
        this.set('isConnected', true);
    },

    myMessageHandler: function(event) {
        console.log('Message: ' + event.data);
    },

    myCloseHandler: function(event) {
        console.log('On close event has been called: ' + event);
        this.set('isConnected', false);
    },


});