import vuvuzela from '../lib/vuvuzela-lib'

export default Ember.Component.extend({
    name: null,
    messages: Ember.computed('name', function() {
        if (this.get('name')) {
            return this.get('storedConversations')[this.get('name')].messages;
        } else {
            return [];
        }
    }),

    sortedMessagesKeys: ['round'],
    sortedMessages: Ember.computed.sort('messages', 'sortedMessagesKeys'),
    queuedMessages: Ember.computed('name', function() {
        if (this.get('name')) {
            return this.get('storedConversations')[this.get('name')].queuedMessages;
        } else {
            return [];
        }
    }),

    storedConversations: {},

    isResponding: Ember.computed.alias('conversationProtocol.peerResponding'),

    messageListId: 'message-list',

    maxLength: vuvuzela.sizeMessageBody,

    typedMessage: null,

    conversationProtocol: Ember.inject.service(),

    didInsertElement : function(){
        this.get('conversationProtocol').on('receivedMessage', this.handleIncomingMessage.bind(this));
        this.get('conversationProtocol').on('sentMessage', this.handleOutgoingMessage.bind(this));
        this.get('conversationProtocol').on('changeConversation', this.changeConversation.bind(this));
    },

    handleIncomingMessage: function(body, round) {
        this.addMessage(body, round, false);
    },

    handleOutgoingMessage: function(body, round) {
        var queuedMessages = this.get('queuedMessages');
        this.addMessage(body, round, true);
        queuedMessages.removeAt(queuedMessages.indexOf(body));
    },

    changeConversation: function(name) {
        var storedConversations = this.get('storedConversations'),
            currentConversationName = this.get('name');
        if (!storedConversations[name]) {
            storedConversations[name] = {
                'messages': [],
                'queuedMessages': [] 
            };
        }
        this.set('name', name);
        this.get('conversationProtocol').setMessageQueue(this.get('queuedMessages'));
        
    },

    addMessage: function(message, round, isMine) {
        this.get('messages').pushObject({'text':message, 'round':round, 'isMine':isMine});
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
                this.get('queuedMessages').pushObject(msg);
                this.scrollMessagesListToBottom();
            }
            this.set('typedMessage', null);
        }
    }

});