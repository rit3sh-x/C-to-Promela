'use server'

import { z } from 'zod';

const ConversionInputSchema = z.object({
  cCode: z.string().min(1, 'C code is required'),
});

export async function POST(request: Request) {
  try {
    const { cCode } = await request.json();
    const validationResult = ConversionInputSchema.safeParse({ cCode });
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: validationResult.error.errors[0]?.message || 'Invalid input' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `
Convert the following C code to equivalent Promela code. 
Promela is used for model checking with SPIN, so focus on preserving the behavior
while adapting to Promela's constructs (processes, channels, atomic blocks, etc.).
Ensure the code is syntactically correct and follows Promela conventions.
Provide only the Promela code without any additional text, headers, or explanations.

C CODE:
\`\`\`c
${cCode}
\`\`\`

Please provide:
1. "# Promela Code" followed by the converted Promela code in a code block
2. "# Explanation" followed by a brief explanation of the translation, highlighting key transformations
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'C to Promela Converter',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code converter specializing in translating C code to Promela code for SPIN model checking.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return new Response(
        JSON.stringify({ error: `OpenRouter API request failed: ${response.statusText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content received from API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let promelaCode = content;
    const promelaStart = content.indexOf('# Promela Code');
    const explanationStart = content.indexOf('# Explanation');
    
    if (promelaStart !== -1 && explanationStart !== -1) {
      promelaCode = content.slice(promelaStart + '# Promela Code'.length, explanationStart).trim();
    } else if (promelaStart !== -1) {
      promelaCode = content.slice(promelaStart + '# Promela Code'.length).trim();
    }

    promelaCode = promelaCode.replace(/^```promela\n|```$/g, '').trim();

    return new Response(
      JSON.stringify({ promelaCode }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error converting C to Promela:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to convert C code to Promela',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}