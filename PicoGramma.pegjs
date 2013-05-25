start
	= Program

Program
	= BeginToken __ decls:Declarations __ statements:Statements? __ EndToken __ EOF {
		var state = statements === "" ? [] : statements;
		return {
			declarations: decls,
			statements: state
		};
	}

Declarations "declarations"
	= DeclareToken __ head:Declaration tail:("," __ Declaration)* ";" {
		var result = [head];
		for (var i = 0; i < tail.length; i++) {
			result.push(tail[i][2]);
		};
		return result;
	}

Declaration
	= id:Id _ DeclarationOperator _ type:Type _ {
		return {
			id: id,
			type: type,
			line: line,
			column: column
		}
	}

Statements "statements"
	= __ head:Statement tail:(";" __ Statement)* {
		var result = [head];
		for (var i = 0; i < tail.length; i++) {
			result.push(tail[i][2]);
		};
		return result;
	}

Statement
	= AssignmentExpression
	/ IfStatement
	/ WhileStatement

IfStatement
	= __ IfToken __ condition:Expression __ ThenToken ifStatement:Statements __ ElseToken __ elseStatement:Statements? __ FiToken __ {
		return {
			type: "IfStatement",
			condition: condition,
			ifStatement: ifStatement,
			elseStatement: elseStatement,
			line: line,
			column: column
		}
	}

WhileStatement
	= __ WhileToken __ condition:Expression __ DoToken statement:Statements __ OdToken __ {
		return {
			type: "WhileStatement",
			condition: condition,
			statement: statement,
			line: line,
			column: column
		}
	}

AssignmentExpression
	= left:Id __ AssignmentOperator __ right:Expression {
		return {
			type: "AssignmentExpression",
			left: left,
			right: right,
			line: line,
			column: column
		}
	}

Expression
	= BracketExpression
	/ BinaryExpression

BracketExpression
	= "(" __ expression:Expression __ ")" { return expression; }

BinaryExpression
	= head:Atom
	  tail:(__ BinaryOperator __ Expression)* {
	  	var result = head;
	  	for (var i = 0; i < tail.length; i++) {
	  		result = {
	  			type: "BinaryExpression",
	  			operator: tail[i][1],
	  			left: result,
	  			right: tail[i][3],
				line: line,
				column: column
	  		};
	  	};
	  	return result;
	  }

/* Atoms */
Atom
	= Id
	/ Natural
	/ String

Id "identifier"
	= !ReservedWord name:IdName { return name; }

IdName "identifier"
	= start:IdStart parts:IdPart* {
		return start + parts.join("");
	}

IdStart
	= [a-z]

IdPart
	= [a-z0-9]

Natural
	= digits:[0-9]+ { return parseInt(digits.join(""), 10); }

String "string"
	= '"' chars:StringCharacters? '"' { return chars; }

StringCharacters
	= chars:StringCharacter+ { return chars.join(""); }

StringCharacter
	= !('"' / LineTerminator) char_:SourceCharacter { return char_; }

/* Tokens */
BeginToken		= "begin"
EndToken		= "end"
DeclareToken 	= "declare"
IfToken 		= "if"
ThenToken 		= "then"
ElseToken		= "else"
FiToken			= "fi"
WhileToken		= "while"
DoToken			= "do"
OdToken 		= "od"
NaturalToken	= "natural"
StringToken		= "string"

/* Operators */
AssignmentOperator 	= ":="
DeclarationOperator = ":"
BinaryOperator
	= "+"
	/ "-"
	/ "||"

Type
	= NaturalToken
	/ StringToken


/* Helper Stuff */
SourceCharacter
	= .

WhiteSpace "whitespace"
	= [\t\v\f \u00A0\uFEFF]

LineTerminator
	= [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
	= "\n"
	/ "\r\n"
	/ "\r"
	/ "\u2028"
	/ "\u2029"

Comment "comment"
	= MultiLineComment
	/ SingleLineComment

MultiLineComment
	= "%" (!"%" SourceCharacter)+ "%"

MultiLineCommentNoLineTerminator
	= "%" (!("%" / LineTerminator) SourceCharacter)* "%"

SingleLineComment
	= "%%" (!LineTerminator SourceCharacter)*

/* Whitespace */
_
  = (WhiteSpace / MultiLineCommentNoLineTerminator / SingleLineComment)*

__
  = (WhiteSpace / LineTerminatorSequence / Comment)*

EOF
	= !.

ReservedWord
	= "begin"
	/ "end"
	/ "declare"
	/ "if"
	/ "then"
	/ "else"
	/ "fi"
	/ "while"
	/ "do"
	/ "od"
	/ "string"
	/ "natural"