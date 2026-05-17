import type { ArchitectureAnalysis, WizardInput } from "@/lib/architect";

const OLLAMA_TIMEOUT_MS = 4500;
const GEMINI_TIMEOUT_MS = 6000;

function controller(timeout: number) {
  const abortController = new AbortController();
  const id = setTimeout(() => abortController.abort(), timeout);
  return { abortController, clear: () => clearTimeout(id) };
}

export async function enrichWithFreeAi(input: WizardInput, analysis: ArchitectureAnalysis): Promise<string | undefined> {
  if (process.env.GEMINI_API_KEY) {
    return askGemini(input, analysis).catch(() => undefined);
  }

  if (process.env.AI_PROVIDER === "local" || process.env.OLLAMA_BASE_URL) {
    return askOllama(input, analysis).catch(() => undefined);
  }

  return undefined;
}

async function askOllama(input: WizardInput, analysis: ArchitectureAnalysis) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.1";
  const { abortController, clear } = controller(OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: abortController.signal,
      body: JSON.stringify({
        model,
        stream: false,
        prompt: prompt(input, analysis)
      })
    });

    if (!response.ok) return undefined;
    const json = (await response.json()) as { response?: string };
    return json.response?.trim();
  } finally {
    clear();
  }
}

async function askGemini(input: WizardInput, analysis: ArchitectureAnalysis) {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const { abortController, clear } = controller(GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: abortController.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt(input, analysis) }] }],
        generationConfig: { temperature: 0.35, maxOutputTokens: 600 }
      })
    });

    if (!response.ok) return undefined;
    const json = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } finally {
    clear();
  }
}

function prompt(input: WizardInput, analysis: ArchitectureAnalysis) {
  return `You are a pragmatic principal software architect. Review this stack recommendation and add a concise second opinion.

Project:
${JSON.stringify(input, null, 2)}

Current recommendation:
${JSON.stringify(analysis.manifest, null, 2)}

Return 4 short bullets: strongest choice, riskiest assumption, cheapest viable simplification, and one next validation question.`;
}
