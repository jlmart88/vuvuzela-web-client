import config from '../config/environment';

export default Ember.Service.extend({
    websockets: Ember.inject.service(),
    session: Ember.inject.service(),

    dialingProtocol: Ember.inject.service(),
    conversationProtocol: Ember.inject.service(),

    ws: null,
    isConnected: false,

    connectToWS: function() {
        var ws;

        this.set('ws', this.get('websockets').socketFor(config.wsAddress + '/ws?publickey=' + this.get('session').get('myPublicKey')));

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
        var data;
        console.log('Message: ' + JSON.parse(event.data).Type);
        data = JSON.parse(event.data);
        switch(data.Type) {
            case 4: // ConvoResponse
                break;
            case 6: // DialBucket
                this.get('dialingProtocol').handleDialBucket(data.Message);
                break;
            case 7: // AnnounceConvoRound
                this.get('ws').send({'Type':0, 'Message':this.get('conversationProtocol').nextConvoRequest(data.Message.Round)}, true);
                break;
            case 8: // AnnounceDialRound
                this.get('ws').send({'Type':1, 'Message':this.get('dialingProtocol').nextDialRequest(data.Message.Round, data.Message.Buckets)}, true);
                break;
            default: // error
                break;
        }
    },

    myCloseHandler: function(event) {
        console.log('On close event has been called: ' + event);
        this.set('isConnected', false);
    },


});