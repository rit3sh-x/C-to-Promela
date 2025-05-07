interface CToPromelaConverterOptions {
    maxNodes?: number;
    channelSize?: number;
    generateComments?: boolean;
    simulatePointers?: boolean;
    simulateRecursion?: boolean;
    debug?: boolean;
    traceExecution?: boolean;
}

interface ConversionResult {
    promelaCode: string;
    warnings: string[];
    errors: string[];
    symbolTable: SymbolTable;
}

interface SymbolTable {
    variables: Record<string, VariableInfo>;
    functions: Record<string, FunctionInfo>;
    types: Record<string, TypeInfo>;
}

interface VariableInfo {
    name: string;
    type: string;
    isArray?: boolean;
    arraySize?: number;
    isPointer?: boolean;
    pointerDepth?: number;
}

interface FunctionInfo {
    name: string;
    returnType: string;
    parameters: ParameterInfo[];
    isRecursive?: boolean;
}

interface ParameterInfo {
    name: string;
    type: string;
    isPointer?: boolean;
}

interface TypeInfo {
    name: string;
    isStruct?: boolean;
    fields?: Record<string, VariableInfo>;
    size?: number;
}

export {
    CToPromelaConverterOptions,
    ConversionResult,
    SymbolTable,
    VariableInfo,
    FunctionInfo,
    ParameterInfo,
    TypeInfo
};