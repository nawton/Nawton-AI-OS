"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type ChatMessageDTO = { id: string; role: "USER" | "ASSISTANT"; content: string };

const SUGGESTIONS = ["Hur går företaget idag?", "Vad borde jag fokusera på?", "Vilka problem behöver lösas?"];

export function ChatClient({ conversationId, initialMessages }: { conversationId: string; initialMessages: ChatMessageDTO[] }) {
  const [messages, setMessages] = useState<ChatMessageDTO[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    if (!text.trim() || pending) return;
    const userMsg: ChatMessageDTO = { id: crypto.randomUUID(), role: "USER", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "ASSISTANT", content: data.reply ?? "Något gick fel." }]);
    } catch {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "ASSISTANT", content: "Kunde inte nå AI-tjänsten just nu." }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col rounded-(--radius-lg) border border-border-hairline bg-surface-1">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-text-muted">Fråga mig vad som helst om företaget — jag svarar med er riktiga data.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border-strong bg-surface-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-3"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex", m.role === "USER" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] whitespace-pre-line rounded-(--radius-md) px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "USER"
                        ? "bg-accent text-white"
                        : "border border-border-hairline bg-surface-2 text-text-secondary",
                    )}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {pending ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="rounded-(--radius-md) border border-border-hairline bg-surface-2 px-4 py-2.5 text-sm text-text-muted">
                  Analyserar…
                </div>
              </motion.div>
            ) : null}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border-hairline p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv ett meddelande…"
          className="h-10 flex-1 rounded-(--radius-md) border border-border-strong bg-surface-2 px-3 text-sm text-text-primary outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-(--radius-md) bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
        >
          Skicka
        </button>
      </form>
    </div>
  );
}
