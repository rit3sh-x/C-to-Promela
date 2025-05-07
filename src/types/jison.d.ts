declare module 'jison' {
    type LexRulePattern = string;
    type LexRuleAction = string;
    type LexRuleConditions = string;

    interface LexRule {
        pattern: LexRulePattern;
        action: LexRuleAction;
    }

    type LexRuleTuple = [LexRulePattern, LexRuleAction] | [LexRulePattern, LexRuleAction, LexRuleConditions];

    interface Lex {
        rules: Array<string | LexRule | LexRuleTuple>;
        macros?: Record<string, string>;
        startConditions?: Record<string, number>;
    }

    interface BNF {
        [nonterminal: string]: Array<string | [string, string]>;
    }

    interface Grammar {
        lex: Lex;
        operators?: Array<[string, string]>;
        bnf: BNF;
        start?: string;
    }

    class Parser {
        constructor(grammar: Grammar | string, options?: ParserOptions);
        parse(input: string): any;
        generate(): string;
    }

    interface ParserOptions {
        type?: string;
        moduleType?: string;
        moduleName?: string;
        yy?: YY;
    }

    interface YY {
        text: string;
        currentFunction?: string;
        switchExpr?: string;
        loopDepth?: number;
        breakableDepth?: number;
        trace?: (msg: string) => void;
        [key: string]: any;
    }

    export { Parser, Grammar, Lex, BNF, YY, ParserOptions };
}