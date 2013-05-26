var parser = require('./PicoParser')
  , Transform = require('stream').Transform;

var backup = function () {
  var stream = new Stream;
  stream.writeable = true;
  stream.readable = true;

  var text = "";

  stream.write = function (buf) {
    text += buf;
    var picoJson = parser.parse(text);

    this.emit('data', JSON.stringify(picoJson));
    console.log("Emmit");
  };

  stream.end = function (buf) {
    if(arguments.length) stream.write(buf);
    
    stream.writeable = false;
  };

  stream.destroy = function () {
    stream.writeable = false;
  };

  return stream;
};

module.exports = function () {
  var trans = new Transform({decodeStrings: true});

  trans._transform = function (chunk, encoding, callback) {
    var picoJson = parser.parse(chunk.toString());
    callback(null, JSON.stringify(picoJson));
  };

  return trans;
};