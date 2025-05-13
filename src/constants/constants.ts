export const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";

export const promptV1 = (unrolledCCode: string, originalCCode: string) => {
  return `
STRICTLY convert this pre-processed C code to Promela following EXACTLY these rules:
1. Use Promela's if-fi/do-od blocks for control flow
2. Replace functions with proctypes when needed
3. Use atomic{} for critical sections
4. Convert variables to Promela types (byte, int, bool)
5. NEVER add comments or explanations
6. Focus on exact behavioral translation using Promela's syntax.

OUTPUT MUST CONTAIN ONLY RAW PROMELA CODE between <PROMELA_START> and <PROMELA_END> tags.

Input C Code:
\`\`\`c
${unrolledCCode}
\`\`\`

Reference (original C code):
\`\`\`c
${originalCCode}
\`\`\`
`;
};

export const promptGenerate = (complexCCode: string) => {
  return `
STRICTLY simplify this C code for Promela conversion with these REQUIRED changes:
1. Simplify malloc and free as allocating arrays for them, use #define MAX_NODES for array sizes
2. Remove pointers and replace them with array indices
3. Make all loops bounded
4. NEVER add comments or explanations

OUTPUT MUST CONTAIN ONLY RAW C CODE between <C_START> and <C_END> tags.

Original Complex C Code:
\`\`\`c
${complexCCode}
\`\`\`
`;
};

export const promptV2 = (stateMachineCCode: string, originalCCode: string) => {
  return `
STRICTLY convert this state machine to Promela with these REQUIREMENTS:
1. Define states using mtype
2. Create proctype for state machine
3. Use atomic{} for transitions, and init{} block for initialization if we have main function
4. Add channels if needed for events
5. NEVER add comments or explanations
6. Focus on exact behavioral translation using Promela's syntax.
7. also look at reference C code for more context

OUTPUT MUST CONTAIN ONLY RAW PROMELA CODE between <PROMELA_START> and <PROMELA_END> tags.

State Machine C Code:
\`\`\`c
${stateMachineCCode}
\`\`\`

Reference (original C code):
\`\`\`c
${originalCCode}
\`\`\`
`;
};