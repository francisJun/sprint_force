import React, { useState } from 'react';

export function ChatbotDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
        {
            sender: 'bot',
            text: 'Hi! I am your HourRadar AI Assistant. Ask me anything about ArbZG legal limits, budget runway forecasts, or vacation effects!',
        },
    ]);
    const [isStreaming, setIsStreaming] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userText = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
        setIsStreaming(true);

        try {
            // Read CSRF token from cookie or meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch('/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify({ message: userText }),
            });

            if (!response.body) throw new Error('No stream body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botReply = '';

            setMessages((prev) => [...prev, { sender: 'bot', text: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') {
                            break;
                        }
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.token) {
                                botReply += parsed.token;
                                setMessages((prev) => {
                                    const next = [...prev];
                                    next[next.length - 1] = { sender: 'bot', text: botReply };
                                    return next;
                                });
                            }
                        } catch {
                            // ignore partial JSON chunk
                        }
                    }
                }
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: 'Error connecting to streaming assistant. Please ensure your session is active.' },
            ]);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white shadow-xl transition-all hover:bg-blue-700 hover:scale-105"
                >
                    <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                    </span>
                    <span className="font-semibold text-sm">Ask HourRadar AI</span>
                </button>
            ) : (
                <div className="flex h-[480px] w-96 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
                                HourRadar AI (Offline Mock / Live)
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
                        {messages.map((m, idx) => (
                            <div
                                key={idx}
                                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                                        m.sender === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                                    }`}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Suggestions */}
                    <div className="flex gap-1.5 overflow-x-auto border-t border-neutral-100 px-3 py-2 text-xs text-neutral-500 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={() => setInput('What is the ArbZG daily limit?')}
                            className="whitespace-nowrap rounded-md bg-neutral-100 px-2 py-1 hover:bg-neutral-200 dark:bg-neutral-800"
                        >
                            ArbZG rules?
                        </button>
                        <button
                            type="button"
                            onClick={() => setInput('How is the budget runway calculated?')}
                            className="whitespace-nowrap rounded-md bg-neutral-100 px-2 py-1 hover:bg-neutral-200 dark:bg-neutral-800"
                        >
                            Runway calculation?
                        </button>
                    </div>

                    {/* Input form */}
                    <form onSubmit={handleSend} className="border-t border-neutral-200 p-3 dark:border-neutral-800">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={isStreaming || !input.trim()}
                                className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

