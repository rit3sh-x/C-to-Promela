import { Grammar } from 'jison';

export const grammar: Grammar = {
  lex: {
    rules: [
      ['\\s+', '/* skip whitespace */'],
      ['int\\b', "return 'INT';"],
      ['if\\b', "return 'IF';"],
      ['[a-zA-Z_][a-zA-Z0-9_]*', "return 'IDENTIFIER';"],
      ['[0-9]+', "return 'NUMBER';"],
      ['==', "return 'EQ';"],
      ['>', "return 'GT';"],
      ['=', "return 'ASSIGN';"],
      ['\\{', "return 'LBRACE';"],
      ['\\}', "return 'RBRACE';"],
      ['\\(', "return 'LPAREN';"],
      ['\\)', "return 'RPAREN';"],
      [';', "return 'SEMI';"],
      ['.', "throw 'Illegal character: ' + yytext;"]
    ]
  },
  bnf: {
    program: [
      ['statements', '$$ = $1; return $$;']
    ],
    statements: [
      ['non_empty_statements', '$$ = $1;'],
      ['', '$$ = "";']
    ],
    non_empty_statements: [
      ['statement non_empty_statements', '$$ = $1 + "\\n" + ($2 || "");'],
      ['statement', '$$ = $1;']
    ],
    statement: [
      ['INT IDENTIFIER SEMI', '$$ = "int " + $2 + ";";'],
      ['IDENTIFIER ASSIGN NUMBER SEMI', '$$ = $1 + " = " + $3 + ";";'],
      ['IF LPAREN IDENTIFIER GT NUMBER RPAREN LBRACE statements RBRACE', 
       '$$ = "if :: " + $3 + " > " + $5 + " ->\\n" + $8 + "\\nfi";']
    ]
  }
};