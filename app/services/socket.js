import config from '../config/environment';
import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {
    websockets: Ember.inject.service(),
    session: Ember.inject.service(),

    dialingProtocol: Ember.inject.service(),
    conversationProtocol: Ember.inject.service(),

    ws: null,
    isConnected: false,

    connectToWS: function() {
        var ws;

        if (this.get('ws')){
            this.get('ws').reconnect();
        } else {
            this.set('ws', this.get('websockets').socketFor(config.wsAddress + '/ws?publickey=' + this.get('session').get('myPublicKey')));
        
            ws = this.get('ws');
     
            ws.on('open', this.myOpenHandler, this);
            ws.on('message', this.myMessageHandler, this);
            ws.on('close', this.myCloseHandler, this);
            ws.on('error', this.myErrorHandler, this);
        }
    },
     
    myOpenHandler: function() {
        console.log('Connected to server');
        this.set('isConnected', true);
        this.trigger('connected');
    },

    myMessageHandler: function(event) {
        var data;
        console.log('Message: ' + JSON.parse(event.data).Type);
        data = JSON.parse(event.data);
        switch(data.Type) {
            case 4: // ConvoResponse
                this.get('conversationProtocol').handleConvoResponse(data.Message);
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

    myCloseHandler: function() {
        console.log('Disconnected from server');
        this.set('isConnected', false);
        this.trigger('closed');
    },

    myErrorHandler: function() {
        console.log('Websocket error');
        this.trigger('error');
    },


});