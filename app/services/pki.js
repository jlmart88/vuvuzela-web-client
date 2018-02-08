import nacl from '../lib/nacl';
import Ember from 'ember';

export default Ember.Service.extend({
    people: {
        'david': 'st50pjmxgzv6pybrnxrxjd330s8hf37g5gzs1dqywy4bw3kdvcgg',
        'alice': 'j10hpqtgnqc1y21xp5y7yamwa32jvdp89888q2semnxg95j4v82g',
        'nickolai': 'y92gkzpq132d9jqv8xcrgemmhf57ev48e32cegmsa3vmaak5a0j0',
    },

    getName: function(key) {
        var people = this.get('people');
        for (var prop in people) {
            if (people.hasOwnProperty(prop)) {
                if (people[prop] === key) {
                    return prop;
                }
            }
        }
        return null;

    },

    getNameFromBytes: function(keyBytes) {
        return this.getName(nacl.bytesToBase32str(keyBytes));
    },

    getKey: function(name) {
        return this.get('people')[name];
    },

    getKeyBytes: function(name) {
        return nacl.base32strToBytes(this.getKey(name));
    }

});