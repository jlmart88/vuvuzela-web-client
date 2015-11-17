import { test } from 'ember-qunit';
import vuvuzela from 'vuvuzela-web/lib/vuvuzela-lib';

test('marshal and unmarshal', function(assert) {
    var obj,
      arr,
      arr2,
      attrs,
      bytes,
      out;

    arr = new Uint8Array([240, 1, 35]);
    arr2 = new Uint32Array([5345, 257, 23, 989340, 11111111]);
    obj = {
      a: 257, 
      b: arr,
      c: 34,
      d: arr2
    };
    attrs = [
      {name:'a', type:'uint32_t'}, 
      {name:'b', type:'uint8_t', len:3}, 
      {name:'c', type:'uint8_t'}, 
      {name:'d', type:'uint32_t', len:5}
    ];
    bytes = vuvuzela.marshal(obj, attrs);
    //console.log('Bytes:'+JSON.stringify(bytes));
    out = vuvuzela.unmarshal(bytes, attrs);
    //console.log('Obj: ' + JSON.stringify(obj));
    //console.log('Out: ' + JSON.stringify(out));
    assert.deepEqual(out, obj, 'marshal and unmarshal did not return the same result');
});
