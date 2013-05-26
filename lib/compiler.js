var asm = require('./asm.js')
  , Stream = require('stream');

var compileProgram = function (json) {
  var s = new Stream;
  s.readable = true;

  var curLabel = 0;

  var print = function (op, value) {
    if(!value) {
      value = '';
    } else {
      value = ' ' + value;
    }
    s.emit('data', op + value + asm.sep);
  };

  var compileDeclaration = function (decls) {
    for (var i = 0; i < decls.length; i++) {
      var curDec = decls[i];
      if(curDec.type === 'natural') {
        print(asm.dclInt, curDec.id);
      } else {
        print(asm.dclStr, curDec.id);
      }
    };
  };

  var compileStatements = function (stms) {
    for (var i = 0; i < stms.length; i++) {
      compileStatement(stms[i]);
    };
  };

  var compileStatement = function (stm) {
    switch(stm.type) {
      case 'AssignmentExpression':
        compileAssignment(stm);
        break;
      case 'WhileStatement':
        compileWhile(stm);
        break;
      case 'IfStatement':
        compileIf(stm);
        break;
    };
  };

  var compileAssignment = function (exp) {
    print(asm.lValue, exp.left.value);
    compileExpression(exp.right);
    print(asm.assignOp);
  };

  var compileWhile = function (stm) {
    var entryLabel = ++curLabel;
    var endLabel = ++curLabel;
    print(asm.label, entryLabel);
    compileExpression(stm.condition);
    print(asm.goZero, endLabel);
    compileStatements(stm.statement);
    print(asm.go, entryLabel);
    print(asm.label, endLabel);
  };

  var compileIf = function (stm) {
    var elseLabel = ++curLabel;
    var endLabel = ++curLabel;
    compileExpression(stm.condition);
    print(asm.goZero, elseLabel);
    compileStatements(stm.ifStatement);
    print(asm.go, endLabel);
    print(asm.label, elseLabel);
    compileStatements(stm.elseStatement);
    print(asm.label, endLabel);
  };

  var compileExpression = function (exp) {
    switch(exp.type) {
      case 'natural':
        print(asm.pushNat, exp.value);
        break;
      case 'string':
        print(asm.pushStr, exp.value);
        break;
      case 'id':
        print(asm.rValue, exp.value);
        break;
      case 'BinaryExpression':
        var left = compileExpression(exp.left);
        var right = compileExpression(exp.right);
        switch(exp.operator) {
          case '+':
            print(asm.addOp);
            break;
          case '-':
            print(asm.subOp);
            break;
          case '||':
            print(asm.concOp);
            break;
        }
        break;
    };
  };

  process.nextTick(function () {
    compileDeclaration(json.declarations);
    compileStatements(json.statements);
  });

  return s;
};

module.exports = compileProgram;