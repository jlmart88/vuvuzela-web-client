import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
    this.route('auth', function() {
        this.route('login');
    });
    this.resource('client', function(){});
});

export default Router;
