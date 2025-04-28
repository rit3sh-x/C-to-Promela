if (!process.env.OPENROUTER_API_KEY) throw new Error("Missing OpenAI API Key");
import { DEFAULT_MODEL, FALLBACK_MODEL, generatePrompt } from '@/constants/constants';

import { OpenRouterStreamPayload, OpenRouterStream } from '@/utils/stream';

export const POST = async (req: Request) => {
  const { prompt } = (await req.json()) as { prompt: string };

  if (!prompt) return new Response("Missing prompt", { status: 400 });

  const value = generatePrompt(prompt);
  const payload: OpenRouterStreamPayload = {
    model: DEFAULT_MODEL || FALLBACK_MODEL,
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