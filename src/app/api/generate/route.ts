import OpenAI from 'openai';
import { DEFAULT_MODEL, promptGenerate } from '@/constants/constants';
import { NextResponse } from 'next/server';

if (!process.env.OPENROUTER_API_KEY) throw new Error("Missing OpenRouter API Key");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "C to Promela Converter",
  },
});

export const POST = async (req: Request) => {
    const { cCode } = (await req.json()) as { cCode: string };

    if (!cCode || cCode.trim() === "") {
        return NextResponse.json(
            { error: "Missing or empty C code", success: false },
            { status: 400 }
        );
    }

    const prompt = promptGenerate(cCode);

    try {
        const completion = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 8000,
        });
        const unrolledCCode = completion.choices?.[0]?.message?.content;

        if (!unrolledCCode) {
            throw new Error("No Promela code generated in the response");
        }

        return NextResponse.json({
            cCode: unrolledCCode,
            success: true
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : "An unknown error occurred",
            success: false
        }, { status: 500 });
    }
};