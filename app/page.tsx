"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, BrainCircuit, Check, Copy, Download, FileJson, FileText, Gauge, GitBranch, Loader2, Network, Sparkles } from "lucide-react";
import { create } from "zustand";
import { Button, Field, Input, Pill, Select, Textarea } from "@/components/ui";
import type { ArchitectureAnalysis, WizardInput } from "@/lib/architect";
import { cn } from "@/lib/utils";

const defaultInput: WizardInput = {
  projectType: "saas",
  productSummary: "A collaborative product for teams that needs strong recommendations, clean onboarding, and production-grade architecture.",
  scale: "mvp",
  timeline: "normal",
  budget: "lean",
  compliance: ["none"],
  teamSize: "small",
  seniority: "mixed",
  language: "typescript",
  cloud: "agnostic",
  architecturePreference: "modular-monolith",
  features: ["auth", "dashboard", "payments"],
  dataProfile: "transactional",
  authComplexity: "rbac",
  seo: "moderate",
  latency: "normal",
  uptime: "standard",
  aiFeatures: "assistant"
};

const steps = [
  { title: "Project DNA", icon: Sparkles },
  { title: "Scale & Rules", icon: Gauge },
  { title: "Team Profile", icon: BrainCircuit },
  { title: "Feature Matrix", icon: GitBranch },
  { title: "AI Analysis", icon: Network }
];

type Store = {
  input: WizardInput;
  analysis?: ArchitectureAnalysis;
  loading: boolean;
  setInput: (patch: Partial<WizardInput>) => void;
  setAnalysis: (analysis?: ArchitectureAnalysis) => void;
  setLoading: (loading: boolean) => void;
};

const useArchitectStore = create<Store>((set) => ({
  input: defaultInput,
  loading: false,
  setInput: (patch) => set((state) => ({ input: { ...state.input, ...patch } })),
  setAnalysis: (analysis) => set({ analysis }),
  setLoading: (loading) => set({ loading })
}));

const featureOptions = [
  ["auth", "Auth"],
  ["dashboard", "Dashboards"],
  ["payments", "Payments"],
  ["realtime", "Realtime"],
  ["collaboration", "Collaboration"],
  ["search", "Search"],
  ["files", "File storage"],
  ["i18n", "I18n"],
  ["trpc", "tRPC"],
  ["mobile", "Mobile clients"]
];

const complianceOptions = [
  ["none", "None"],
  ["gdpr", "GDPR"],
  ["soc2", "SOC 2"],
  ["hipaa", "HIPAA"],
  ["pci", "PCI-DSS"]
];

export default function Home() {
  const [step, setStep] = useState(0);
  const { input, analysis, loading, setInput, setAnalysis, setLoading } = useArchitectStore();
  const diagramRef = useRef<HTMLDivElement>(null);
  const canAnalyze = input.productSummary.trim().length > 16;

  async function analyze() {
    setLoading(true);
    setAnalysis(undefined);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const json = (await response.json()) as ArchitectureAnalysis;
      setAnalysis(json);
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  function toggleList<K extends "features" | "compliance">(key: K, value: string) {
    const current = input[key];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current.filter((item) => item !== "none"), value];
    setInput({ [key]: next.length ? next : ["none"] } as Partial<WizardInput>);
  }

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-4 pt-6 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs font-semibold text-ink/70 shadow-sm">
            <BrainCircuit className="h-3.5 w-3.5 text-ocean" />
            Production-grade stack decisions in minutes
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-normal text-ink md:text-6xl">TechStack Architect AI</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/68 md:text-lg">
            Interview your project, detect architectural conflicts, score trade-offs, and export a complete system diagram plus stack manifest.
          </p>
        </div>
        <div className="glass grid min-w-[280px] gap-3 rounded-lg p-4">
          <Metric label="Team fit" value={analysis?.scores.teamFit ?? 88} suffix="%" />
          <Metric label="Complexity" value={analysis?.scores.complexity ?? 4} suffix="/10" />
          <Metric label="Scale readiness" value={analysis?.scores.scalability ?? 82} suffix="%" />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-4 md:px-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass h-fit rounded-lg p-3">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                className={cn("flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition", step === index ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5")}
                onClick={() => setStep(index)}
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", step === index ? "bg-white/15" : "bg-white/70")}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-bold">{item.title}</span>
                  <span className={cn("text-xs", step === index ? "text-white/65" : "text-ink/45")}>Step {index + 1}</span>
                </span>
              </button>
            );
          })}
        </aside>

        <div className="grid gap-5">
          <section className="glass rounded-lg p-5 shadow-soft md:p-6">
            {step === 0 && <ProjectStep input={input} setInput={setInput} />}
            {step === 1 && <ScaleStep input={input} setInput={setInput} toggleList={toggleList} />}
            {step === 2 && <TeamStep input={input} setInput={setInput} />}
            {step === 3 && <FeatureStep input={input} setInput={setInput} toggleList={toggleList} />}
            {step === 4 && <AnalysisStep analysis={analysis} loading={loading} input={input} diagramRef={diagramRef} />}

            <div className="mt-6 flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="secondary" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row">
                {step < 3 ? (
                  <Button onClick={() => setStep((value) => value + 1)}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button disabled={!canAnalyze || loading} onClick={analyze}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                    Run architecture analysis
                  </Button>
                )}
              </div>
            </div>
          </section>

          {analysis ? <Results analysis={analysis} diagramRef={diagramRef} /> : <PreviewPanel input={input} />}
        </div>
      </section>
    </main>
  );
}

function ProjectStep({ input, setInput }: { input: WizardInput; setInput: Store["setInput"] }) {
  return (
    <div className="grid gap-5">
      <StepTitle title="Project DNA" subtitle="Give the architect enough context to avoid fashionable-but-wrong defaults." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Project type">
          <Select value={input.projectType} onChange={(event) => setInput({ projectType: event.target.value })}>
            <option value="saas">SaaS product</option>
            <option value="internal">Internal tool</option>
            <option value="marketplace">Marketplace</option>
            <option value="realtime">Realtime app</option>
            <option value="dashboard">Data dashboard</option>
            <option value="cms">CMS-heavy site</option>
            <option value="ecommerce">E-commerce</option>
            <option value="api">API platform</option>
            <option value="ai-native">AI-native app</option>
          </Select>
        </Field>
        <Field label="AI capability">
          <Select value={input.aiFeatures} onChange={(event) => setInput({ aiFeatures: event.target.value })}>
            <option value="none">None for v1</option>
            <option value="assistant">Assistant / recommendations</option>
            <option value="rag">RAG knowledge workflows</option>
            <option value="agents">Agentic automation</option>
            <option value="ml">Custom ML pipeline</option>
          </Select>
        </Field>
      </div>
      <Field label="What are you building?" hint="A few concrete product nouns make the recommendation much sharper.">
        <Textarea value={input.productSummary} onChange={(event) => setInput({ productSummary: event.target.value })} />
      </Field>
    </div>
  );
}

function ScaleStep({ input, setInput, toggleList }: { input: WizardInput; setInput: Store["setInput"]; toggleList: (key: "features" | "compliance", value: string) => void }) {
  return (
    <div className="grid gap-5">
      <StepTitle title="Scale & Rules" subtitle="Reliability, compliance, and budget shape the stack more than framework taste." />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Scale expectation">
          <Select value={input.scale} onChange={(event) => setInput({ scale: event.target.value })}>
            <option value="mvp">Solo MVP</option>
            <option value="startup">Startup growth</option>
            <option value="scaleup">Scale-up</option>
            <option value="enterprise">Enterprise scale</option>
          </Select>
        </Field>
        <Field label="Timeline pressure">
          <Select value={input.timeline} onChange={(event) => setInput({ timeline: event.target.value })}>
            <option value="urgent">Urgent launch</option>
            <option value="normal">Normal roadmap</option>
            <option value="long">Long-horizon platform</option>
          </Select>
        </Field>
        <Field label="Budget">
          <Select value={input.budget} onChange={(event) => setInput({ budget: event.target.value })}>
            <option value="lean">Lean</option>
            <option value="balanced">Balanced</option>
            <option value="enterprise">Enterprise</option>
          </Select>
        </Field>
      </div>
      <OptionGrid title="Compliance" options={complianceOptions} values={input.compliance} onToggle={(value) => toggleList("compliance", value)} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Latency target">
          <Select value={input.latency} onChange={(event) => setInput({ latency: event.target.value })}>
            <option value="normal">Normal web app</option>
            <option value="sub-200">Under 200ms</option>
            <option value="sub-100">Under 100ms</option>
          </Select>
        </Field>
        <Field label="Uptime target">
          <Select value={input.uptime} onChange={(event) => setInput({ uptime: event.target.value })}>
            <option value="standard">99.9%</option>
            <option value="high">99.99%</option>
            <option value="five-nines">99.999%</option>
          </Select>
        </Field>
        <Field label="Cloud stance">
          <Select value={input.cloud} onChange={(event) => setInput({ cloud: event.target.value })}>
            <option value="agnostic">Cloud agnostic</option>
            <option value="aws">AWS</option>
            <option value="gcp">GCP</option>
            <option value="azure">Azure</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function TeamStep({ input, setInput }: { input: WizardInput; setInput: Store["setInput"] }) {
  return (
    <div className="grid gap-5">
      <StepTitle title="Team Profile" subtitle="A great stack is one your team can actually ship, debug, and own." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Team size">
          <Select value={input.teamSize} onChange={(event) => setInput({ teamSize: event.target.value })}>
            <option value="solo">Solo developer</option>
            <option value="small">2-5 engineers</option>
            <option value="medium">6-15 engineers</option>
            <option value="large">16+ engineers</option>
          </Select>
        </Field>
        <Field label="Seniority mix">
          <Select value={input.seniority} onChange={(event) => setInput({ seniority: event.target.value })}>
            <option value="junior-heavy">Junior-heavy</option>
            <option value="mixed">Mixed</option>
            <option value="senior-heavy">Senior-heavy</option>
          </Select>
        </Field>
        <Field label="Language preference">
          <Select value={input.language} onChange={(event) => setInput({ language: event.target.value })}>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="java">Java/Kotlin</option>
            <option value="dotnet">.NET</option>
            <option value="none">No mandate</option>
          </Select>
        </Field>
        <Field label="Architecture preference">
          <Select value={input.architecturePreference} onChange={(event) => setInput({ architecturePreference: event.target.value })}>
            <option value="modular-monolith">Modular monolith</option>
            <option value="serverless">Serverless-first</option>
            <option value="microservices">Microservices</option>
            <option value="monolith">Simple monolith</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function FeatureStep({ input, setInput, toggleList }: { input: WizardInput; setInput: Store["setInput"]; toggleList: (key: "features" | "compliance", value: string) => void }) {
  return (
    <div className="grid gap-5">
      <StepTitle title="Feature Matrix" subtitle="Capabilities reveal hidden platform needs: queues, search, edge, auth depth, and analytics." />
      <OptionGrid title="Product capabilities" options={featureOptions} values={input.features} onToggle={(value) => toggleList("features", value)} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Data profile">
          <Select value={input.dataProfile} onChange={(event) => setInput({ dataProfile: event.target.value })}>
            <option value="transactional">Transactional</option>
            <option value="read-heavy">Read-heavy</option>
            <option value="write-heavy">Write-heavy</option>
            <option value="analytics">Analytics-heavy</option>
          </Select>
        </Field>
        <Field label="Auth complexity">
          <Select value={input.authComplexity} onChange={(event) => setInput({ authComplexity: event.target.value })}>
            <option value="basic">Basic login</option>
            <option value="rbac">RBAC</option>
            <option value="sso">Enterprise SSO</option>
            <option value="mfa">MFA + audit logs</option>
          </Select>
        </Field>
        <Field label="SEO importance">
          <Select value={input.seo} onChange={(event) => setInput({ seo: event.target.value })}>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function AnalysisStep({ analysis, loading, input, diagramRef }: { analysis?: ArchitectureAnalysis; loading: boolean; input: WizardInput; diagramRef: React.RefObject<HTMLDivElement | null> }) {
  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center text-center">
        <div>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-ocean" />
          <h2 className="mt-5 text-2xl font-black">Reasoning through the stack</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">Scoring team fit, conflict risk, cost pressure, data shape, AI needs, and deployment paths.</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="grid gap-5">
        <StepTitle title="Ready for Analysis" subtitle="The backend will produce decisions, conflicts, scores, a diagram, and an exportable manifest." />
        <PreviewPanel input={input} compact />
      </div>
    );
  }

  return <AnalysisHero analysis={analysis} diagramRef={diagramRef} />;
}

function Results({ analysis, diagramRef }: { analysis: ArchitectureAnalysis; diagramRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <DecisionCards analysis={analysis} />
        <ExportPanel analysis={analysis} diagramRef={diagramRef} />
      </div>
    </section>
  );
}

function AnalysisHero({ analysis, diagramRef }: { analysis: ArchitectureAnalysis; diagramRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="grid gap-5">
      <StepTitle title="Recommended Architecture" subtitle={analysis.executiveSummary} />
      <div className="grid gap-3 md:grid-cols-4">
        <Score label="Team fit" value={`${analysis.scores.teamFit}%`} tone="good" />
        <Score label="Complexity" value={`${analysis.scores.complexity}/10`} tone="warn" />
        <Score label="Cost pressure" value={`${analysis.scores.cost}/10`} tone="info" />
        <Score label="Scale readiness" value={`${analysis.scores.scalability}%`} tone="good" />
      </div>
      {analysis.conflicts.length ? (
        <div className="rounded-lg border border-clay/25 bg-clay/10 p-4">
          <div className="flex items-center gap-2 font-bold text-clay">
            <AlertTriangle className="h-4 w-4" />
            Conflict detection
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink/70">
            {analysis.conflicts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-moss/20 bg-moss/10 p-4 text-sm font-semibold text-moss">
          <Check className="h-4 w-4" />
          No major architecture conflicts detected.
        </div>
      )}
      <Diagram mermaid={analysis.mermaid} diagramRef={diagramRef} />
    </div>
  );
}

function DecisionCards({ analysis }: { analysis: ArchitectureAnalysis }) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">Trade-off Cards</h2>
        <Pill tone="info">{analysis.decisions.length} layers</Pill>
      </div>
      <div className="grid gap-3">
        {analysis.decisions.map((decision) => (
          <article key={decision.layer} className="rounded-lg border border-ink/10 bg-white/70 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Pill>{decision.layer}</Pill>
                <h3 className="mt-3 text-lg font-black">{decision.recommendation}</h3>
              </div>
              <Pill tone="good">{decision.confidence}% confidence</Pill>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/65">{decision.why}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <MiniList title="What you give up" items={decision.tradeoffs} />
              <MiniList title="Alternatives" items={decision.alternatives} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Diagram({ mermaid, diagramRef }: { mermaid: string; diagramRef: React.RefObject<HTMLDivElement | null> }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let mounted = true;
    import("mermaid").then(async ({ default: mermaidApi }) => {
      mermaidApi.initialize({ startOnLoad: false, securityLevel: "loose", theme: "base" });
      const rendered = await mermaidApi.render(`architecture-${Date.now()}`, mermaid);
      if (mounted) setSvg(rendered.svg);
    });
    return () => {
      mounted = false;
    };
  }, [mermaid]);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">Architecture Diagram</h2>
        <Pill tone="info">Mermaid</Pill>
      </div>
      <div ref={diagramRef} className="grid-paper overflow-auto rounded-lg border border-ink/10 bg-white p-4">
        {svg ? <div className="min-w-[680px]" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="grid min-h-72 place-items-center text-sm text-ink/50">Rendering diagram...</div>}
      </div>
      <Textarea readOnly value={mermaid} className="font-mono text-xs" />
    </div>
  );
}

function ExportPanel({ analysis, diagramRef }: { analysis: ArchitectureAnalysis; diagramRef: React.RefObject<HTMLDivElement | null> }) {
  async function copyMermaid() {
    await navigator.clipboard.writeText(analysis.mermaid);
  }

  function download(name: string, type: string, content: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPng() {
    if (!diagramRef.current) return;
    const { toPng } = await import("html-to-image");
    const url = await toPng(diagramRef.current, { backgroundColor: "#ffffff", pixelRatio: 2 });
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "architecture-diagram.png";
    anchor.click();
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("TechStack Architect AI Report", 14, 18);
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(`${analysis.executiveSummary}\n\n${analysis.decisions.map((item) => `${item.layer}: ${item.recommendation}\nWhy: ${item.why}`).join("\n\n")}`, 180);
    pdf.text(lines, 14, 30);
    pdf.save("techstack-architecture-report.pdf");
  }

  return (
    <aside className="glass h-fit rounded-lg p-5">
      <h2 className="text-xl font-black">Export Center</h2>
      <p className="mt-2 text-sm leading-6 text-ink/60">Download a diagram, report, Mermaid source, or machine-readable manifest.</p>
      <div className="mt-5 grid gap-3">
        <Button variant="secondary" onClick={copyMermaid}>
          <Copy className="h-4 w-4" />
          Copy Mermaid
        </Button>
        <Button variant="secondary" onClick={() => download("architecture.md", "text/markdown", `# ${analysis.title}\n\n\`\`\`mermaid\n${analysis.mermaid}\n\`\`\`\n`)}>
          <FileText className="h-4 w-4" />
          Download Mermaid MD
        </Button>
        <Button variant="secondary" onClick={() => download("stack-manifest.json", "application/json", JSON.stringify(analysis.manifest, null, 2))}>
          <FileJson className="h-4 w-4" />
          Download JSON
        </Button>
        <Button variant="secondary" onClick={downloadPng}>
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
        <Button onClick={downloadPdf}>
          <Download className="h-4 w-4" />
          Download PDF Report
        </Button>
      </div>
      {analysis.aiNotes ? (
        <div className="mt-5 rounded-lg border border-ocean/20 bg-ocean/10 p-4 text-sm leading-6 text-ink/70">
          <div className="mb-2 flex items-center gap-2 font-bold text-ocean">
            <BrainCircuit className="h-4 w-4" />
            AI second opinion
          </div>
          <div className="mb-3 text-xs font-semibold text-ocean/80">
            Provider: {analysis.aiStatus?.provider ?? "unknown"} {analysis.aiStatus?.model ? `(${analysis.aiStatus.model})` : ""}
          </div>
          {analysis.aiNotes}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-ink/10 bg-white/60 p-4 text-xs leading-5 text-ink/55">
          <div className="mb-1 font-bold text-ink/70">AI enrichment status</div>
          <div>
            Provider: {analysis.aiStatus?.provider ?? "none"} {analysis.aiStatus?.model ? `(${analysis.aiStatus.model})` : ""}
          </div>
          <div className={cn("mt-1", analysis.aiStatus?.provider === "gemini" && !analysis.aiStatus.ok && "text-clay")}>
            {analysis.aiStatus?.message ?? "No AI enrichment was attempted."}
          </div>
        </div>
      )}
    </aside>
  );
}

function PreviewPanel({ input, compact = false }: { input: WizardInput; compact?: boolean }) {
  const snapshot = useMemo(
    () => [
      ["Type", input.projectType],
      ["Scale", input.scale],
      ["Team", `${input.teamSize}, ${input.seniority}`],
      ["Features", input.features.join(", ")],
      ["Data", input.dataProfile],
      ["AI", input.aiFeatures]
    ],
    [input]
  );

  return (
    <div className={cn("glass rounded-lg p-5", compact && "bg-white/60")}>
      <h2 className="text-xl font-black">Live Input Snapshot</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {snapshot.map(([label, value]) => (
          <div key={label} className="rounded-md border border-ink/10 bg-white/70 p-3">
            <div className="text-xs font-bold uppercase text-ink/45">{label}</div>
            <div className="mt-1 text-sm font-semibold text-ink/75">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">{subtitle}</p>
    </div>
  );
}

function OptionGrid({ title, options, values, onToggle }: { title: string; options: string[][]; values: string[]; onToggle: (value: string) => void }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-ink">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {options.map(([value, label]) => (
          <button
            key={value}
            onClick={() => onToggle(value)}
            className={cn("flex min-h-11 items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-semibold transition", values.includes(value) ? "border-ink bg-ink text-white" : "border-ink/10 bg-white/75 text-ink/70 hover:bg-white")}
          >
            {label}
            {values.includes(value) ? <Check className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-ink/55">
        <span>{label}</span>
        <span>
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-ocean" style={{ width: `${suffix === "/10" ? value * 10 : value}%` }} />
      </div>
    </div>
  );
}

function Score({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "info" }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/70 p-4">
      <div className="text-xs font-bold uppercase text-ink/45">{label}</div>
      <div className={cn("mt-2 text-2xl font-black", tone === "good" && "text-moss", tone === "warn" && "text-clay", tone === "info" && "text-ocean")}>{value}</div>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase text-ink/45">{title}</div>
      <ul className="mt-2 grid gap-1 text-sm leading-6 text-ink/62">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
