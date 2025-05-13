declare module 'jison' {
    type LexRulePattern = string;
    type LexRuleAction = string;
    type LexRuleConditions = string;

    interface LexRule {
        pattern: LexRulePattern;
        action: LexRuleAction;
        conditions?: LexRuleConditions;
    }

    type LexRuleTuple = [LexRulePattern, LexRuleAction] | [LexRulePattern, LexRuleAction, LexRuleConditions];

    interface Lex {
        rules: Array<LexRuleTuple>;
        macros?: Record<string, string>;
        startConditions?: Record<string, number | boolean>;
    }

    type Operator = [string, ...string[]];

    type BNFProductionAction = string;

    interface PrecedenceSpec {
        prec: string;
    }

    type BNFProduction =
        string |
        [string, BNFProductionAction] |
        [string, BNFProductionAction, PrecedenceSpec] |
        [string, BNFProductionAction, string];

    interface BNF {
        [nonterminal: string]: Array<BNFProduction>;
    }

    interface Grammar {
        moduleInclude?: string;
        lex: Lex;
        operators?: Operator[];
        bnf: BNF;
        start?: string;
    }

    class Parser {
        constructor(grammar: Grammar | string, options?: ParserOptions);
        parse(input: string): any;
        generate(options?: GenerateOptions): string;
        yy: YY;
    }

    interface GenerateOptions {
        moduleName?: string;
        moduleType?: string;
        'module-name'?: string;
        'module-type'?: string;
    }

    interface ParserOptions {
        type?: string;
        moduleType?: string;
        moduleName?: string;
        'module-name'?: string;
        'module-type'?: string;
        yy?: YY;
    }

    interface YY {
        parseError?: (message: string, hash: ErrorHash) => void;
        lexer?: Lexer;
        parser?: Parser;
        currentFunction?: string | null;
        switchExpr?: string | null;
        loopDepth?: number;
        breakableDepth?: number;
        indentStatements?: (statements: string) => string;
        trace?: (msg: string) => void;
        userDefinedTypes?: Record<string, boolean>;
        labelCount?: number;
        anonStructCount?: number;
        [key: string]: any;
    }

    interface ErrorHash {
        text: string;
        token: string;
        line: number;
        loc: {
            first_line: number;
            last_line: number;
            first_column: number;
            last_column: number;
        };
        expected: string[];
    }

    interface Lexer {
        setInput(input: string): void;
        lex(): string | number;
        begin(condition: string): void;
        popState(): string;
        pushState(condition: string): void;
        allowedInState(matcher: string): boolean;
        canTokenize(): boolean;
        clear(): void;
        yytext: string;
        yyleng: number;
        yylineno: number;
        yylloc: {
            first_line: number;
            last_line: number;
            first_column: number;
            last_column: number;
        };
    }

    export { Parser, Grammar, Lex, BNF, YY, ParserOptions, Lexer };
}