"use strict";
var EventEmitter = require('events').EventEmitter
  , color = require('bash-color');


var decVars = {};
var errorEmitter = new EventEmitter();

errorEmitter.on('doubleDeclare', function (firstOccurence, errorOccurence) {
  var msg = color.red('Error') + ' at line ' + errorOccurence.line + ' column ' + errorOccurence.column + ': ';
  msg += 'Variable `' + color.blue(firstOccurence.id) + '´ (type: ' + firstOccurence.type + ') already defined at line: ';
  msg += firstOccurence.line + ' column: ' + firstOccurence.column + ' (type: ' + errorOccurence.type + ')!';
  console.log(msg);
});

var checkDeclarations = function (decls) {
  for (var i = 0; i < decls.length; i++) {
    var curDec = decls[i];
    if ( !decVars[curDec.id] ) {
      decVars[curDec.id] = curDec;
    } else {
      // Error
      var firstOccur = decVars[curDec.id];
      errorEmitter.emit('doubleDeclare', firstOccur, curDec);
    };
  };
};

// Expressions

var checkAssignment = function (expression) {
  
};

// Statements

var checkStatement = function (statement) {
  switch(statement.type) {
    case 'AssignmentExpression':
      checkAssignment(statement);
      break;
  };
};

var checkStatements = function (statements) {
  for (var i = 0; i < statements.length; i++) {
    process.nextTick(checkStatement(statement));
  };
};

var checkProgram = function (programJson) {
  checkDeclarations(programJson.declarations);
};

exports = module.exports = checkProgram;