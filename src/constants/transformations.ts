const cleanUpBody = (cCode: string): string => {
    cCode = cCode.replace(/^\s*#\s*(include|undef|if|ifdef|ifndef|else|endif|pragma|error|warning)\b[^\n]*$/gm, '');
    cCode = cCode.replace(/\/\/[^\n]*$/gm, '');
    cCode = cCode.replace(/\/\*[\s\S]*?\*\//g, '');
    cCode = cCode.replace(
        /(^|\s)((?:unsigned\s+|signed\s+)?(?:long\s+long\s+|long\s+|short\s+)?(?:int|char|float|double|void))([a-zA-Z_])/g,
        '$1$2 $3'
    );
    cCode = cCode.replace(
        /for\s*\(\s*((?:unsigned\s+|signed\s+)?(?:long\s+long\s+|long\s+|short\s+)?(?:int|char|float|double|void)\s+)\s*([a-zA-Z_]\w*)\s*=\s*([^;]+?)\s*;\s*([^;]+?)\s*;\s*([^)]+?)\)/gi,
        (match, type, varName, initVal, condition, increment) => {
            return `${type.trim()} ${varName};\nfor(${varName} = ${initVal.trim()}; ${condition.trim()}; ${increment.trim()})`;
        }
    );
    cCode = cCode.replace(/\n{2,}/g, '\n');
    return cCode;
};

const removeReturnStatements = (code: string): string => {
    const functionRegex = /(\w[\w\s\*]*?)\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\n\}/g;
    const transformedFunctions = new Map<string, string>();
    
    const matches = [...code.matchAll(functionRegex)];
    for (const [, returnTypeRaw, funcName, , body] of matches) {
        const returnType = returnTypeRaw.trim();
        if (funcName !== 'main' && returnType !== "void" && /return\s+[^;]+;/.test(body)) {
            transformedFunctions.set(funcName, returnType);
        }
    }

    let transformedCode = code.replace(functionRegex, (match, returnTypeRaw, funcName, params, body) => {
        const returnType = returnTypeRaw.trim();
        if (!transformedFunctions.has(funcName)) return match;

        const resultParam = `${returnType} ${funcName}_result`;
        const newParams = params.trim() ? `${params.trim()}, ${resultParam}` : resultParam;

        const transformedBody = body.replace(/return\s+([^;]+);/g, (_:string, expr: string): string => {
            expr = expr.trim();
            const callMatch: RegExpMatchArray | null = expr.match(/^(\w+)\s*\(([^)]*)\)$/);
            if (callMatch) {
            const calledFunc: string = callMatch[1];
            const args: string = callMatch[2];
            if (transformedFunctions.has(calledFunc)) {
                return `${calledFunc}(${args}, ${funcName}_result);`;
            }
            }
            return `${funcName}_result = ${expr};`;
        });

        return `${returnType} ${funcName}(${newParams}) {\n${transformedBody}\n}`;
    });

    transformedCode = transformedCode.replace(/(\w+)\s*\(([^()]*)\)/g, (match, funcName, args) => {
        if (!transformedFunctions.has(funcName)) return match;
        const inFunctionBody = [...matches].some(([, , f, , body]) => {
            return f !== "main" && body.includes(match);
        });
        if (inFunctionBody) return match;
        if (args.includes(`${funcName}_result`)) return match;
        const resultVar = `${funcName}_result`;
        const returnType = transformedFunctions.get(funcName);
        const newCall = `${funcName}(${args.trim() ? args.trim() + ", " : ""}${resultVar})`;
        return `${returnType} ${resultVar};\n${newCall}`;
    });

    return transformedCode;
};

const removeStructUsage = (code: string): string => {
    const structUsageRegex = /\bstruct\s+(\w+)\b(?=\s*[*\w[])/g;
    const definitionRegex = /struct\s+\w+\s*\{/g;
    const definitions = new Set<string>();
    for (const match of code.matchAll(definitionRegex)) {
        const defMatch = match[0].match(/struct\s+(\w+)/);
        if (defMatch) {
            definitions.add(defMatch[1]);
        }
    }
    return code.replace(structUsageRegex, (match, structName) => {
        if (definitions.has(structName)) {
            return structName;
        }
        return match;
    });
};

const pointerToMemoryArray = (cCode: string): string => {
    const structRegex = /struct\s+(\w+)\s*\{([\s\S]*?)\}\s*;/g;
    const structures: {[key: string]: string} = {};
    const fieldNames = new Set<string>();
    let match;
    while ((match = structRegex.exec(cCode)) !== null) {
        const structName = match[1];
        const structBody = match[2];
        structures[structName] = structBody;

        const fieldRegex = /(\w+)\s*;|(\w+)\s*\[.*?\]\s*;|struct\s+\w+\s*\*\s*(\w+)\s*;|(\w+)\s*\*\s*(\w+)\s*;/g;
        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(structBody)) !== null) {
            const fieldName = fieldMatch[1] || fieldMatch[2] || fieldMatch[3] || fieldMatch[5];
            if (fieldName) fieldNames.add(fieldName);
        }
    }

    let cCodeWithoutStructs = cCode.replace(structRegex, '');

    const globalStructPointerRegex = /struct\s+(\w+)\s*\*\s*(\w+)\s*;/g;
    let globalVars = new Set<string>();
    cCodeWithoutStructs = cCodeWithoutStructs.replace(globalStructPointerRegex, (full, structName, pointerName) => {
        globalVars.add(pointerName);
        return '';
    });

    let resultCode = '';
    for (const structName in structures) {
        let structBody = structures[structName];
        structBody = structBody.replace(
            /struct\s+(\w+)\s*\*\s*(\w+)\s*;/g,
            (match, pointedStructName, fieldName) => `int ${fieldName};`
        );

        structBody = structBody.replace(
            /(\w+)\s*\*\s*(\w+)\s*;/g,
            (match, type, fieldName) => {
                if (match.includes("struct")) return match;
                if (type === "char") return `char ${fieldName}[MAX_STRING_LENGTH];`;
                return `int ${fieldName};`;
            }
        );

        const typedefStruct = `struct ${structName} {\n${structBody.trim()}\n}`;
        const memAlloc = `${structName} ${structName.toLowerCase()}_mem[MAX_NODES];\n`;
        const usedAlloc = `byte ${structName.toLowerCase()}_used[MAX_NODES];\n`;

        resultCode += typedefStruct + ';\n\n' + memAlloc + usedAlloc + '\n';
    }
    for (const pointerName of globalVars) {
        if (!fieldNames.has(pointerName)) {
            resultCode += `int ${pointerName} = 0;\n`;
        }
    }
    for (const structName in structures) {
        const lowerName = structName.toLowerCase();
        resultCode += `
int allocate_${lowerName}() {
    for (int i = 0; i < MAX_NODES; i++) {
        if (${lowerName}_used[i] == 0) {
            ${lowerName}_used[i] = 1;
            ${lowerName}_mem[i] = (${structName}){0};
            return i;
        }
    }
    return -1;
}

void free_${lowerName}(int index) {
    if (index >= 0 && index < MAX_NODES) {
        ${lowerName}_used[index] = 0;
    }
}
`;
    }
    resultCode += `\n\n` + cCodeWithoutStructs.trim() + '\n';
    return resultCode;
};

const convertPointerAccessToArrayAccess = (cCode: string, structDefinitions?: string): string => {
    const structTypes = extractStructTypes(structDefinitions || cCode);
    
    let resultCode = cCode;
    resultCode = resultCode.replace(
        /(\w+)->(\w+)/g, 
        (match, pointer, field) => {
            const structType = getStructTypeForPointer(pointer, structDefinitions || cCode);
            if (structType) {
                return `${structType.toLowerCase()}_mem[${pointer}].${field}`;
            }
            return match;
        }
    );

    resultCode = resultCode.replace(
        /\(([^()]+)\)->(\w+)/g,
        (match, expr, field) => {
            const structType = inferStructTypeFromExpr(expr, structTypes, structDefinitions || cCode);
            if (structType) {
                return `${structType.toLowerCase()}_mem[${expr}].${field}`;
            }
            return match;
        }
    );

    resultCode = resultCode.replace(
        /&(\w+)/g,
        (match, varName) => {
            if (isStructVariable(varName, structDefinitions || cCode)) {
                return varName;
            }
            return match;
        }
    );

    resultCode = resultCode.replace(
        /(\w+)\[(\d+)\]/g,
        (match, array, index) => {
            const structType = getStructTypeForPointer(array, structDefinitions || cCode);
            if (structType) {
                return `${structType.toLowerCase()}_mem[${array} + ${index}]`;
            }
            return match;
        }
    );

    resultCode = resultCode.replace(/NULL/g, "-1");
    resultCode = resultCode.replace(/null/g, "-1");

    resultCode = resultCode.replace(
        /(\w+)\s*=\s*\(\s*struct\s+(\w+)\s*\*\s*\)\s*malloc\s*\(\s*sizeof\s*\(\s*struct\s+\2\s*\)\s*\)/g,
        (match, varName, structType) => {
            return `${varName} = allocate_${structType.toLowerCase()}()`;
        }
    );
    
    resultCode = resultCode.replace(
        /(\w+)\s*=\s*\(\s*(\w+)\s*\*\s*\)\s*malloc\s*\(\s*sizeof\s*\(\s*\2\s*\)\s*\)/g,
        (match, varName, structType) => {
            if (structTypes.includes(structType)) {
                return `${varName} = allocate_${structType.toLowerCase()}()`;
            }
            return match;
        }
    );

    resultCode = resultCode.replace(
        /free\s*\(\s*(\w+)\s*\)/g,
        (match, varName) => {
            const structType = getStructTypeForPointer(varName, structDefinitions || cCode);
            if (structType) {
                return `free_${structType.toLowerCase()}(${varName})`;
            }
            return match;
        }
    );
    
    return resultCode;
};

const extractStructTypes = (code: string): string[] => {
    const structRegex = /struct\s+(\w+)\s*\{/g;
    const types: string[] = [];
    let match;
    
    while ((match = structRegex.exec(code)) !== null) {
        types.push(match[1]);
    }
    
    return types;
};

const getStructTypeForPointer = (pointerName: string, code: string): string | null => {
    const declRegex = new RegExp(`struct\\s+(\\w+)\\s*\\*\\s*${pointerName}\\s*;`, 'g');
    const match = declRegex.exec(code);
    
    if (match) {
        return match[1];
    }
    const usageRegex = new RegExp(`${pointerName}\\s*=\\s*allocate_(\\w+)\\(\\)`, 'g');
    const usageMatch = usageRegex.exec(code);
    
    if (usageMatch) {
        return usageMatch[1].charAt(0).toUpperCase() + usageMatch[1].slice(1);
    }
    
    return null;
};

const inferStructTypeFromExpr = (expr: string, structTypes: string[], code: string): string | null => {
    const funcCallMatch = expr.match(/(\w+)\(/);
    if (funcCallMatch) {
        const funcName = funcCallMatch[1];
        const funcRegex = new RegExp(`struct\\s+(\\w+)\\s*\\*\\s*${funcName}\\s*\\(`, 'g');
        const match = funcRegex.exec(code);
        if (match) {
            return match[1];
        }
    }
    if (expr.match(/allocate_(\w+)\(/)) {
        const structName = expr.match(/allocate_(\w+)\(/)![1];
        return structTypes.find(t => t.toLowerCase() === structName) || null;
    }
    return getStructTypeForPointer(expr, code);
};

const isStructVariable = (varName: string, code: string): boolean => {
    const structVarRegex = new RegExp(`struct\\s+(\\w+)\\s+${varName}\\s*;`, 'g');
    return structVarRegex.test(code);
};

export const postprocessMain = (cCode: string): string => {
    const mainRegex = /\bmain\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/;
    cCode = '#define MAX_NODES 100\n#define MAX_STRING_LENGTH 100\n\n' + cCode;
    return cCode.replace(mainRegex, (match, args, body) => {
        const argDecls: string = args
            .split(',')
            .map((a: string): string => a.trim())
            .filter((a: string): boolean => Boolean(a))
            .map((a: string): string => a + ';')
            .join('\n');
        const cleanedBody = body.replace(/return\s+[^;]*;/g, '').trim();
        return `init {\n${argDecls}${argDecls && '\n'}${cleanedBody}\n}`;
    });
};

const convertPointersAndAddresses = (cCode: string, structDefinitions?: string): string => {
    const structTypes = extractStructTypes(structDefinitions || cCode);
    let result = cCode.replace(
        /(struct\s+)?(\w+)\s*\*\s*(\w+)(?=\s*[;,)=])/g,
        (match, structKeyword, typeName, varName) => {
            if (structTypes.includes(typeName)) {
                return `int ${varName}`;
            }
            return match;
        }
    );

    result = result.replace(/(?<!\w)&(?!&)/g, '');

    return result;
};

export const preprocessStage = (cCode: string): string => {
    cCode = cleanUpBody(cCode);
    cCode = convertPointerAccessToArrayAccess(cCode);
    cCode = pointerToMemoryArray(cCode);
    cCode = removeReturnStatements(cCode);
    cCode = removeStructUsage(cCode);
    cCode = convertPointersAndAddresses(cCode);
    cCode = cleanUpBody(cCode);
    return cCode.trim();
};