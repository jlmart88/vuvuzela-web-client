import { moduleFor, test } from 'ember-qunit';
import onionbox from 'vuvuzela-web/lib/onionbox';
import nacl from 'vuvuzela-web/lib/nacl';
import vuvuzela from 'vuvuzela-web/lib/vuvuzela-lib';

moduleFor('service:session', 'Unit | Service | session', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});

test('onionbox seal and open', function(assert) {
    var pk = nacl.base32strToBytes('st50pjmxgzv6pybrnxrxjd330s8hf37g5gzs1dqywy4bw3kdvcgg'),
        sk = nacl.base32strToBytes('0h863xcmx65w852dxzxjmdn81x8vz5jg0p4s92nd59k8xvaz0w3g'),
        nonce = vuvuzela.forwardNonce(1),
        msg = "Testing123",
        onion = onionbox.seal(msg, nonce, [pk]),
        peeled;

    console.log(onion);
    peeled = nacl.decode_latin1(nacl.crypto_box_open(onion.onion.slice(32), nonce, onion.onion.slice(0,32), sk));

    assert.equal(peeled, msg);
});
