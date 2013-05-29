var Stream = require('stream');

var s = new Stream;
s.readable = true;

var curIndent = 0;

var print = function (data) {
  data = Array(curIndent+1).join('\t') + data;
  s.emit('data', data);
};

var prettyPrint = function (json) {
  process.nextTick(function() {
    printBegin();
    printDecls(json.declarations);
    printStms(json.statements);
    printEnd();
  });
  return s;
};

var printBegin = function () {
  print('begin\n\tdeclare');
};

var printDecls = function (decls) {
  ++curIndent;
  for (var i = 0; i < decls.length; i++) {
    printDecl(decls[i], i === decls.length - 1);
  };
  --curIndent;
};

var printDecl = function (decl, last) {
  var sep = last ? ';\n' : ',\n'
  print(decl.id + ' : ' + decl.type + sep);
};

var printEnd = function () {
  print('end');
};

var printStms = function (stms) {
  ++curIndent;
  for (var i = 0; i < stms.length; i++) {
    printStm(stms[i], i === stms.length - 1);
  };
  --curIndent;
};

var printStm = function (stm, last) {
  StmFuncts[stm.type](stm, last);
};

var StmFuncts = {
  'AssignmentExpression': function (stm, last) {
    var left = printExp(stm.left);
    var right = printExp(stm.right);
    var sep = last ? '\n' : ';\n'; 
    print(left + ' := ' + right + sep);
  },

  'WhileStatement': function (stm, last) {
    var con = printExp(stm.condition);
    var sep = last ? '\n' : ';\n'; 
    print('while ' + con + ' do\n');
    printStms(stm.statement);
    print('od\n', sep);
  },

  'IfStatement': function (stm, last) {
    var con = printExp(stm.condition);
    var sep = last ? '\n' : ';\n'; 
    print('if ' + con + 'then\n');
    printStms(stm.IfStatement);
    print('else\n');
    printStms(stm.ElseStatement);
    print('fi' + sep);
  }
};

var printExp = function (exp) {
  return ExpFuncts[exp.type](exp);
};

var ExpFuncts = {
  'id': function (exp) {
    return exp.value;
  },

  'natural': function (exp) {
    return exp.value;
  },

  'string': function (exp) {
    return '"' + exp.value + '"'
  },

  'BinaryExpression': function (exp) {
    var left = printExp(exp.left);
    var right = printExp(exp.right);
    return left + ' ' + exp.operator + ' ' + right;
  }
};

module.exports = prettyPrint;