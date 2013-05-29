var Stream = require('stream')
  , util = require('util')
  , fs = require('fs')
  , Typecheck = require('./typeCheck.js')
  , Compile = require('./compiler.js')
  , Interpret = require('./interpreter.js')
  , PrettyPrint = require('./prettyPrinter.js');

module.exports = function (args) {
  var stream = new Stream;
  stream.writeable = true;

  var pipeline = [];
  var consoleEnabled = args.log;

  var writeToFile = function (postfix, data) {
    fs.writeFile(args.output + postfix, data, function(err) {
        if(err) {
            console.log(err);
        }
    }); 
  };

  if(args.parse) {
    pipeline.push(function (json) {
      if(consoleEnabled) {
        console.log(util.inspect(json, { colors: true, depth: null }));
      }
      writeToFile('_parse.json', util.inspect(json, { depth: null }));
    });
  }

  if(args.typecheck) {
    pipeline.push(function (json) {
      var fileStream = fs.createWriteStream(args.output + '_typecheck');
      var s = Typecheck(json);
      s.pipe(fileStream);
      if(consoleEnabled) {
        s.pipe(process.stdout);
      }
    });
  }

  if(args.compile) {
    pipeline.push(function (json) {
      var fileStream = fs.createWriteStream(args.output + '_compile');
      var s = Compile(json);
      s.pipe(fileStream);
      if(consoleEnabled) {
        s.pipe(process.stdout);
      }
    })
  }

  if(args.interpret) {
    pipeline.push(function (json) {
      var vars = Interpret(json);
      if(consoleEnabled) {
        console.log(util.inspect(vars, { colors: true, depth: null }));
      }
      writeToFile('_result.json', util.inspect(vars, { depth: null }));
    });
  }

  if(args.pretty) {
    pipeline.push(function (json) {
      var fileStream = fs.createWriteStream(args.output + '_pretty.pico');
      var s = PrettyPrint(json);
      s.pipe(fileStream);
      if(consoleEnabled) {
        s.pipe(process.stdout);
      }
    });
  }

  stream.write = function (buf) {
    var json = JSON.parse(buf);
    for (var i = 0; i < pipeline.length; i++) {
      pipeline[i](json);
    };
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