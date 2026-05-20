import OpenAI from "openai";
import { log } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";
const VECTOR_STORE_ID =
  process.env.OPENAI_VECTOR_STORE_ID ?? "vs_6a0e30e07fbc81919a9cd1d4816f2ec4";

const SYSTEM_INSTRUCTIONS = `You are an analyst answering questions about the SpaceX S-1 registration statement.
Ground every answer in the documents available via the file_search tool. When you cite a figure or claim, briefly indicate the section it came from (e.g. "Risk Factors", "MD&A").
If the filing does not address a question, say so plainly rather than guessing.
Prefer concise prose with short bulleted breakdowns over long paragraphs.`;

type ChatRequest = {
  message?: unknown;
  previousResponseId?: unknown;
};

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.");
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

type Citation = { fileId: string; filename?: string; index?: number };

function extractCitations(output: OpenAI.Responses.Response["output"]): Citation[] {
  const cites: Citation[] = [];
  for (const item of output) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part.type !== "output_text") continue;
      for (const a of part.annotations ?? []) {
        if (a.type === "file_citation") {
          cites.push({ fileId: a.file_id, filename: a.filename, index: a.index });
        }
      }
    }
  }
  return cites;
}

export async function POST(req: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const previousResponseId =
    typeof body.previousResponseId === "string" && body.previousResponseId.length > 0
      ? body.previousResponseId
      : undefined;

  if (!message) {
    return Response.json({ error: "`message` is required." }, { status: 400 });
  }

  await log("info", "chat.request", {
    requestId,
    model: MODEL,
    previousResponseId,
    messageLength: message.length,
  });

  const started = Date.now();
  try {
    const response = await client().responses.create({
      model: MODEL,
      input: message,
      instructions: previousResponseId ? undefined : SYSTEM_INSTRUCTIONS,
      previous_response_id: previousResponseId,
      tools: [
        {
          type: "file_search",
          vector_store_ids: [VECTOR_STORE_ID],
        },
      ],
    });

    const text = response.output_text ?? "";
    const citations = extractCitations(response.output);

    await log("info", "chat.response", {
      requestId,
      responseId: response.id,
      durationMs: Date.now() - started,
      usage: response.usage,
      textLength: text.length,
      citationCount: citations.length,
    });

    return Response.json({
      text,
      responseId: response.id,
      citations,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = err instanceof OpenAI.APIError ? err.status ?? 500 : 500;
    await log("error", "chat.error", {
      requestId,
      durationMs: Date.now() - started,
      status,
      message,
    });
    return Response.json(
      { error: "The model request failed. Check server logs for details." },
      { status: status >= 400 && status < 600 ? status : 500 },
    );
  }
}
