export const AI_MODEL_OPTIONS = [
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", description: "Fast balanced design reasoning" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Deep technical reasoning" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Lower latency design iteration" },
  { value: "openai/gpt-5", label: "GPT-5", description: "High-accuracy engineering analysis" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini", description: "Fast strong reasoning" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano", description: "Ultra-fast lightweight" },
  { value: "openai/gpt-5.2", label: "GPT-5.2", description: "Advanced complex problem solving" },
] as const;

export const DEFAULT_AI_MODEL = AI_MODEL_OPTIONS[0].value;

export const AI_MODELS = new Set(AI_MODEL_OPTIONS.map((model) => model.value));