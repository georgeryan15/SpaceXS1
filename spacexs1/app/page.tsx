"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { S1FilingHTML } from "@/lib/s1-content";

type Tab = "chat" | "filing";
type Role = "user" | "assistant";
type Message = { id: string; role: Role; text: string; ts: string };

const SUGGESTIONS = [
  { label: "Summarize the principal risk factors", hint: "§ RISK FACTORS" },
  { label: "How will SpaceX use the IPO proceeds?", hint: "§ USE OF PROCEEDS" },
  { label: "Break down FY2025 revenue growth", hint: "§ MD&A" },
  { label: "Explain the dual-class voting structure", hint: "§ OFFERING" },
];

function nowStamp() {
  const d = new Date();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}Z`;
}

export default function Page() {
  const [tab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previousResponseIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || thinking) return;
    setInput("");
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", text: q, ts: nowStamp() },
    ]);
    setThinking(true);

    let reply: string;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          previousResponseId: previousResponseIdRef.current,
        }),
      });
      const data = (await res.json()) as {
        text?: string;
        responseId?: string;
        error?: string;
      };
      if (!res.ok) {
        reply = `[ ERROR ] ${data.error ?? `Request failed (${res.status}).`}`;
      } else {
        reply = data.text?.trim() || "[ no content returned ]";
        if (data.responseId) previousResponseIdRef.current = data.responseId;
      }
    } catch (err) {
      reply = `[ ERROR ] ${err instanceof Error ? err.message : "Network error."}`;
    }

    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply,
        ts: nowStamp(),
      },
    ]);
    setThinking(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-bg">
      <header className="mx-auto w-full max-w-[1400px] px-6 pt-8">
        <div className="text-center">
          <h1 className="font-display uppercase tracking-[0.02em] text-[36px] sm:text-[48px] lg:text-[60px] leading-[0.95] text-fg">
            SpaceX has filed for IPO
          </h1>
          <p className="mt-2 text-[13px] sm:text-[14px] leading-snug text-mute font-body tracking-tight max-w-[640px] mx-auto">
            Ask questions about the S-1 prospectus and get grounded answers pulled straight from the filing.
          </p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center mx-auto w-full max-w-[1400px] px-6 py-10">
        <div className="w-full">
          {tab === "chat" ? (
            <Chat
              messages={messages}
              thinking={thinking}
              input={input}
              setInput={setInput}
              send={send}
              onKey={onKey}
              inputRef={inputRef}
              scrollRef={scrollRef}
            />
          ) : (
            <Filing />
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function Chat({
  messages,
  thinking,
  input,
  setInput,
  send,
  onKey,
  inputRef,
  scrollRef,
}: {
  messages: Message[];
  thinking: boolean;
  input: string;
  setInput: (v: string) => void;
  send: (q: string) => void;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const empty = messages.length === 0 && !thinking;
  const disabled = !input.trim() || thinking;
  return (
    <div className="relative border border-hair bg-panel/60 backdrop-blur-[1px] corners">
      <span className="corner-b" />
      <div
        ref={scrollRef}
        className="relative h-[60vh] min-h-[460px] overflow-y-auto px-4 sm:px-7 py-7 scanlines"
      >
        {empty ? (
          <EmptyState onPick={send} />
        ) : (
          <div className="space-y-6">
            {messages.map((m) => (
              <MessageRow key={m.id} m={m} />
            ))}
            {thinking && <Thinking />}
          </div>
        )}
      </div>

      <div className="border-t border-hair p-3">
        <div className="relative flex items-center gap-3 border border-hair-strong bg-bg/60 px-3 h-12 focus-within:border-accent transition-colors">
          <span className="font-mono text-[12px] text-accent leading-none">»</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder="Ask a question…"
            className="flex-1 resize-none bg-transparent outline-none text-[14px] leading-6 text-fg placeholder:text-mute font-body tracking-tight self-center"
          />
          <button
            onClick={() => send(input)}
            disabled={disabled}
            aria-label="Send message"
            className="grid place-items-center w-8 h-8 bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionsPanel() {
  const sections = [
    "Cover Page",
    "Prospectus Summary",
    "The Offering",
    "Risk Factors",
    "Use of Proceeds",
    "MD&A",
    "Principal Stockholders",
  ];
  return (
    <div className="relative border border-hair bg-panel/40 corners">
      <span className="corner-b" />
      <div className="flex items-center justify-between px-3 py-2 border-b border-hair">
        <span className="font-display uppercase tracking-[0.22em] text-[11.5px] text-fg">
          Sections
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
          TOC
        </span>
      </div>
      <div className="px-3 py-3">
        {sections.map((s, i) => (
          <button
            key={s}
            className="w-full flex items-center justify-between py-1.5 text-left text-[12.5px] text-dim hover:text-fg transition-colors group"
          >
            <span className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-faint group-hover:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s}
            </span>
            <span className="font-mono text-[10px] text-faint group-hover:text-accent">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-mute mb-7">
        ◇ AWAITING QUERY
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[640px]">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onPick(s.label)}
            className="group text-left border border-hair hover:border-accent hover:bg-accent/[0.04] px-3.5 py-3 transition-colors"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute group-hover:text-accent">
              {s.hint}
            </div>
            <div className="mt-1 text-[13.5px] text-fg leading-snug">
              {s.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageRow({ m }: { m: Message }) {
  if (m.role === "user") {
    return (
      <div className="fade-up flex justify-end">
        <div className="relative max-w-[78%] border border-hair-strong bg-panel/70 corners">
          <span className="corner-b" />
          <div className="px-4 py-3 text-[14.5px] leading-[1.55] text-fg whitespace-pre-wrap font-body tracking-tight">
            {m.text}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fade-up">
      <AssistantMarkdown text={m.text} />
    </div>
  );
}

function AssistantMarkdown({ text }: { text: string }) {
  return (
    <div className="prose-chat font-body tracking-tight text-[14.5px] leading-[1.65] text-fg max-w-[80ch]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function Thinking() {
  return (
    <div className="fade-up flex items-center h-7">
      <span className="think-dots">
        <span /> <span /> <span />
      </span>
      <span className="ml-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-mute">
        Searching the IPO Filing
      </span>
    </div>
  );
}

function Filing() {
  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-8">
      <section className="relative">
        <div className="relative border border-hair bg-panel/60 corners">
          <span className="corner-b" />
          <div className="px-6 sm:px-12 py-10 max-h-[78vh] overflow-y-auto">
            <div className="max-w-[760px] mx-auto">
              <S1FilingHTML />
            </div>
          </div>
        </div>
      </section>

      <aside className="hidden lg:block">
        <SectionsPanel />
      </aside>
    </div>
  );
}
