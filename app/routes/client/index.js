export default Ember.Route.extend({
    socket: Ember.inject.service(),

    beforeModel: function() {
        if (!this.get('socket').get('isConnected')) {
            this.transitionTo('auth.login');
        }
    }

});