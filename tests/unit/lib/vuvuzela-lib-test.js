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
    assert.deepEqual(out, obj);
});

test('varint encode and decode', function(assert){
  var num = 300,
    enc,
    out;

  enc = vuvuzela.varintEncode(num);
  //console.log('Enc: '+JSON.stringify(enc));
  out = vuvuzela.varintDecode(enc);
  assert.equal(out, num);
});

test('varint encode and decode big', function(assert){
  var num = 1447795004,
    desired = new Uint8Array([248, 228, 220, 228, 10, 0, 0, 0, 0, 0]),
    enc,
    out;

  enc = vuvuzela.varintEncode(num);
  //console.log('Enc: '+JSON.stringify(enc));
  assert.deepEqual(enc, desired);
  out = vuvuzela.varintDecode(enc);
  assert.equal(out, num);
});

test('varint encode and decode negative', function(assert){
  var num = -300,
    enc,
    out;

  enc = vuvuzela.varintEncode(num);
  //console.log('Enc: '+JSON.stringify(enc));
  out = vuvuzela.varintDecode(enc);
  assert.equal(out, num);
});