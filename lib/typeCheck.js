var Stream = require('stream');

var checkProgram = function (programJSON) {
  var s = new Stream;
  s.readable = true;

  var variables = {};

  var emitError = function (data) {
    s.emit('data', 'Error: ' + data);
  };

  var checkDeclarations = function (decls) {
    for (var i = 0; i < decls.length; i++) {
      var curDec = decls[i];
      if ( !variables[curDec.id] ) {
        variables[curDec.id] = curDec;
      } else {
        // Error
        var firstOccur = variables[curDec.id];
        var msg = 'Double Declaration of variable `' + curDec.id + '´ (type: ' + curDec.type + ') at line ' + curDec.line + '!'
        msg += ' First occurnce at line ' + firstOccur.line + ' of type ' + firstOccur.type + '.\n';
        emitError(msg);
      };
    };
  };

  var checkStatements = function (statements) {
    for (var i = 0; i < statements.length; i++) {
      process.nextTick((function (step) {
        return function () {
          checkStatement(statements[step]);
        }
      })(i));
    }
  };

  var checkStatement = function (statement) {
    switch(statement.type) {
      case 'AssignmentExpression':
        checkAssignment(statement);
        break;
      case 'WhileStatement':
        checkWhile(statement);
        break;
      case 'IfStatement':
        checkIf(statement);
        break;
    };
  };

  var checkAssignment = function (exp) {
    // Check if variable is defined
    if(!variables[exp.left.value]) {
      emitError('Undefined Variable `' + exp.left.value + '´ at line ' + exp.line + '!\n');
      return;
    }

    checkExpression(exp);
  };

  var checkWhile = function (statement) {
    checkExpression(statement.condition);
    checkStatements(statement.statement);
  };

  var checkIf = function (statement) {
    checkExpression(statement.condition);
    checkStatements(statement.ifStatement);
    checkStatements(statement.elseStatement);
  };

  var checkExpression = function (exp) {
    switch(exp.type) {
      case 'natural':
      case 'string':
        return exp;
        break;
      case 'id':
        var t = exp;
        t.type = variables[exp.value].type;
        return t;
      case 'AssignmentExpression':
      case 'BinaryExpression':
        var left = checkExpression(exp.left);
        var right = checkExpression(exp.right);
        if(left !== -1 && right !== -1) {
          if(left.type !== right.type) {
            emitError('Wrong type at line ' + left.line + '! Expected ' + left.type + ' but got ' + right.type + '!\n' );
            return -1;
          }
          return left;
        } else {
          return -1;
        }
        break;
    };
  };

  process.nextTick(function () {
    checkDeclarations(programJSON.declarations);
    checkStatements(programJSON.statements);
  });

  return s;
};

module.exports = checkProgram;