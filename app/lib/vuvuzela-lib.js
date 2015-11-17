import onionbox from './onionbox';

export default {
    sizeIntro: 36,
    sizeEncryptedIntro: 84, // 48 + 36

    forwardNonce: function(round) {
        var nonce = new Uint8Array(24),
            roundBuf = new Uint8Array(new Uint32Array([round]).buffer);
        roundBuf.reverse();
        nonce.set(roundBuf);
        nonce[4] = 0;
        return nonce;
    },

    backwardNonce: function(round) {
        var nonce = nacl.forwardNonce(round);
        nonce[4] = 1;
        return nonce; 
    },

    keyDialBucket: function(key, buckets) {
        return new Uint32Array(key.slice(28,32).buffer)[0] % buckets;
    },

    /* attrs: [
        { 
            name:'attr1', 
            type:'uint8_t', 
            len:'4'
        },
        { 
            name:'attr2', 
            type:'uint32_t'
        },  
      ]
    */
    marshal: function(object, attrs) {
        var buf = new Uint8Array(0),
            index,
            tmp1,
            tmp2,
            attr;
        for (var i = 0; i < attrs.length; i++) {
            attr = attrs[i];
            switch (attr.type) {
                case 'uint32_t':
                    if (attr.len > 0){
                        index = 0;
                        tmp2 = new Uint8Array(attr.len * 4);
                        for (var j = 0; j < attr.len * 4; j+=4) { // group into 4's and reverse
                            tmp1 = new Uint8Array(object[attr.name].buffer, j, 4);
                            tmp1 = new Uint8Array(tmp1);
                            Array.prototype.reverse.call(tmp1); // fix endianess
                            tmp2.set(tmp1, j);
                        }
                    } else {
                        tmp2 = new Uint8Array((new Uint32Array([object[attr.name]])).buffer, 0, 4); 
                        tmp2 = Array.prototype.reverse.call(tmp2); // fix endianness
                    }
                    tmp1 = buf;
                    buf = new Uint8Array(tmp1.length + tmp2.length);
                    buf.set(tmp1);
                    buf.set(tmp2, tmp1.length);
                    break;
                case 'uint8_t':
                    if (attr.len > 0){
                        tmp2 = object[attr.name];
                    } else {
                        tmp2 = new Uint8Array([object[attr.name]]);
                    }
                    tmp1 = buf;
                    buf = new Uint8Array(tmp1.length + tmp2.length);
                    buf.set(tmp1);
                    buf.set(tmp2, tmp1.length);
                    break;
                default:
                    console.log('Unknown type');
                    break;
            }
        }

        return buf;
    },

    unmarshal: function(bytes, attrs) { 
        var obj = {},
            index = 0,
            tmp1,
            tmp2,
            attr;
        for (var i = 0; i < attrs.length; i++) {
            attr = attrs[i];
            switch (attr.type) {
                case 'uint32_t':
                    if (attr.len > 0){
                        tmp1 = new Uint32Array(attr.len);
                        for (var j = 0; j < attr.len; j++) { // group into 4's and reverse
                            tmp2 = new Uint8Array(bytes.buffer, index, 4);
                            tmp2 = new Uint8Array(tmp2);
                            Array.prototype.reverse.call(tmp2); // fix endianess
                            tmp1.set(new Uint32Array(tmp2.buffer, 0, 1), j);
                            index += 4;
                        }
                        obj[attr.name] = tmp1;
                    } else {
                        tmp1 = new Uint32Array(1);
                        tmp2 = new Uint8Array(bytes.buffer, index, 4);
                        Array.prototype.reverse.call(tmp2); // fix endianess
                        tmp1.set(new Uint32Array(tmp2.buffer, 0, 1));
                        obj[attr.name] = tmp1[0];
                        index += 4;
                    }
                    break;
                case 'uint8_t':
                    if (attr.len > 0){
                        tmp1 = new Uint8Array(bytes.buffer, index, attr.len);
                        obj[attr.name] = new Uint8Array(tmp1);
                        index += attr.len;
                    } else {
                        tmp1 = new Uint8Array(bytes.buffer, index, 1);
                        obj[attr.name] = tmp1[0];
                        index += 1;
                    }
                    break;
            }
        }

        return obj;
    }
}