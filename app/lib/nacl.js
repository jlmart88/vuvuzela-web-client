/* globals nacl_factory */
/* globals base32 */

var nacl = nacl_factory.instantiate();

nacl.base32strToBytes = function(string) {
    return nacl.encode_latin1(base32.decode(string));
};

nacl.bytesToBase32str = function(bytes) {
    return base32.encode(nacl.decode_latin1(bytes));
};

export default nacl;