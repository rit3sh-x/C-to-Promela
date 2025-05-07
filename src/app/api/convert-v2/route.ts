import { NextRequest, NextResponse } from 'next/server';
import { Parser } from 'jison';
import { grammar } from '@/lib/grammar';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = (await request.json()) as { prompt: string };
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing code' }, { status: 400 });
    }

    const trimmedCode = prompt.trim();
    if (!trimmedCode) {
      return NextResponse.json({ error: 'Code cannot be empty' }, { status: 400 });
    }

    const parser = new Parser(grammar);
    const promelaOutput = parser.parse(trimmedCode);

    const result = typeof promelaOutput === 'string' ? promelaOutput : JSON.stringify(promelaOutput);

    return NextResponse.json({ promela: result }, { status: 200 });
  } catch (error: any) {
    console.error('Parsing error:', error);
    return NextResponse.json({ error: error.message || 'Parsing failed' }, { status: 500 });
  }
}