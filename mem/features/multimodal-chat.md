---
name: Multimodal chat with file upload + voice
description: Users can attach images, PDFs, CAD files, text/CSV/JSON, and record voice notes in chat. Assistant replies can be spoken via ElevenLabs TTS.
type: feature
---
- Attachments are in-memory only (not persisted). Helpers in `src/lib/attachments.ts`.
- `buildUserContent(text, attachments)` returns an OpenAI-compatible content array with `image_url` (data URI), `file` (PDF), `input_audio` (base64) parts. CAD and text files are inlined into the prompt as descriptors/text.
- The chat edge function auto-routes multimodal requests to `google/gemini-2.5-flash`.
- TTS uses ElevenLabs via `supabase/functions/tts/index.ts`, called from `src/lib/tts.ts`. Default voice: George (`JBFqnCBsd6RMkjVDRZzb`). Markdown + DESIGN blocks stripped before speaking.
- Mic recording uses browser `MediaRecorder` (webm preferred, m4a fallback on Safari).
- Connector: ElevenLabs (standard connector) provides `ELEVENLABS_API_KEY`.