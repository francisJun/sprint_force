import React, { useState, useRef, useEffect } from "react";
import {
    Bot,
    Maximize2,
    Minimize2,
    Send,
    X,
    Sparkles,
    RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function ChatbotDrawer() {
    const { t, isGerman } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<
        { sender: "user" | "bot"; text: string }[]
    >([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting in appropriate language
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    sender: "bot",
                    text: isGerman
                        ? "Guten Tag! Ich bin Ihr HourRadar KI-Assistent. Ich beantworte Fragen zu Höchstarbeitszeiten (ArbZG § 3), 4-Wochen-Burndown-Tempo, Budgeterschöpfung, Urlaubszeiten und dem 3-Wege-Rechnungsabgleich."
                        : "Hello! I am your HourRadar AI Assistant. I can help answer questions regarding ArbZG § 3 labor ceilings, rolling 4-week burn pace, purchase order runway depletion, vacation buffers, and 3-way vendor invoice reconciliation.",
                },
            ]);
        }
    }, [isGerman]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userText = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { sender: "user", text: userText }]);
        setIsStreaming(true);

        try {
            // Read CSRF token from cookie or meta tag
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch("/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    Accept: "text/event-stream",
                },
                body: JSON.stringify({ message: userText }),
            });

            if (!response.body) throw new Error("No stream body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botReply = "";

            setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.replace("data: ", "").trim();
                        if (dataStr === "[DONE]") {
                            break;
                        }
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.token) {
                                botReply += parsed.token;
                                setMessages((prev) => {
                                    const next = [...prev];
                                    next[next.length - 1] = {
                                        sender: "bot",
                                        text: botReply,
                                    };
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
                {
                    sender: "bot",
                    text: "Unable to connect to the streaming assistant. Please ensure your session is active and try again.",
                },
            ]);
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickQuestions = isGerman
        ? [
              "Wie lautet die tägliche Höchstarbeitszeit nach ArbZG § 3?",
              "Wie wird die Budgetreichweite (Runway) berechnet?",
              "Was löst das 4-Wochen-Nachbestellradar aus?",
              "Wie funktioniert der 3-Wege-Rechnungsabgleich?",
          ]
        : [
              "What is the ArbZG § 3 daily working time limit?",
              "How is the budget runway calculated?",
              "What triggers the 4-week re-order radar?",
              "How does the 3-way invoice matching audit work?",
          ];

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2.5 rounded-full bg-gov-interactive px-5 py-3 text-white shadow-2xl transition-all hover:bg-gov-interactive-hover hover:scale-105 cursor-pointer ring-2 ring-gov-interactive/30"
                >
                    <Bot className="h-4 w-4" />
                    <span className="font-semibold text-sm tracking-tight">
                        {isGerman ? "HourRadar KI fragen" : "Ask HourRadar AI"}
                    </span>
                </button>
            ) : (
                <div
                    className={`flex flex-col overflow-hidden rounded-2xl border border-gov-border bg-gov-surface shadow-2xl transition-all duration-300 ease-in-out ${
                        isMaximized
                            ? "w-[calc(100vw-2rem)] sm:w-185 md:w-210 h-205 max-h-[92vh]"
                            : "w-[calc(100vw-2rem)] sm:w-130 md:w-150 h-165 max-h-[85vh]"
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gov-border bg-gov-canvas px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gov-interactive text-white shadow-xs">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm text-gov-text leading-tight">
                                        HourRadar AI Advisor
                                    </h3>
                                    <span className="flex items-center gap-1 rounded-sm bg-gov-success-bg border border-gov-success-border px-1.5 py-0.2 text-[9px] font-semibold text-gov-success-text uppercase tracking-wider">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online
                                    </span>
                                </div>
                                <p className="text-[10px] text-gov-muted mt-0.5">
                                    {isGerman
                                        ? "Rechtskonformität, Budgetreichweite & Rechnungsprüfung"
                                        : "Labor compliance, budget runway & invoice audit intelligence"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMaximized((prev) => !prev)}
                                title={
                                    isMaximized
                                        ? (isGerman ? "Kompaktansicht" : "Restore default size")
                                        : (isGerman ? "Vergrößern" : "Expand drawer")
                                }
                                className="rounded-lg p-1.5 text-gov-muted hover:text-gov-text hover:bg-gov-surface transition-colors cursor-pointer"
                            >
                                {isMaximized ? (
                                    <Minimize2 className="h-4 w-4" />
                                ) : (
                                    <Maximize2 className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title={isGerman ? "Schließen" : "Close drawer"}
                                className="rounded-lg p-1.5 text-gov-muted hover:text-gov-text hover:bg-gov-surface transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages Log */}
                    <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5 text-xs">
                        {messages.map((m, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-2.5 ${
                                    m.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                {m.sender === "bot" && (
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gov-interactive/10 text-gov-interactive border border-gov-border mt-0.5">
                                        <Bot className="h-3.5 w-3.5" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap wrap-break-word ${
                                        m.sender === "user"
                                            ? "bg-gov-interactive text-white shadow-xs font-normal"
                                            : "bg-gov-canvas border border-gov-border text-gov-text shadow-xs"
                                    }`}
                                >
                                    {m.text || (
                                        <span className="flex items-center gap-1.5 text-gov-muted italic text-[11px]">
                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                            {isGerman ? "Analysiere Telemetriedaten..." : "Analyzing telemetry..."}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Question Prompts */}
                    <div className="border-t border-gov-border bg-gov-canvas/60 px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-gov-muted mb-1.5">
                            <Sparkles className="h-3 w-3 text-gov-interactive" />
                            <span>{isGerman ? "Schnellthemen" : "Quick Topics"}</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
                            {quickQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setInput(q);
                                    }}
                                    className="shrink-0 rounded-md border border-gov-border bg-gov-surface px-2.5 py-1 text-[11px] text-gov-muted hover:text-gov-text hover:bg-gov-surface-hover transition-colors cursor-pointer"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Composer */}
                    <form
                        onSubmit={handleSend}
                        className="border-t border-gov-border bg-gov-surface p-3"
                    >
                        <div className="flex items-end gap-2 rounded-xl border border-gov-border bg-gov-canvas p-1.5 focus-within:border-gov-interactive focus-within:ring-1 focus-within:ring-gov-interactive transition-all">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                                placeholder={
                                    isGerman
                                        ? "Fragen zu ArbZG § 3, PO-Abbrand, Urlaubssperren oder Rechnungsabgleich..."
                                        : "Ask about ArbZG § 3 limits, PO burn rates, vacation buffers, or invoice audits..."
                                }
                                className="flex-1 resize-none bg-transparent px-2.5 py-1 text-xs text-gov-text placeholder:text-gov-muted focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isStreaming || !input.trim()}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gov-interactive text-white hover:bg-gov-interactive-hover disabled:opacity-40 transition-colors cursor-pointer"
                                title={
                                    isGerman
                                        ? "Nachricht senden"
                                        : "Send message"
                                }
                            >
                                <Send className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="flex justify-between items-center px-1 pt-1.5 text-[10px] text-gov-muted font-mono">
                            <span>
                                {isGerman
                                    ? "Eingabe zum Senden · Shift+Enter für Zeilenumbruch"
                                    : "Press Enter to send · Shift+Enter for new line"}
                            </span>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
