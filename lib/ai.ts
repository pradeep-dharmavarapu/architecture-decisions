import type { ArchitectureAnalysis, WizardInput } from "@/lib/architect";

const OLLAMA_TIMEOUT_MS = 4500;
const GEMINI_TIMEOUT_MS = 6000;

export type AiEnrichment = NonNullable<ArchitectureAnalysis["aiStatus"]> & {
  notes?: string;
};

function controller(timeout: number) {
  const abortController = new AbortController();
  const id = setTimeout(() => abortController.abort(), timeout);
  return { abortController, clear: () => clearTimeout(id) };
}

export async function enrichWithFreeAi(input: WizardInput, analysis: ArchitectureAnalysis): Promise<AiEnrichment> {
  if (process.env.GEMINI_API_KEY) {
    return askGemini(input, analysis);
  }

  if (process.env.AI_PROVIDER === "local" || process.env.OLLAMA_BASE_URL) {
    return askOllama(input, analysis);
  }

  return {
    provider: "none",
    ok: false,
    message: "No hosted AI key is configured. Showing deterministic architecture engine output only."
  };
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

    if (!response.ok) {
      return {
        provider: "ollama" as const,
        model,
        ok: false,
        message: `Ollama request failed with HTTP ${response.status}.`
      };
    }
    const json = (await response.json()) as { response?: string };
    const notes = json.response?.trim();
    return {
      provider: "ollama" as const,
      model,
      ok: Boolean(notes),
      message: notes ? "Local Ollama generated the AI second opinion." : "Ollama returned an empty response.",
      notes
    };
  } catch (error) {
    return {
      provider: "ollama" as const,
      model,
      ok: false,
      message: error instanceof Error ? `Ollama request failed: ${error.message}` : "Ollama request failed."
    };
  } finally {
    clear();
  }
}

async function askGemini(input: WizardInput, analysis: ArchitectureAnalysis) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
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

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        provider: "gemini" as const,
        model,
        ok: false,
        message: `Gemini request failed with HTTP ${response.status}${errorText ? `: ${errorText.slice(0, 180)}` : "."}`
      };
    }
    const json = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const notes = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return {
      provider: "gemini" as const,
      model,
      ok: Boolean(notes),
      message: notes ? "Gemini generated the AI second opinion." : "Gemini returned an empty response.",
      notes
    };
  } catch (error) {
    return {
      provider: "gemini" as const,
      model,
      ok: false,
      message: error instanceof Error ? `Gemini request failed: ${error.message}` : "Gemini request failed."
    };
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
