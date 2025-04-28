import {
    ParsedEvent,
    ReconnectInterval,
    createParser,
} from "eventsource-parser";

export type Agent = "user" | "system" | "assistant" | "function";

export interface LLMMessage {
    role: Agent;
    content: string;
}

export interface OpenRouterStreamPayload {
    model: string;
    messages: LLMMessage[];
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    stream: boolean;
    n?: number;
}

export async function OpenRouterStream(payload: OpenRouterStreamPayload) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not defined");
    }

    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    const siteName = process.env.SITE_NAME || "C to Promela Converter";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": siteUrl,
            "X-Title": siteName
        },
        body: JSON.stringify({
            ...payload,
        }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
            `OpenRouter API error: ${res.status} ${res.statusText}${
                errorData ? ` - ${JSON.stringify(errorData)}` : ""
            }`
        );
    }

    let counter = 0;

    const stream = new ReadableStream({
        async start(controller) {
            function push(event: ParsedEvent | ReconnectInterval) {
                if (event.type === "event") {
                    const { data } = event;

                    if (data === "[DONE]") {
                        controller.close();
                        return;
                    }

                    try {
                        const json = JSON.parse(data);
                        const text = json.choices[0]?.delta?.content || "";

                        if (counter < 2 && text.trim() === "" && text.includes("\n")) {
                            counter++;
                            return;
                        }

                        if (text) {
                            const queue = encoder.encode(text);
                            controller.enqueue(queue);
                        }
                        counter++;
                    } catch (err) {
                        console.error("Error parsing OpenRouter stream:", err);
                        controller.error(err);
                    }
                }
            }

            const parser = createParser(push);

            if (res.body) {
                const reader = res.body.getReader();
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        parser.feed(decoder.decode(value));
                    }
                } catch (err) {
                    console.error("Error reading stream:", err);
                    controller.error(err);
                } finally {
                    reader.releaseLock();
                }
            } else {
                controller.error(new Error("Response body is null"));
            }
        }
    });

    return stream;
}