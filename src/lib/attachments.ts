// Attachment handling for multimodal chat: images, PDFs, text, CAD, and audio.

export type AttachmentKind = "image" | "pdf" | "text" | "cad" | "audio" | "other";

export interface Attachment {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: AttachmentKind;
  /** Data URL for preview / sending to AI. */
  dataUrl: string;
  /** For text-like files, the decoded text content (inlined into prompt). */
  text?: string;
}

const TEXT_EXT = /\.(txt|md|csv|json|yaml|yml|xml|log|tsv)$/i;
const CAD_EXT = /\.(step|stp|stl|dwg|dxf|iges|igs|obj|3dm|sldprt|ipt|sat)$/i;

export function detectKind(file: File): AttachmentKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("text/") || TEXT_EXT.test(file.name) || file.type.includes("json")) return "text";
  if (CAD_EXT.test(file.name)) return "cad";
  return "other";
}

export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export async function buildAttachment(file: File): Promise<Attachment> {
  const kind = detectKind(file);
  const dataUrl = await fileToDataUrl(file);
  let text: string | undefined;
  if (kind === "text" && file.size < 200_000) {
    text = await file.text();
  }
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    kind,
    dataUrl,
    text,
  };
}

/** Convert an audio Blob (from MediaRecorder) into an Attachment. */
export async function buildAudioAttachment(blob: Blob, name = "voice-note.webm"): Promise<Attachment> {
  const dataUrl = await fileToDataUrl(blob);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    mime: blob.type || "audio/webm",
    size: blob.size,
    kind: "audio",
    dataUrl,
  };
}

/**
 * Build an OpenAI-compatible `content` array for a user message that may include
 * text and attachments. Falls back to a plain string when there are no attachments.
 */
export function buildUserContent(text: string, attachments: Attachment[]): any {
  if (!attachments || attachments.length === 0) return text;

  const parts: any[] = [];
  // Inline text-like attachments and CAD/other (as descriptors) into the leading text block.
  const inlineLines: string[] = [];
  for (const a of attachments) {
    if (a.kind === "text" && a.text) {
      inlineLines.push(`\n--- File: ${a.name} (${a.mime}, ${a.size}B) ---\n${a.text}\n--- end ${a.name} ---`);
    } else if (a.kind === "cad" || a.kind === "other") {
      inlineLines.push(
        `\n[Attached file: ${a.name} — ${a.mime || "binary"}, ${Math.round(a.size / 1024)} KB. ` +
        `Treat as engineering input the user wants you to analyze / reference.]`
      );
    }
  }
  const fullText = (text || "").trim() + (inlineLines.length ? "\n" + inlineLines.join("\n") : "");
  parts.push({ type: "text", text: fullText || "Analyze the attached files." });

  for (const a of attachments) {
    if (a.kind === "image") {
      parts.push({ type: "image_url", image_url: { url: a.dataUrl } });
    } else if (a.kind === "pdf") {
      parts.push({
        type: "file",
        file: { filename: a.name, file_data: a.dataUrl },
      });
    } else if (a.kind === "audio") {
      const base64 = a.dataUrl.split(",")[1] || "";
      const format = a.mime.includes("webm") ? "webm" :
        a.mime.includes("mp4") || a.mime.includes("m4a") ? "m4a" :
        a.mime.includes("mpeg") || a.mime.includes("mp3") ? "mp3" :
        a.mime.includes("wav") ? "wav" : "webm";
      parts.push({ type: "input_audio", input_audio: { data: base64, format } });
    }
  }
  return parts;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}