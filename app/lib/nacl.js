var nacl = nacl_factory.instantiate();

nacl.base32strToBytes = function(string) {
    return nacl.encode_latin1(base32.decode(string));
}

export default nacl;