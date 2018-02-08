import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['item'],
    name: null,

    actions: {
        acceptDial: function() {
            this.sendAction('acceptDial', this.get('name'));
        },
        ignoreDial: function() {
            this.sendAction('ignoreDial', this.get('name'));
        }
    }

});