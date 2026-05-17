import { analyzeArchitecture, type WizardInput } from "@/lib/architect";
import { enrichWithFreeAi } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const input = (await request.json()) as WizardInput;
  const analysis = analyzeArchitecture(input);
  const ai = await enrichWithFreeAi(input, analysis);

  return Response.json({ ...analysis, aiNotes: ai.notes, aiStatus: { provider: ai.provider, model: ai.model, ok: ai.ok, message: ai.message } });
}
