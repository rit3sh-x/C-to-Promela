export const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";
export const FALLBACK_MODEL = "google/gemini-2.5-pro-exp-03-25";

export const generatePrompt = (prompt: string) => {
  return `
Convert the following C code to equivalent Promela code. 
Promela is used for model checking with SPIN, so focus on preserving the behavior
while adapting to Promela's constructs (processes, channels, atomic blocks, etc.).
Ensure the code is syntactically correct and follows Promela conventions.
Wrap only the final Promela code between the tags <PROMELA_START> and <PROMELA_END>.
Do not include any other text.

C CODE:
\`\`\`c
${prompt}
\`\`\`
`;
};