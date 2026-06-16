'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isReasoningUIPart, isTextUIPart } from 'ai';
import { useState } from 'react';

export default function Page() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || status !== 'ready') return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {status === 'streaming'
            ? 'thinking…'
            : status === 'submitted'
              ? 'waiting…'
              : 'ready'}
        </span>
      </div>

      {error ? (
        <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Something went wrong. Check that Ollama is running on port 11434 and
          that the <code className="text-xs">qwen3:14b</code> model is pulled.
        </div>
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <span className="text-xs font-semibold text-gray-400">
              {m.role}
            </span>
            <div className="whitespace-pre-wrap">
              {m.parts.map((part, i) => {
                if (isTextUIPart(part)) {
                  return <span key={i}>{part.text}</span>;
                }
                if (isReasoningUIPart(part)) {
                  return (
                    <span key={i} className="text-gray-400 italic">
                      {part.text}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something…"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={status !== 'ready'}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
