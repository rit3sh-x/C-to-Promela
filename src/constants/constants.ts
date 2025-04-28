export const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";
export const FALLBACK_MODEL = "google/gemini-2.5-pro-exp-03-25";

export const generatePrompt = (prompt: string) => {
    const value = `
Convert the following C code to equivalent Promela code. 
Promela is used for model checking with SPIN, so focus on preserving the behavior
while adapting to Promela's constructs (processes, channels, atomic blocks, etc.).
Ensure the code is syntactically correct and follows Promela conventions.
Provide only the Promela code without any additional text, headers, or explanations.

C CODE:
\`\`\`c
${prompt}
\`\`\`
Please provide just the promel code no other text at all.`

    return value;
}