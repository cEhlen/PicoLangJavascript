var vars = {};
var stack = [];

var interpret = function (json) {
  registerVars(json.declarations);
  execStms(json.statements);
  return vars;
};

var registerVars = function (decls) {
  for (var i = 0; i < decls.length; i++) {
    registerVar(decls[i]);
  };
};

var registerVar = function (decl) {
  vars[decl.id] = decl.type === 'natural' ? 0 : '';
};

var execStms = function (stms) {
  for (var i = 0; i < stms.length; i++) {
    var curStm = stms[i];
    StmFuncts[curStm.type](curStm);
  };
};

var StmFuncts = {
  'AssignmentExpression': function (assi) {
    vars[assi.left.value] = execExp(assi.right);
  },

  'WhileStatement': function (stm) {
    while(true) {
      var con = execExp(stm.condition);
      if(con !== 0) {
        execStms(stm.statement);
      } else {
        break;
      }
    }
  },

  'IfStatement': function (stm) {
    var con = execExp(stm.condition);
    if(con !== 0) {
      execStms(stm.IfStatement);
    } else {
      execStms(stm.ElseStatement);
    }
  }
};

var execExp = function (exp) {
  return ExpFuncts[exp.type](exp);
};

var ExpFuncts = {
  'id': function (exp) {
    return vars[exp.value];
  },

  'string': function (exp) {
    return exp.value;
  },

  'natural': function (exp) {
    return exp.value
  },

  'BinaryExpression': function (exp) {
    var left = execExp(exp.left);
    var right = execExp(exp.right);
    return OperatorFuncts[exp.operator](left, right);
  }
};

var OperatorFuncts = {
  '+': function (left, right) {
    if(typeof left === 'number' && typeof right === 'number') {
      return left + right;
    } else {
      return 0;
    }
  },

  '-': function (left, right) {
    if(typeof left === 'number' && typeof right === 'number') {
      return left - right;
    } else {
      return 0;
    }
  },

  '||': function (left, right) {
    if(typeof left === 'string' && typeof right === 'string') {
      return left + right;
    } else {
      return 0;
    }
  }
};

module.exports = interpret;