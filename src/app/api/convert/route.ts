if (!process.env.OPENROUTER_API_KEY) throw new Error("Missing OpenAI API Key");

import { OpenRouterStreamPayload, OpenRouterStream } from '@/utils/stream';

export const POST = async (req: Request) => {
  const { prompt } = (await req.json()) as { prompt: string };

  if (!prompt) return new Response("Missing prompt", { status: 400 });

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

Please provide just the promel code no other text at all.`;

  const payload: OpenRouterStreamPayload = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [{ role: "user", content: value }],
    temperature: 0.2,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 8000,
    stream: true,
    n: 1,
  };
  const stream = await OpenRouterStream(payload);
  return new Response(stream);
};