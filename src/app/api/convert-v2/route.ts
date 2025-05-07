import { NextRequest, NextResponse } from 'next/server';
import { Parser } from 'jison';
import { grammar } from '@/lib/grammar';

function indentStatements(statements: string): string {
  if (!statements) return '';

  return statements.split('\n')
    .map(line => line.trim() ? '  ' + line : line)
    .join('\n');
}

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

    parser.yy = {
      currentFunction: '',
      switchExpr: '',
      loopDepth: 0,
      breakableDepth: 0,
      indentStatements
    };

    const promelaOutput = parser.parse(trimmedCode);
    const result = typeof promelaOutput === 'string' ? promelaOutput : JSON.stringify(promelaOutput);

    return NextResponse.json({ promela: result }, { status: 200 });
  } catch (error: any) {
    console.error('Parsing error:', error);
    return NextResponse.json({
      error: error.message || 'Parsing failed',
      location: error.hash ? {
        line: error.hash.line,
        column: error.hash.loc?.first_column,
        expected: error.hash.expected
      } : undefined
    }, { status: 500 });
  }
}