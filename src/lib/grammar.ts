import { Grammar } from 'jison';

export function indentStatements(statements: string): string {
  if (!statements) return '';

  return statements.split('\n')
    .map(line => line.trim() ? '  ' + line : line)
    .join('\n');
}

export const grammar: Grammar = {
  lex: {
    rules: [
      ['\\s+', '/* skip whitespace */'],
      ['//.*$', '/* skip comments */'],
      ['/*[\\s\\S]*?\\*/', '/* skip multiline comments */'],

      // Keywords
      ['int\\b', "return 'INT';"],
      ['byte\\b', "return 'BYTE';"],
      ['short\\b', "return 'SHORT';"],
      ['bit\\b', "return 'BIT';"],
      ['bool\\b', "return 'BOOL';"],
      ['if\\b', "return 'IF';"],
      ['else\\b', "return 'ELSE';"],
      ['while\\b', "return 'WHILE';"],
      ['for\\b', "return 'FOR';"],
      ['do\\b', "return 'DO';"],
      ['switch\\b', "return 'SWITCH';"],
      ['case\\b', "return 'CASE';"],
      ['default\\b', "return 'DEFAULT';"],
      ['break\\b', "return 'BREAK';"],
      ['continue\\b', "return 'CONTINUE';"],
      ['return\\b', "return 'RETURN';"],
      ['struct\\b', "return 'STRUCT';"],
      ['typedef\\b', "return 'TYPEDEF';"],
      ['void\\b', "return 'VOID';"],
      ['unsigned\\b', "return 'UNSIGNED';"],
      ['malloc\\b', "return 'MALLOC';"],
      ['free\\b', "return 'FREE';"],
      ['sizeof\\b', "return 'SIZEOF';"],

      // Identifiers and literals
      ['[a-zA-Z_][a-zA-Z0-9_]*', "return 'IDENTIFIER';"],
      ['[0-9]+', "return 'NUMBER';"],

      // Operators
      ['==', "return 'EQ';"],
      ['!=', "return 'NEQ';"],
      ['<=', "return 'LTE';"],
      ['>=', "return 'GTE';"],
      ['<', "return 'LT';"],
      ['>', "return 'GT';"],
      ['\\+\\+', "return 'INC';"],
      ['--', "return 'DEC';"],
      ['\\+', "return 'PLUS';"],
      ['-', "return 'MINUS';"],
      ['\\*', "return 'MUL';"],
      ['/', "return 'DIV';"],
      ['%', "return 'MOD';"],
      ['=', "return 'ASSIGN';"],
      ['\\+=', "return 'PLUS_ASSIGN';"],
      ['-=', "return 'MINUS_ASSIGN';"],
      ['\\*=', "return 'MUL_ASSIGN';"],
      ['/=', "return 'DIV_ASSIGN';"],
      ['%=', "return 'MOD_ASSIGN';"],
      ['&&', "return 'AND';"],
      ['\\|\\|', "return 'OR';"],
      ['!', "return 'NOT';"],
      ['\\?', "return 'QUESTION';"],
      [':', "return 'COLON';"],
      ['\\->', "return 'ARROW';"],

      // Punctuation
      ['\\{', "return 'LBRACE';"],
      ['\\}', "return 'RBRACE';"],
      ['\\(', "return 'LPAREN';"],
      ['\\)', "return 'RPAREN';"],
      ['\\[', "return 'LBRACKET';"],
      ['\\]', "return 'RBRACKET';"],
      [';', "return 'SEMI';"],
      [',', "return 'COMMA';"],
      ['\\.', "return 'DOT';"],

      // Catch illegal characters
      ['.', "throw new Error('Illegal character: ' + yytext);"]
    ]
  },

  operators: [
    ["left", "COMMA"],
    ["right", "ASSIGN", "PLUS_ASSIGN", "MINUS_ASSIGN", "MUL_ASSIGN", "DIV_ASSIGN", "MOD_ASSIGN"],
    ["right", "QUESTION", "COLON"],
    ["left", "OR"],
    ["left", "AND"],
    ["left", "EQ", "NEQ"],
    ["left", "LT", "GT", "LTE", "GTE"],
    ["left", "PLUS", "MINUS"],
    ["left", "MUL", "DIV", "MOD"],
    ["right", "UNARY_PLUS", "UNARY_MINUS", "NOT", "INC", "DEC"],
    ["left", "LBRACKET", "RBRACKET", "LPAREN", "RPAREN", "DOT", "ARROW"]
  ],

  bnf: {
    program: [
      ['code_items', '$$ = $1; return $$;']
    ],

    code_items: [
      ['code_item code_items', '$$ = $1 + "\\n" + $2;'],
      ['code_item', '$$ = $1;'],
      ['', '$$ = "";']
    ],

    code_item: [
      ['declaration', '$$ = $1;'],
      ['statement', '$$ = $1;']
    ],

    declaration: [
      ['variable_declaration', '$$ = $1;'],
      ['function_declaration', '$$ = $1;'],
      ['typedef_declaration', '$$ = $1;'],
      ['struct_declaration', '$$ = $1;']
    ],

    variable_declaration: [
      ['type_specifier variable_declarator_list SEMI', '$$ = $1 + " " + $2 + ";";']
    ],

    variable_declarator_list: [
      ['variable_declarator COMMA variable_declarator_list', '$$ = $1 + ", " + $3;'],
      ['variable_declarator', '$$ = $1;']
    ],

    variable_declarator: [
      ['IDENTIFIER', '$$ = $1;'],
      ['IDENTIFIER LBRACKET NUMBER RBRACKET', '$$ = $1 + "[" + $3 + "]";'],
      ['IDENTIFIER ASSIGN expression', '$$ = $1 + " = " + $3;']
    ],

    type_specifier: [
      ['INT', '$$ = "int";'],
      ['BYTE', '$$ = "byte";'],
      ['BIT', '$$ = "bit";'],
      ['BOOL', '$$ = "bool";'],
      ['SHORT', '$$ = "short";'],
      ['UNSIGNED INT', '$$ = "unsigned";'],
      ['VOID', '$$ = "void";'],
      ['STRUCT IDENTIFIER', '$$ = "struct " + $2;']
    ],

    struct_declaration: [
      ['STRUCT IDENTIFIER LBRACE struct_members RBRACE SEMI',
        '$$ = "typedef struct " + $2 + " {\\n" + $4 + "\\n};";']
    ],

    struct_members: [
      ['struct_member struct_members', '$$ = $1 + "\\n" + $2;'],
      ['struct_member', '$$ = $1;']
    ],

    struct_member: [
      ['type_specifier variable_declarator_list SEMI', '$$ = "  " + $1 + " " + $2 + ";";']
    ],

    typedef_declaration: [
      ['TYPEDEF struct_declaration', '$$ = $2;'],
      ['TYPEDEF type_specifier IDENTIFIER SEMI', '$$ = "typedef " + $2 + " " + $3 + ";";']
    ],

    function_declaration: [
      ['type_specifier IDENTIFIER LPAREN parameter_list RPAREN compound_statement',
        '$$ = "proctype " + $2 + "(chan in_" + $2 + "; " + $4 + ") {\\n" + $6 + "\\nend:\\n}";'],
      ['type_specifier IDENTIFIER LPAREN RPAREN compound_statement',
        '$$ = "proctype " + $2 + "(chan in_" + $2 + ") {\\n" + $5 + "\\nend:\\n}";']
    ],

    parameter_list: [
      ['parameter COMMA parameter_list', '$$ = $1 + "; " + $3;'],
      ['parameter', '$$ = $1;']
    ],

    parameter: [
      ['type_specifier IDENTIFIER', '$$ = $1 + " " + $2;']
    ],

    compound_statement: [
      ['LBRACE statements RBRACE', '$$ = $2;']
    ],

    statements: [
      ['statement statements', '$$ = $1 + "\\n" + $2;'],
      ['statement', '$$ = $1;'],
      ['', '$$ = "";']
    ],

    statement: [
      ['variable_declaration', '$$ = $1;'],
      ['expression SEMI', '$$ = $1 + ";";'],
      ['compound_statement', '$$ = $1;'],
      ['if_statement', '$$ = $1;'],
      ['for_statement', '$$ = $1;'],
      ['while_statement', '$$ = $1;'],
      ['do_while_statement', '$$ = $1;'],
      ['switch_statement', '$$ = $1;'],
      ['BREAK SEMI', '$$ = "break;";'],
      ['CONTINUE SEMI', '$$ = "// Continue handled in loop";'],
      ['return_statement', '$$ = $1;'],
      ['SEMI', '$$ = ";";']
    ],

    return_statement: [
      ['RETURN expression SEMI', '$$ = "in_" + (yy.currentFunction || "main") + " ! " + $2 + ";\\ngoto end;";'],
      ['RETURN SEMI', '$$ = "in_" + (yy.currentFunction || "main") + " ! 0;\\ngoto end;";']
    ],

    if_statement: [
      ['IF LPAREN expression RPAREN statement',
        '$$ = "if\\n:: (" + $3 + ") ->\\n" + yy.indentStatements($5) + "\\n:: else -> skip\\nfi";'],
      ['IF LPAREN expression RPAREN statement ELSE statement',
        '$$ = "if\\n:: (" + $3 + ") ->\\n" + yy.indentStatements($5) + "\\n:: else ->\\n" + yy.indentStatements($7) + "\\nfi";']
    ],

    for_statement: [
      ['FOR LPAREN expression_opt SEMI expression_opt SEMI expression_opt RPAREN statement',
        '$$ = ($3 ? $3 + ";\\n" : "") + "do\\n:: !(" + ($5 || "1") + ") -> break\\n:: else ->\\n" + yy.indentStatements($9) + "\\n" + ($7 ? "  " + $7 + ";" : "") + "\\nod";']
    ],

    while_statement: [
      ['WHILE LPAREN expression RPAREN statement',
        '$$ = "do\\n:: !(" + $3 + ") -> break\\n:: else ->\\n" + yy.indentStatements($5) + "\\nod";'],
      ['WHILE LPAREN NUMBER RPAREN statement',
        '$$ = "do\\n:: 0 -> break // Never break for while(1)\\n:: else ->\\n" + yy.indentStatements($5) + "\\nod";']
    ],

    do_while_statement: [
      ['DO statement WHILE LPAREN expression RPAREN SEMI',
        '$$ = "do\\n:: (" + $5 + ") == 0 -> break\\n:: else ->\\n" + yy.indentStatements($2) + "\\nod";']
    ],

    switch_statement: [
      ['SWITCH LPAREN expression RPAREN LBRACE case_list RBRACE',
        'yy.switchExpr = $3; $$ = "if\\n" + $6 + "\\n:: else -> skip\\nfi";']
    ],

    case_list: [
      ['case_statement case_list', '$$ = $1 + "\\n" + $2;'],
      ['case_statement', '$$ = $1;'],
      ['DEFAULT COLON statements', '$$ = ":: else ->\\n" + yy.indentStatements($3);']
    ],

    case_statement: [
      ['CASE expression COLON statements', '$$ = ":: (" + yy.switchExpr + " == " + $2 + ") ->\\n" + yy.indentStatements($4);']
    ],

    expression_opt: [
      ['expression', '$$ = $1;'],
      ['', '$$ = null;']
    ],

    expression: [
      ['assignment_expression', '$$ = $1;']
    ],

    assignment_expression: [
      ['conditional_expression', '$$ = $1;'],
      ['unary_expression assignment_operator assignment_expression', '$$ = $1 + " " + $2 + " " + $3;']
    ],

    assignment_operator: [
      ['ASSIGN', '$$ = "=";'],
      ['PLUS_ASSIGN', '$$ = "+=";'],
      ['MINUS_ASSIGN', '$$ = "-=";'],
      ['MUL_ASSIGN', '$$ = "*=";'],
      ['DIV_ASSIGN', '$$ = "/=";'],
      ['MOD_ASSIGN', '$$ = "%=";']
    ],

    conditional_expression: [
      ['logical_or_expression', '$$ = $1;'],
      ['logical_or_expression QUESTION expression COLON conditional_expression',
        '$$ = $1 + " ? " + $3 + " : " + $5;']
    ],

    logical_or_expression: [
      ['logical_and_expression', '$$ = $1;'],
      ['logical_or_expression OR logical_and_expression', '$$ = $1 + " || " + $3;']
    ],

    logical_and_expression: [
      ['equality_expression', '$$ = $1;'],
      ['logical_and_expression AND equality_expression', '$$ = $1 + " && " + $3;']
    ],

    equality_expression: [
      ['relational_expression', '$$ = $1;'],
      ['equality_expression EQ relational_expression', '$$ = $1 + " == " + $3;'],
      ['equality_expression NEQ relational_expression', '$$ = $1 + " != " + $3;']
    ],

    relational_expression: [
      ['additive_expression', '$$ = $1;'],
      ['relational_expression LT additive_expression', '$$ = $1 + " < " + $3;'],
      ['relational_expression GT additive_expression', '$$ = $1 + " > " + $3;'],
      ['relational_expression LTE additive_expression', '$$ = $1 + " <= " + $3;'],
      ['relational_expression GTE additive_expression', '$$ = $1 + " >= " + $3;']
    ],

    additive_expression: [
      ['multiplicative_expression', '$$ = $1;'],
      ['additive_expression PLUS multiplicative_expression', '$$ = $1 + " + " + $3;'],
      ['additive_expression MINUS multiplicative_expression', '$$ = $1 + " - " + $3;']
    ],

    multiplicative_expression: [
      ['unary_expression', '$$ = $1;'],
      ['multiplicative_expression MUL unary_expression', '$$ = $1 + " * " + $3;'],
      ['multiplicative_expression DIV unary_expression', '$$ = $1 + " / " + $3;'],
      ['multiplicative_expression MOD unary_expression', '$$ = $1 + " % " + $3;']
    ],

    unary_expression: [
      ['postfix_expression', '$$ = $1;'],
      ['INC unary_expression', '$$ = "++" + $2;'],
      ['DEC unary_expression', '$$ = "--" + $2;'],
      ['PLUS unary_expression', '$$ = "+" + $2;', {prec: 'UNARY_PLUS'}],
      ['MINUS unary_expression', '$$ = "-" + $2;', {prec: 'UNARY_MINUS'}],
      ['NOT unary_expression', '$$ = "!" + $2;'],
      ['MUL unary_expression', '$$ = "// Dereference: " + $2;'],
      ['SIZEOF LPAREN type_specifier RPAREN', '$$ = "sizeof(" + $3 + ")";'],
      ['MALLOC LPAREN expression RPAREN', '$$ = "/* Malloc simulation */"']
    ],

    postfix_expression: [
      ['primary_expression', '$$ = $1;'],
      ['postfix_expression LBRACKET expression RBRACKET', '$$ = $1 + "[" + $3 + "]";'],
      ['postfix_expression DOT IDENTIFIER', '$$ = $1 + "." + $3;'],
      ['postfix_expression ARROW IDENTIFIER', '$$ = $1 + " // Arrow replaced with : " + $3;'],
      ['postfix_expression LPAREN argument_list RPAREN',
        '$$ = "// Function call: " + $1 + "(" + $3 + ")";'],
      ['postfix_expression LPAREN RPAREN',
        '$$ = "// Function call: " + $1 + "()";'],
      ['postfix_expression INC', '$$ = $1 + "++";'],
      ['postfix_expression DEC', '$$ = $1 + "--";']
    ],

    argument_list: [
      ['expression COMMA argument_list', '$$ = $1 + ", " + $3;'],
      ['expression', '$$ = $1;']
    ],

    primary_expression: [
      ['IDENTIFIER', '$$ = $1;'],
      ['NUMBER', '$$ = $1;'],
      ['LPAREN expression RPAREN', '$$ = "(" + $2 + ")";']
    ]
  }
};