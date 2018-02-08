import Ember from 'ember';

export default Ember.Route.extend({
    socket: Ember.inject.service(),

    init: function(){
        var _this = this;
        this._super.apply(this, arguments);

        this.get('socket').on('closed', function() {
            _this.transitionTo('auth.login');
        });
    },

    beforeModel: function() {
        if (!this.get('socket').get('isConnected')) {
            this.transitionTo('auth.login');
        }
    }


});