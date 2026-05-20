"use client";

import { useEffect, useRef, useState } from "react";
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

const CANNED_REPLIES: Record<string, string> = {
  risk: `Per § Risk Factors, the registrant flags four primary categories:
1. Operational — vehicle anomalies, single-customer concentration (U.S. Government = 31% of FY2025 revenue), and dependence on Starlink spectrum & laser-link performance.
2. Capital — continued capex intensity for Starship + Starlink V3; sustained profitability is recent (FY2024 onward).
3. Regulatory — FAA / FCC / DoD / ITAR exposure; NEPA reviews at Boca Chica can compress launch cadence.
4. Offering-specific — dual-class concentration (~78% voting control retained by insiders) and expected high price volatility.`,
  proceeds: `Net proceeds estimated at ~$13.4B (midpoint $94.00/share). Allocation:
• Starship vehicle & engine production — $5.2B (38.8%)
• Starlink V3 constellation — $3.6B (26.9%)
• Launch & ground infrastructure — $2.1B (15.7%)
• Working capital — $1.8B (13.4%)
• Repayment of 2027 senior secured notes — $0.7B (5.2%)`,
  revenue: `FY2025 revenue: $21.8B, up 54% YoY from $14.2B in FY2024. Drivers:
• Launch cadence expansion (187 successful orbital launches vs. 134 in FY2024)
• Starlink subscribers grew to 4.6M across 102 markets
• Adjusted gross margin expanded +720bps to 36.4%, reflecting Starship production maturity and improved utilization at Hawthorne / Roberts Road.
• Operating cash flow turned positive across all four trailing quarters.`,
  voting: `The Company is going public with a dual-class structure: Class A shares carry 1 vote each; Class B shares carry 10 votes each. The Class B shares are held by the founder and certain pre-IPO holders. Immediately after this offering, that group will retain ~78% of combined voting power, giving them effective control over board composition, M&A approvals, and amendments to the charter.`,
};

function mockReply(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("risk")) return CANNED_REPLIES.risk;
  if (t.includes("proceed") || t.includes("ipo proceeds") || t.includes("use of"))
    return CANNED_REPLIES.proceeds;
  if (t.includes("revenue") || t.includes("growth") || t.includes("md&a") || t.includes("financial"))
    return CANNED_REPLIES.revenue;
  if (t.includes("vot") || t.includes("dual") || t.includes("class"))
    return CANNED_REPLIES.voting;
  return `Acknowledged: "${q.slice(0, 96)}${q.length > 96 ? "…" : ""}"

[ PROTOTYPE NOTICE ]
The retrieval pipeline against the S-1 corpus is not yet wired to this chat. Once the backend is connected, queries will be grounded in the registration statement and cite their source paragraphs.

For now, try one of the suggested prompts — those return canned answers sourced from the filing excerpt visible under the FILING tab.`;
}

function nowStamp() {
  const d = new Date();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}Z`;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: mockReply(q),
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
      <header>
        <div className="mx-auto w-full max-w-[1400px] px-6 pt-8">
          <div className="flex items-end justify-center gap-12 sm:gap-20 border-b border-hair-strong">
            <BigTab
              active={tab === "chat"}
              label="Chat"
              onClick={() => setTab("chat")}
            />
            <BigTab
              active={tab === "filing"}
              label="Filing"
              onClick={() => setTab("filing")}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-6 pt-10 pb-12">
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
      </main>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function BigTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative -mb-px pb-5 pt-1 text-left transition-colors ${
        active ? "text-fg" : "text-faint hover:text-mute"
      }`}
    >
      <div className="font-display text-[32px] sm:text-[42px] lg:text-[54px] leading-[0.95] uppercase tracking-[0.01em] text-center">
        {label}
      </div>
      {active && (
        <>
          <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-accent" />
          <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-accent" />
        </>
      )}
    </button>
  );
}

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
      <pre className="whitespace-pre-wrap font-body tracking-tight text-[14.5px] leading-[1.65] text-fg max-w-[80ch]">
        {m.text}
      </pre>
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
        parsing prospectus
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
