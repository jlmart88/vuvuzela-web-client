export default Ember.Component.extend({
    name: null,
    messages: [],
    sortedMessagesKeys: ['round'],
    sortedMessages: Ember.computed.sort('messages', 'sortedMessagesKeys'),
    queuedMessages: [],

    messageListId: 'message-list',

    typedMessage: null,

    conversationProtocol: Ember.inject.service(),

    init: function() {
        var _this = this;
        this._super.apply(this, arguments);

        this.get('conversationProtocol').on('receivedMessage', this.handleIncomingMessage.bind(_this));
        this.get('conversationProtocol').on('sentMessage', this.handleOutgoingMessage.bind(_this));
    },

    handleIncomingMessage: function(body, round) {
        this.addMessage(body, round, false);
    },

    handleOutgoingMessage: function(body, round) {
        var queuedMessages = this.get('queuedMessages');
        this.addMessage(body, round, true);
        queuedMessages.removeAt(queuedMessages.indexOf(body));
    },

    addMessage: function(message, round, isMine) {
        this.get('messages').addObject({'text':message, 'round':round, 'isMine':isMine});
        this.scrollMessagesListToBottom();
    },

    scrollMessagesListToBottom: function() {
        Ember.run.later(this, function() {
            var messageListDiv = Ember.$('#'+this.get('messageListId'))[0];
            messageListDiv.scrollTop = messageListDiv.scrollHeight;
        }, 100);
    },

    actions: {
        sendMessage: function() {
            var msg = this.get('typedMessage');
            if (msg) {
                this.get('conversationProtocol').queueMessage(msg);
                this.get('queuedMessages').addObject(msg);
                this.scrollMessagesListToBottom();
            }
            this.set('typedMessage', null);
        }
    }

});