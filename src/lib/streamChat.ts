export type ChatMsg = { role: "user" | "assistant"; content: string | any[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface StreamChatOptions {
  messages: ChatMsg[];
  model?: string;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Streams chat completions from the Lovable AI gateway via the chat edge function.
 * Includes exponential-backoff retry for transient errors (429, 5xx, network).
 */
export async function streamChat(opts: StreamChatOptions) {
  const { messages, model, signal, onDelta, onDone, onError } = opts;

  const MAX_ATTEMPTS = 3;
  let attempt = 0;
  let lastError: string | null = null;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    let resp: Response;
    try {
      resp = await fetch(CHAT_URL, {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, model }),
      });
    } catch (e: any) {
      if (signal?.aborted) {
        onDone();
        return;
      }
      lastError = e?.message || "Network error";
      // Retry network errors with backoff
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * Math.pow(2, attempt - 1));
        continue;
      }
      onError?.(`Network error after ${attempt} attempts. Check your connection.`);
      onDone();
      return;
    }

    // Handle non-OK responses
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
      const errMsg = data.error || `Error ${resp.status}`;

      if (resp.status === 402) {
        onError?.("AI usage limit reached. Please add credits to your workspace to continue.");
        onDone();
        return;
      }
      if (resp.status === 429) {
        // Retry rate limits with exponential backoff
        if (attempt < MAX_ATTEMPTS) {
          const backoff = 1000 * Math.pow(2, attempt - 1) + Math.random() * 500;
          lastError = errMsg;
          await sleep(backoff);
          continue;
        }
        onError?.("Rate limit exceeded. Please wait a moment and try again.");
        onDone();
        return;
      }
      if (resp.status >= 500 && attempt < MAX_ATTEMPTS) {
        // Retry server errors
        lastError = errMsg;
        await sleep(800 * Math.pow(2, attempt - 1));
        continue;
      }
      onError?.(errMsg);
      onDone();
      return;
    }

    if (!resp.body) {
      onError?.("No response stream received from AI.");
      onDone();
      return;
    }

    // Successfully connected — stream the body
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamDone = false;

    try {
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }

      onDone();
      return;
    } catch (e: any) {
      if (signal?.aborted) {
        onDone();
        return;
      }
      lastError = e?.message || "Stream interrupted";
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * Math.pow(2, attempt - 1));
        continue;
      }
      onError?.(`Stream error: ${lastError}`);
      onDone();
      return;
    }
  }

  onError?.(lastError || "Failed to get AI response.");
  onDone();
}
