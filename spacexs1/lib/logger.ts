import { appendFile, mkdir } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";

const LOG_PATH = (() => {
  const raw = process.env.CHAT_LOG_PATH ?? "logs/chat.log";
  return isAbsolute(raw) ? raw : join(process.cwd(), raw);
})();

let dirReady: Promise<void> | null = null;
function ensureDir(): Promise<void> {
  if (!dirReady) {
    dirReady = mkdir(dirname(LOG_PATH), { recursive: true }).then(() => undefined);
  }
  return dirReady;
}

type Level = "debug" | "info" | "warn" | "error";

export async function log(
  level: Level,
  event: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    await ensureDir();
    const line =
      JSON.stringify({
        ts: new Date().toISOString(),
        level,
        event,
        ...(data ?? {}),
      }) + "\n";
    await appendFile(LOG_PATH, line, "utf8");
  } catch {
    // Logging must never throw into request handling.
  }
}
