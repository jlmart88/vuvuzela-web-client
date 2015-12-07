import onionbox from './onionbox';

export default {
    sizeIntro: 36,
    sizeEncryptedIntro: 84, // 48 (onionbox.overhead) + 36 (sizeIntro)
    sizeMessage: 240,
    sizeMessageBody: 293, // 240 (sizeMessage) - 1 (flag for message/timestamp)
    sizeEncryptedMessage: 256, // 16 (box.overhead) + 240 (sizeMessage)

    forwardNonce: function(round) {
        var nonce = new Uint8Array(24),
            roundBuf = new Uint8Array(new Uint32Array([round]).buffer);
        roundBuf.reverse(); // fix endianness
        nonce.set(roundBuf);
        nonce[4] = 0;
        return nonce;
    },

    backwardNonce: function(round) {
        var nonce = this.forwardNonce(round);
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
                    console.err('Unknown type');
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
                default:
                    console.err('Unknown type');
                    break;
            }
        }

        return obj;
    },

    varintEncode: function(num) {
        var buf = new Uint8Array(10),
            numCpy = Math.abs(Math.floor(num)),
            var64 = new Uint8Array(8),
            index = 0,
            tmp1,
            tmp2;

        //console.log('numCpy: '+numCpy);

        // copy into uint64 array
        for (var i = 0; i < 8; i++){
            if (num < 1) {
                var64[i] = ~(numCpy & 255);
                if (i == 0) {
                    var64[i] = var64[i] + 1;
                }
            } else {
                var64[i] = numCpy & 255;
            }
            numCpy = numCpy/256;
        }

        //console.log('var64: '+JSON.stringify(var64));

        // shift left 1
        tmp1 = 0;
        for (var i = 0; i < 8; i++){
            tmp2 = (var64[i] >> 7) & 1;
            var64[i] = (var64[i] << 1) + tmp1;
            tmp1 = tmp2; 
        }

        //console.log('var64 shifted left 1: '+JSON.stringify(var64));

        // invert if negative
        if (num < 1) {
            for (var i = 0; i < 8; i++){
                var64[i] = ~var64[i];
            }
        }

        // encode
        tmp1 = 0;
        for (var i = 0; i < 8; i++){
            tmp2 = ((var64[i] << i) & 127) + tmp1;
            tmp1 = (var64[i] >>> 7-i) & 255;

            if (i < 7) {
                if (var64[i+1] != 0 || tmp1 != 0) {
                    tmp2 = tmp2 | 128;
                }
            }
            buf.set(new Uint8Array([tmp2]), i);
        }

        return buf;
    },

    varintDecode: function(arr) {
        var num = 0,
            arrStr = "",
            numStr = "",
            var64 = new Uint8Array(8),
            tmp1,
            tmp2;

        for (var i = 0; i < arr.length; i++) {
            arrStr = (arr[i] & 127).toString(2);
            while (arrStr.length < 7) {
                arrStr = "0" + arrStr
            }
            if (arr[i] < 128) {
                if (i > 9 || i == 9 && arr[i] > 1) {
                    throw "Varint Decode Overflow error"
                }
                numStr =  arrStr + numStr;
                break;
            }
            numStr = arrStr + numStr;
        }

        while (numStr.length % 8 != 0){
            numStr = "0" + numStr;
        } 

        //console.log('numStr: '+numStr);

        // copy into uint64 array
        for (var i = 0; i < 8; i++){
            if (numStr > 0) {
                var64[i] = parseInt(numStr.slice(numStr.length - 8, numStr.length), 2);
                numStr = numStr.slice(0, numStr.length-8);
            } else {
                var64[i] = 0;
            }
        }

        //console.log('var64: '+JSON.stringify(var64));

        // shift right 1
        tmp1 = 0;
        for (var i = 7; i >= 0; i--){
            tmp2 = (var64[i] & 1) << 7;
            var64[i] = (var64[i] >>> 1) + tmp1;
            tmp1 = tmp2; 
        }

        //console.log('var64 shift right: '+JSON.stringify(var64));

        // invert if negative
        if (tmp1 > 0) {
            for (var i = 0; i < 8; i++){
                var64[i] = ~var64[i];
            }
            //console.log('var64 inverted: '+JSON.stringify(var64));
            // twos complement to return value
            for (var i = 0; i < 8; i++){
                var64[i] = ~var64[i];
                if (i == 0) {
                    var64[0] = var64[0] + 1
                }
            }
        }



        num = 0;
        // copy out of uint64 array
        for (var i = 0; i < 8; i++){
            num = num | var64[i] << (i * 8);
        }
        if (tmp1 > 0) {
            return -num;
        } else {
            return num;
        }
    }
}