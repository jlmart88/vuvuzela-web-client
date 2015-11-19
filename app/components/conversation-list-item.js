export default Ember.Component.extend({
    classNames: ['item'],
    name: null,
    activeConversation: null,
    isActive: Ember.computed('name', 'activeConversation', function() {
        return this.get('name') === this.get('activeConversation');
    }),

    click: function() {
        this.sendAction('action', this.get('name'));
    },

});