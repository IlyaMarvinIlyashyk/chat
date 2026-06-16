import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';

const ollama = createOpenAICompatible({
  name: 'ollama',
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // required by the SDK, ignored by Ollama
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!Array.isArray(messages)) {
      return Response.json(
        { error: 'Expected messages to be an array.' },
        { status: 400 },
      );
    }

    const result = streamText({
      model: ollama('qwen3:14b'),
      system:
        'You are a helpful assistant. Reply concisely. /no_think',
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[api/chat]', error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate response.',
      },
      { status: 500 },
    );
  }
}
