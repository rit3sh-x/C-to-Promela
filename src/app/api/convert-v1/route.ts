if (!process.env.OPENROUTER_API_KEY) throw new Error("Missing OpenRouter API Key");
import { DEFAULT_MODEL, promptV1 } from '@/constants/constants';
import { OpenRouterStreamPayload, OpenRouterStream } from '@/utils/stream';

export const POST = async (req: Request) => {
  try {
    const { code } = (await req.json()) as { code: string };

    if (!code || code.trim() === "") {
      return new Response(JSON.stringify({
        error: "Missing or empty input code",
        success: false
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const origin = req.headers.get('origin') || process.env.SITE_URL || 'http://localhost:3000';
    const generateUrl = `${origin}/api/generate`;

    const generateResponse = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cCode: code })
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.json().catch(() => ({}));
      throw new Error(`Generate API failed: ${generateResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const generateData = await generateResponse.json();
    
    if (!generateData.cCode) {
      throw new Error("Generate API response missing output field");
    }

    const finalPrompt = promptV1(generateData.output, code);

    const payload: OpenRouterStreamPayload = {
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: finalPrompt }],
      temperature: 0.2,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 8000,
      stream: true,
      n: 1,
    };

    const stream = await OpenRouterStream(payload);
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' }
    });

  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "An unknown error occurred",
      success: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};