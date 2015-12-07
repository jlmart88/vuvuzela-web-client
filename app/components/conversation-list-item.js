export default Ember.Component.extend({
    classNames: ['item'],
    name: null,
    activeConversation: null,

    isActive: Ember.computed('name', 'activeConversation', function() {
        return this.get('name') === this.get('activeConversation');
    }),

    isHovered: false,

    click: function() {
        this.sendAction('action', this.get('name'));
    },

    mouseEnter: function() {
        this.set('isHovered', true);
    },

    mouseLeave: function() {
        this.set('isHovered', false);
    },

    actions: {
        removeConversation: function() {
            this.sendAction('removeConversation', this.get('name'));
        }
    }

});