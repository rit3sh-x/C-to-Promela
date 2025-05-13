import { Grammar } from 'jison';

export function indentStatements(statements: string): string {
  if (!statements) return '';
  return statements.split('\n')
    .map(line => line.trim() ? '  ' + line : line)
    .join('\n');
}

export const defaultTypes = {
  'int': true, 'byte': true, 'short': true, 'bit': true, 'bool': true, 'unsigned': true, 'void': true
};

export const grammar: Grammar = {
  moduleInclude: `
        function indentStatements(statements) {
            if (!statements) return '';
            return statements.split('\\n')
                .map(line => line.trim() ? '    ' + line : line)
                .join('\\n');
        }
    `,
  lex: {
    rules: [
      ['//[^\n]*', '/* skip single-line comment */'],
      ['/\\*([^*]|\\*+[^*/])*\\*+/', '/* skip multi-line comment */'],
      ['/\\*.*?\\*/', '/* skip compact multi-line comment */'],
      ['/\\*\\*([^*]|\\*+[^*/])*\\*+/', '/* skip doc comment */'],
      ['/\\*\\*/', '/* skip empty comment */'],
      ['//\\n', '/* skip empty single-line comment */'],
      ['\\s+', '/* skip whitespace */'],
      ['int\\b', "return 'INT';"],
      ['byte\\b', "return 'BYTE';"],
      ['short\\b', "return 'SHORT';"],
      ['bit\\b', "return 'BIT';"],
      ['bool\\b', "return 'BOOL';"],
      ['unsigned\\b', "return 'UNSIGNED';"],
      ['void\\b', "return 'VOID';"],
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
      ['goto\\b', "return 'GOTO';"],
      ['printf\\b', "return 'PRINTF';"],
      ['true\\b', "return 'TRUE';"],
      ['false\\b', "return 'FALSE';"],
      ['NULL\\b', "return '0';"],
      ['[a-zA-Z_][a-zA-Z0-9_]*', `
                if (yy.userDefinedTypes && yy.userDefinedTypes[yytext]) {
                    return 'TYPE_NAME';
                } else {
                    return 'IDENTIFIER';
                }
            `],
      ['[0-9]+', "return 'NUMBER';"],
      ['"[^"]*"', "return 'STRING';"],
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
      ['&&', "return 'AND';"],
      ['\\|\\|', "return 'OR';"],
      ['!', "return 'NOT';"],
      ['&', "return 'BITWISE_AND';"],
      ['\\|', "return 'BITWISE_OR';"],
      ['\\^', "return 'BITWISE_XOR';"],
      ['~', "return 'BITWISE_NOT';"],
      ['<<', "return 'SHIFT_LEFT';"],
      ['>>', "return 'SHIFT_RIGHT';"],
      ['\\?', "return 'QUESTION';"],
      [':', "return 'COLON';"],
      ['\\{', "return 'LBRACE';"],
      ['\\}', "return 'RBRACE';"],
      ['\\(', "return 'LPAREN';"],
      ['\\)', "return 'RPAREN';"],
      ['\\[', "return 'LBRACKET';"],
      ['\\]', "return 'RBRACKET';"],
      [';', "return 'SEMI';"],
      [',', "return 'COMMA';"],
      ['\\.', "return 'DOT';"],
      ['.', "throw new Error('Illegal character: ' + yytext);"]
    ]
  },

  operators: [
    ["nonassoc", "IF"],
    ["nonassoc", "ELSE"],
    ["left", "COMMA"],
    ["right", "ASSIGN"],
    ["right", "QUESTION", "COLON"],
    ["left", "OR"],
    ["left", "AND"],
    ["left", "BITWISE_OR"],
    ["left", "BITWISE_XOR"],
    ["left", "BITWISE_AND"],
    ["left", "EQ", "NEQ"],
    ["left", "LT", "GT", "LTE", "GTE"],
    ["left", "SHIFT_LEFT", "SHIFT_RIGHT"],
    ["left", "PLUS", "MINUS"],
    ["left", "MUL", "DIV", "MOD"],
    ["right", "NOT", "BITWISE_NOT", "INC", "DEC"],
    ["left", "LPAREN", "RPAREN", "LBRACKET", "RBRACKET", "DOT"]
  ],

  start: "program",

  bnf: {
    program: [
      ['top_level_items', 'return $1.promela;']
    ],

    top_level_items: [
      ['top_level_item top_level_items',
        '$$ = { type: "normal", promela: $1.promela + "\\n\\n" + $2.promela };'
      ],
      ['top_level_item', '$$ = $1;'],
    ],

    top_level_item: [
      ['declaration', '$$ = $1;'],
      ['function_definition', '$$ = $1;']
    ],

    declaration: [
      ['type_specifier init_declarator_list SEMI', '$$ = { type: "normal", promela: $1 + " " + $2 + ";" };'],
      ['type_specifier SEMI', '$$ = { type: "normal", promela: $1 + ";" };'],
      ['struct_declaration', '$$ = $1;'],
      ['typedef_declaration', '$$ = $1;']
    ],

    type_specifier: [
      ['INT', '$$ = "int";'],
      ['BYTE', '$$ = "byte";'],
      ['SHORT', '$$ = "short";'],
      ['BIT', '$$ = "bit";'],
      ['BOOL', '$$ = "bool";'],
      ['UNSIGNED INT', '$$ = "unsigned int";'],
      ['UNSIGNED', '$$ = "unsigned";'],
      ['VOID', '$$ = "void";'],
      ['TYPE_NAME', '$$ = $1;']
    ],

    struct_tag_definition: [
      ['STRUCT IDENTIFIER',
        `yy.userDefinedTypes = yy.userDefinedTypes || {}; yy.userDefinedTypes[$2] = true;
                 $$ = $2;`
      ]
    ],

    struct_declaration: [
      ['struct_tag_definition LBRACE struct_member_list RBRACE SEMI',
        `var structName = $1;
                 $$ = { type: "normal", promela: "typedef " + structName + " {\\n" + yy.indentStatements($3.promela) + "\\n};" };`
      ],
      ['STRUCT LBRACE struct_member_list RBRACE SEMI',
        `var anonymous = "_anon_struct_" + (yy.anonStructCount = (yy.anonStructCount || 0) + 1);
                 yy.userDefinedTypes = yy.userDefinedTypes || {}; yy.userDefinedTypes[anonymous] = true;
                 $$ = { type: "normal", promela: "typedef " + anonymous + " {\\n" + yy.indentStatements($3.promela) + "\\n};" };`
      ]
    ],

    struct_member_list: [
      ['type_specifier IDENTIFIER SEMI struct_member_list', '$$ = { type: "normal", promela: $1 + " " + $2 + ";\\n" + $4.promela };'],
      ['type_specifier IDENTIFIER SEMI', '$$ = { type: "normal", promela: $1 + " " + $2 + ";" };']
    ],

    typedef_declaration: [
      ['TYPEDEF struct_declaration', '$$ = $2;'],
      ['TYPEDEF type_specifier IDENTIFIER SEMI',
        `yy.userDefinedTypes = yy.userDefinedTypes || {}; yy.userDefinedTypes[$3] = true;
                 $$ = { type: "normal", promela: "typedef " + $2 + " " + $3 + ";" };`
      ]
    ],

    init_declarator_list: [
      ['init_declarator', '$$ = $1;'],
      ['init_declarator COMMA init_declarator_list', '$$ = $1 + ", " + $3;']
    ],

    init_declarator: [
      ['IDENTIFIER', '$$ = $1;'],
      ['IDENTIFIER LBRACKET expression RBRACKET', '$$ = $1 + "[" + $3 + "]";'],
      ['IDENTIFIER ASSIGN assignment_expression', '$$ = $1 + " = " + $3;']
    ],

    function_definition: [
      ['type_specifier IDENTIFIER LPAREN parameter_list_opt RPAREN compound_statement',
        `var funcName = $2;
                 yy.currentFunction = funcName;
                 var paramList = $4 || "";
                 $$ = { type: "normal", promela: "proctype " + funcName + "(" + paramList + ") {\\n" + yy.indentStatements($6.promela) + "\\n}" };`
      ]
    ],

    parameter_list_opt: [
      ['parameter_list', '$$ = $1;'],
      ['', '$$ = "";']
    ],

    parameter_list: [
      ['parameter_declaration', '$$ = $1;'],
      ['parameter_declaration COMMA parameter_list', '$$ = $1 + ", " + $3;']
    ],

    parameter_declaration: [
      ['type_specifier IDENTIFIER', '$$ = $1 + " " + $2;'],
      ['type_specifier', '$$ = $1;']
    ],

    compound_statement: [
      ['LBRACE block_item_list RBRACE', '$$ = $2;'],
      ['LBRACE RBRACE', '$$ = { type: "normal", promela: "skip;" };']
    ],

    block_item_list: [
      ['block_item block_item_list',
        `var first = $1;
                 var rest = $2;

                 if (first.type === "if_leading_to_continue") { var combinedPromela = "if\\n:: (" + first.condition + ") -> \\n"
                     + yy.indentStatements(first.thenPromela) +
                     "\\n:: else ->\\n" + yy.indentStatements(rest.promela) +
                     "\\nfi;";
                     $$ = { type: "normal", promela: combinedPromela };
                 } else if (first.type === "continue") {
                     $$ = { type: "normal", promela: first.promela };
                 } else {
                     var combinedPromela = first.promela;
                     if (rest.promela && rest.promela.trim() !== "" && rest.promela.trim() !== "skip;") {
                         combinedPromela += "\\n" + rest.promela;
                     }
                     $$ = { type: "normal", promela: combinedPromela };
                 }`
      ],
      ['block_item', '$$ = $1;']
    ],

    block_item: [
      ['statement', '$$ = $1;'],
      ['declaration', '$$ = $1;']
    ],

    statement: [
      ['compound_statement', '$$ = $1;'],
      ['expression_statement', '$$ = $1;'],
      ['selection_statement', '$$ = $1;'],
      ['iteration_statement', '$$ = $1;'],
      ['jump_statement', '$$ = $1;'],
      ['printf_statement', '$$ = $1;'],
      ['IDENTIFIER COLON statement',
        '$$ = { type: "normal", promela: $1 + ":\\n" + yy.indentStatements($3.promela) };'
      ]
    ],

    printf_statement: [
      ['PRINTF LPAREN argument_list_opt RPAREN SEMI',
        '$$ = { type: "normal", promela: "printf(" + ($3 || "") + ");" };'
      ]
    ],

    expression_statement: [
      ['expression SEMI', '$$ = { type: "normal", promela: $1 + ";" };'],
      ['SEMI', '$$ = { type: "normal", promela: "skip;" };']
    ],

    selection_statement: [
      ['IF LPAREN expression RPAREN statement ELSE statement',
        `var condition = $3;
                 var thenBranch = $5;
                 var elseBranch = $7;

                 $$ = { type: "normal", promela:
                     "if\\n:: (" + condition + ") ->\\n" + yy.indentStatements(thenBranch.promela) +
                     "\\n:: else ->\\n" + yy.indentStatements(elseBranch.promela) + "\\nfi;" };`
      ],
      ['IF LPAREN expression RPAREN statement',
        `var condition = $3;
                 var thenStmtObj = $5;

                 if (thenStmtObj.type === "continue") {
                     $$ = { type: "if_leading_to_continue", condition: condition, thenPromela: thenStmtObj.promela };
                 } else if (thenStmtObj.type === "if_leading_to_continue") {
                     $$ = { type: "normal", promela: "if\\n:: (" + condition + ") ->\\n" + yy.indentStatements(thenStmtObj.promela) +
                     "\\n:: else -> skip;\\nfi;" };
                 } else {
                     $$ = { type: "normal", promela: "if\\n:: (" + condition + ") ->\\n" + yy.indentStatements(thenStmtObj.promela) +
                     "\\n:: else -> skip;\\nfi;" };
                 }`
      ],
      ['SWITCH LPAREN expression RPAREN LBRACE case_statements RBRACE',
        `var switchExpr = $3;
                 var cases = $6.cases;
                 var promelaCases = "";
                 var hasDefault = false;

                 cases.forEach(caseItem => {
                     if (caseItem.type === 'case') {
                         promelaCases += ":: (" + switchExpr + " == " + caseItem.value + ") ->\\n" + yy.indentStatements(caseItem.promela) + "\\n";
                     } else if (caseItem.type === 'default') {
                         promelaCases += ":: else ->\\n" + yy.indentStatements(caseItem.promela) + "\\n";
                         hasDefault = true;
                     }
                 });
                 if (!hasDefault) {
                     promelaCases += ":: else -> skip;\\n";
                 }
                 $$ = { type: "normal", promela: "if\\n" + promelaCases + "fi;" };`
      ]
    ],

    case_statements: [
      ['case_list', '$$ = { type: "case_list", cases: $1.cases };']
    ],

    case_list: [
      ['case_item case_list',
        `var first = $1;
                 var rest = $2;
                 $$ = { type: "case_list", cases: [first].concat(rest.cases) };`
      ],
      ['case_item', '$$ = { type: "case_list", cases: [$1] };']
    ],

    case_item: [
      ['CASE NUMBER COLON statement_list',
        `var stListObj = $4;
                 $$ = { type: "case", value: $2, promela: stListObj.promela };`
      ],
      ['DEFAULT COLON statement_list',
        `var stListObj = $3;
                 $$ = { type: "default", promela: stListObj.promela };`
      ]
    ],

    statement_list: [
      ['statement statement_list',
        `var first = $1;
                 var rest = $2;

                 if (first.type === "if_leading_to_continue") {
                     var combinedPromela = "if\\n:: (" + first.condition + ") ->\\n" + yy.indentStatements(first.thenPromela) +
                     "\\n:: else ->\\n" + yy.indentStatements(rest.promela) +
                     "\\nfi;";
                     $$ = { type: "normal", promela: combinedPromela };
                 } else if (first.type === "continue") {
                     $$ = { type: "normal", promela: first.promela };
                 } else {
                     var combinedPromela = first.promela;
                     if (rest.promela && rest.promela.trim() !== "" && rest.promela.trim() !== "skip;") {
                         combinedPromela += "\\n" + rest.promela;
                     }
                     $$ = { type: "normal", promela: combinedPromela };
                 }`
      ],
      ['statement', '$$ = $1;']
    ],

    iteration_statement: [
      ['WHILE LPAREN expression RPAREN compound_statement',
        `var bodyObj = $5;
                 $$ = { type: "normal", promela: "do\\n" +
                 ":: !(" + $3 + ") -> break;\\n" +
                 ":: else ->\\n" +
                 yy.indentStatements(bodyObj.promela) + "\\n" +
                 "od;" };`
      ],
      ['DO compound_statement WHILE LPAREN expression RPAREN SEMI',
        `var bodyObj = $2;
                 var loopStartLabel = "_do_while_start_" + (yy.labelCount = (yy.labelCount || 0) + 1);
                 $$ = { type: "normal", promela: loopStartLabel + ":\\n" +
                 yy.indentStatements(bodyObj.promela) + "\\n" +
                 "if\\n" +
                 ":: (" + $5 + ") -> goto " + loopStartLabel + ";\\n" +
                 ":: else -> skip;\\n" +
                 "fi;" };`
      ],
      ['FOR LPAREN expression_opt SEMI expression_opt SEMI expression_opt RPAREN compound_statement',
        `var init = $3 ? $3 + ";" : "";
                 var cond = $5 || "true";
                 var incr_expr_str = $7;
                 var bodyObj = $9;

                 $$ = { type: "normal", promela: (init ? init + "\\n" : "") +
                 "do\\n" +
                 ":: !(" + cond + ") -> break;\\n" +
                 ":: else ->\\n" +
                 yy.indentStatements(bodyObj.promela) + "\\n" +
                 (incr_expr_str ? "    " + incr_expr_str + ";\\n" : "    skip;\\n") +
                 "od;" };`
      ],
      ['FOR LPAREN type_specifier IDENTIFIER ASSIGN expression SEMI expression SEMI expression RPAREN compound_statement',
        `var decl_init = $3 + " " + $4 + " = " + $6 + ";";
                 var cond_expr = $8 || "true";
                 var incr_expr_str = $10;
                 var bodyObj = $12;

                 $$ = { type: "normal", promela: decl_init + "\\n" +
                 "do\\n" +
                 ":: !(" + cond_expr + ") -> break;\\n" +
                 ":: else ->\\n" +
                 yy.indentStatements(bodyObj.promela) + "\\n" +
                 (incr_expr_str ? "    " + incr_expr_str + ";\\n" : "    skip;\\n") +
                 "od;" };`
      ],
      ['FOR LPAREN expression_opt SEMI expression_opt SEMI expression_opt RPAREN SEMI',
        `var init = $3 ? $3 + ";" : "";
                 var cond = $5 || "true";
                 var incr_expr_str = $7;
                 var bodyPromela = yy.indentStatements("skip;");

                 $$ = { type: "normal", promela: (init ? init + "\\n" : "") +
                 "do\\n" +
                 ":: !(" + cond + ") -> break;\\n" +
                 ":: else ->\\n" +
                 bodyPromela + "\\n" +
                 (incr_expr_str ? "    " + incr_expr_str + ";\\n" : "    skip;\\n") +
                 "od;" };`
      ]
    ],

    jump_statement: [
      ['BREAK SEMI', '$$ = { type: "normal", promela: "break;" };'],
      ['CONTINUE SEMI', '$$ = { type: "continue", promela: "skip;" };'],
      ['RETURN expression SEMI', '$$ = { type: "normal", promela: "return " + $2 + ";" };'],
      ['RETURN SEMI', '$$ = { type: "normal", promela: "return;" };'],
      ['GOTO IDENTIFIER SEMI', '$$ = { type: "normal", promela: "goto " + $2 + ";" };']
    ],

    expression_opt: [
      ['expression', '$$ = $1;'],
      ['', '$$ = "";']
    ],

    expression: [
      ['assignment_expression', '$$ = $1;'],
      ['expression COMMA assignment_expression', '$$ = $1 + ", " + $3;']
    ],

    assignment_expression: [
      ['conditional_expression', '$$ = $1;'],
      ['postfix_expression ASSIGN assignment_expression', '$$ = $1 + " = " + $3;']
    ],

    conditional_expression: [
      ['logical_or_expression', '$$ = $1;'],
      ['logical_or_expression QUESTION expression COLON conditional_expression', '$$ = "((" + $1 + ") ? (" + $3 + ") : (" + $5 + "))";']
    ],

    logical_or_expression: [
      ['logical_and_expression', '$$ = $1;'],
      ['logical_or_expression OR logical_and_expression', '$$ = "(" + $1 + " || " + $3 + ")";']
    ],

    logical_and_expression: [
      ['inclusive_or_expression', '$$ = $1;'],
      ['logical_and_expression AND inclusive_or_expression', '$$ = "(" + $1 + " && " + $3 + ")";']
    ],

    inclusive_or_expression: [
      ['exclusive_or_expression', '$$ = $1;'],
      ['inclusive_or_expression BITWISE_OR exclusive_or_expression', '$$ = "(" + $1 + " | " + $3 + ")";']
    ],

    exclusive_or_expression: [
      ['and_expression', '$$ = $1;'],
      ['exclusive_or_expression BITWISE_XOR and_expression', '$$ = "(" + $1 + " ^ " + $3 + ")";']
    ],

    and_expression: [
      ['equality_expression', '$$ = $1;'],
      ['and_expression BITWISE_AND equality_expression', '$$ = "(" + $1 + " & " + $3 + ")";']
    ],

    equality_expression: [
      ['relational_expression', '$$ = $1;'],
      ['equality_expression EQ relational_expression', '$$ = "(" + $1 + " == " + $3 + ")";'],
      ['equality_expression NEQ relational_expression', '$$ = "(" + $1 + " != " + $3 + ")";']
    ],

    relational_expression: [
      ['shift_expression', '$$ = $1;'],
      ['relational_expression LT shift_expression', '$$ = "(" + $1 + " < " + $3 + ")";'],
      ['relational_expression GT shift_expression', '$$ = "(" + $1 + " > " + $3 + ")";'],
      ['relational_expression LTE shift_expression', '$$ = "(" + $1 + " <= " + $3 + ")";'],
      ['relational_expression GTE shift_expression', '$$ = "(" + $1 + " >= " + $3 + ")";']
    ],

    shift_expression: [
      ['additive_expression', '$$ = $1;'],
      ['shift_expression SHIFT_LEFT additive_expression', '$$ = "(" + $1 + " << " + $3 + ")";'],
      ['shift_expression SHIFT_RIGHT additive_expression', '$$ = "(" + $1 + " >> " + $3 + ")";']
    ],

    additive_expression: [
      ['multiplicative_expression', '$$ = $1;'],
      ['additive_expression PLUS multiplicative_expression', '$$ = "(" + $1 + " + " + $3 + ")";'],
      ['additive_expression MINUS multiplicative_expression', '$$ = "(" + $1 + " - " + $3 + ")";']
    ],

    multiplicative_expression: [
      ['unary_expression', '$$ = $1;'],
      ['multiplicative_expression MUL unary_expression', '$$ = "(" + $1 + " * " + $3 + ")";'],
      ['multiplicative_expression DIV unary_expression', '$$ = "(" + $1 + " / " + $3 + ")";'],
      ['multiplicative_expression MOD unary_expression', '$$ = "(" + $1 + " % " + $3 + ")";']
    ],

    unary_expression: [
      ['postfix_expression', '$$ = $1;'],
      ['INC IDENTIFIER', '$$ = $2 + " = " + $2 + " + 1";'],
      ['DEC IDENTIFIER', '$$ = $2 + " = " + $2 + " - 1";'],
      ['NOT unary_expression', '$$ = "!(" + $2 + ")";'],
      ['BITWISE_NOT unary_expression', '$$ = "(~" + $2 + ")";'],
      ['PLUS unary_expression', '$$ = $2;'],
      ['MINUS unary_expression', '$$ = "-(" + $2 + ")";']
    ],

    postfix_expression: [
      ['primary_expression', '$$ = $1;'],
      ['IDENTIFIER INC', '$$ = $1 + " = " + $1 + " + 1";'],
      ['IDENTIFIER DEC', '$$ = $1 + " = " + $1 + " - 1";'],
      ['IDENTIFIER LBRACKET expression RBRACKET', '$$ = $1 + "[" + $3 + "]";'],
      ['IDENTIFIER LPAREN argument_list_opt RPAREN',
        `var funcName = $1;
                    if (funcName === "printf") {
                        $$ = "printf(" + ($3 || "") + ")";
                    } else {
                        $$ = funcName + "(" + ($3 || "") + ")";
                    }`
      ],
      ['postfix_expression DOT IDENTIFIER', '$$ = $1 + "." + $3;']
    ],

    primary_expression: [
      ['IDENTIFIER', '$$ = $1;'],
      ['NUMBER', '$$ = $1;'],
      ['STRING', '$$ = $1;'],
      ['TRUE', '$$ = "true";'],
      ['FALSE', '$$ = "false";'],
      ['NULL', '$$ = "0";'],
      ['LPAREN expression RPAREN', '$$ = "(" + $2 + ")";'],
      ['LPAREN type_specifier RPAREN LBRACE initializer_list_opt RBRACE',
        `var typeName = $2;
                 var initializer = $5 || ""; // Get the initializer list string
                 $$ = \`(\${typeName}){\${initializer}}\`; // Keep as a string for now
                `
      ]
    ],

    initializer_list_opt: [
      ['initializer_list', '$$ = $1;'],
      ['', '$$ = "";']
    ],

    initializer_list: [
      ['assignment_expression', '$$ = $1;'],
      ['initializer_list COMMA assignment_expression', '$$ = $1 + ", " + $3;']
    ],

    argument_list_opt: [
      ['argument_list', '$$ = $1;'],
      ['', '$$ = "";']
    ],

    argument_list: [
      ['assignment_expression', '$$ = $1;'],
      ['assignment_expression COMMA argument_list', '$$ = $1 + ", " + $3;']
    ]
  }
};