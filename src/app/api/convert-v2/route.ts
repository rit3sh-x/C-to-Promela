if (!process.env.OPENROUTER_API_KEY) throw new Error("Missing OpenRouter API Key");
import { DEFAULT_MODEL, promptV2 } from '@/constants/constants';
import { OpenRouterStreamPayload, OpenRouterStream } from '@/utils/stream';
import { Parser } from 'jison';
import { grammar, indentStatements, defaultTypes } from '@/lib/grammar';
import { postprocessMain, preprocessStage } from '@/constants/transformations';

interface ErrorLocation {
  line: number;
  column: number;
  text?: string;
  expected?: string[];
}

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

    const parser = new Parser(grammar);
    parser.yy = {
      userDefinedTypes: defaultTypes,
      currentFunction: null,
      switchExpr: null,
      anonStructCount: 0,
      labelCount: 0,
      indentStatements: indentStatements
    };

    try {
      const trimmedCode = preprocessStage(code.trim());
      let promelaOutput = parser.parse(trimmedCode);
      promelaOutput = postprocessMain(promelaOutput);

      const finalPrompt = promptV2(promelaOutput, code);

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

    } catch (parseError: any) {
      const errorLocation: ErrorLocation = {
        line: parseError.hash?.line || 0,
        column: parseError.hash?.loc?.first_column || 0,
        expected: parseError.hash?.expected
      };

      if (parseError.hash?.text) {
        errorLocation.text = parseError.hash.text;
      }

      throw new Error(
        `Parsing error at line ${errorLocation.line}, column ${errorLocation.column}: ${parseError.message}`
        + (errorLocation.expected ? ` Expected: ${errorLocation.expected.join(", ")}` : "")
      );
    }
  } catch (error: any) {
    console.error('Server error:', error);
  }
}