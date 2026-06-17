const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`;

export async function synthesizeSpeech(text: string, voiceId?: string): Promise<HTMLAudioElement> {
  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ text, voiceId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `TTS failed (${res.status})`);
  }
  const data = await res.json();
  const audio = new Audio(`data:${data.mime || "audio/mpeg"};base64,${data.audio}`);
  return audio;
}