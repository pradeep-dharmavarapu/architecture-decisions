export type WizardInput = {
  projectType: string;
  productSummary: string;
  scale: string;
  timeline: string;
  budget: string;
  compliance: string[];
  teamSize: string;
  seniority: string;
  language: string;
  cloud: string;
  architecturePreference: string;
  features: string[];
  dataProfile: string;
  authComplexity: string;
  seo: string;
  latency: string;
  uptime: string;
  aiFeatures: string;
};

export type StackDecision = {
  layer: string;
  recommendation: string;
  why: string;
  tradeoffs: string[];
  alternatives: string[];
  confidence: number;
};

export type ArchitectureAnalysis = {
  title: string;
  executiveSummary: string;
  decisions: StackDecision[];
  conflicts: string[];
  scores: {
    teamFit: number;
    complexity: number;
    cost: number;
    scalability: number;
  };
  roadmap: string[];
  mermaid: string;
  manifest: Record<string, string | number | string[]>;
  aiNotes?: string;
  aiStatus?: {
    provider: "gemini" | "ollama" | "none";
    model?: string;
    ok: boolean;
    message: string;
  };
};

const has = (input: WizardInput, feature: string) => input.features.includes(feature);
const regulated = (input: WizardInput) => input.compliance.length > 0 && !input.compliance.includes("none");

function frontend(input: WizardInput): StackDecision {
  if (input.seo === "critical" || input.projectType === "cms" || input.projectType === "ecommerce") {
    return {
      layer: "Frontend",
      recommendation: "Next.js App Router with hybrid SSR, SSG, and ISR",
      why: "It gives strong SEO, fast content delivery, API colocation, and enough flexibility for authenticated product surfaces.",
      tradeoffs: ["More framework conventions than plain React", "Vercel deployment is smoothest, though not mandatory"],
      alternatives: ["Remix for data-heavy forms", "Astro for mostly static content", "SvelteKit for smaller teams that prefer Svelte"],
      confidence: 94
    };
  }

  if (input.projectType === "internal" && input.timeline === "urgent") {
    return {
      layer: "Frontend",
      recommendation: "Vite React with TanStack Query and Mantine",
      why: "Internal tools benefit from fast iteration, rich tables/forms, and simple client-side deployment.",
      tradeoffs: ["Weaker SEO story", "You will design more server boundaries yourself"],
      alternatives: ["Next.js for a unified full-stack app", "Retool/Appsmith for low-code admin workflows"],
      confidence: 89
    };
  }

  return {
    layer: "Frontend",
    recommendation: "Next.js App Router, Tailwind CSS, Radix/shadcn-style primitives, Zustand",
    why: "This is a balanced default for SaaS and AI-native products: productive, type-safe, deployable, and easy to hire for.",
    tradeoffs: ["Requires discipline around server/client component boundaries", "Zustand should stay local to UI state, not server cache"],
    alternatives: ["Remix", "Nuxt", "SvelteKit"],
    confidence: 91
  };
}

function backend(input: WizardInput): StackDecision {
  if (input.language === "python" || input.aiFeatures !== "none") {
    return {
      layer: "Backend",
      recommendation: "FastAPI service for AI workflows plus Next.js route handlers for BFF endpoints",
      why: "Python keeps AI, retrieval, and data science integrations ergonomic while Next.js handles product-facing endpoints quickly.",
      tradeoffs: ["Two runtimes to deploy and observe", "Shared auth/session contracts need care"],
      alternatives: ["NestJS for all-TypeScript teams", "Django for admin-heavy apps", "Go/Fiber for latency-critical APIs"],
      confidence: 88
    };
  }

  if (input.architecturePreference === "microservices" || input.scale === "enterprise") {
    return {
      layer: "Backend",
      recommendation: "Modular monolith in NestJS, split by domain boundaries before service extraction",
      why: "It preserves clear architecture under scale pressure without starting with distributed-system overhead.",
      tradeoffs: ["Heavier structure than Express/Fastify", "Service extraction still requires operational maturity later"],
      alternatives: ["Go services for high-throughput domains", "Java/Kotlin Spring for enterprise-heavy environments"],
      confidence: 90
    };
  }

  return {
    layer: "Backend",
    recommendation: "Next.js route handlers with a Fastify worker for background jobs when needed",
    why: "It keeps the MVP compact while leaving a clean path for job queues, webhooks, and integrations.",
    tradeoffs: ["Long-running workloads should move out of serverless functions", "API contracts can blur if not documented"],
    alternatives: ["FastAPI", "NestJS", "Hono on the edge"],
    confidence: 87
  };
}

function data(input: WizardInput): StackDecision {
  const vector = input.aiFeatures !== "none";
  if (input.dataProfile === "analytics") {
    return {
      layer: "Data",
      recommendation: `PostgreSQL for product data, ClickHouse for analytics${vector ? ", pgvector for retrieval" : ""}`,
      why: "Separating transactional and analytical workloads avoids slow dashboards harming core app latency.",
      tradeoffs: ["More data movement", "Requires clear event schemas from day one"],
      alternatives: ["BigQuery for managed warehouse workflows", "Single Postgres until analytics volume justifies split"],
      confidence: 92
    };
  }

  if (has(input, "realtime")) {
    return {
      layer: "Data",
      recommendation: `Supabase Postgres with realtime channels${vector ? " and pgvector" : ""}`,
      why: "It accelerates real-time product features while keeping relational integrity and SQL query power.",
      tradeoffs: ["Vendor-specific realtime primitives", "Very high fan-out may need a dedicated websocket layer"],
      alternatives: ["Firebase", "Postgres + Redis pub/sub", "DynamoDB streams"],
      confidence: 86
    };
  }

  return {
    layer: "Data",
    recommendation: `PostgreSQL with Prisma or Drizzle${vector ? ", plus pgvector for embeddings" : ""}`,
    why: "Postgres is the strongest default for most production products: relational, searchable, extensible, and familiar.",
    tradeoffs: ["Horizontal write scaling needs planning", "ORM abstractions need escape hatches for complex queries"],
    alternatives: ["MongoDB for document-heavy domains", "DynamoDB for cloud-native key-value scale", "MySQL/PlanetScale"],
    confidence: 95
  };
}

function infra(input: WizardInput): StackDecision {
  if (regulated(input) || input.scale === "enterprise" || input.uptime === "five-nines") {
    return {
      layer: "Infrastructure",
      recommendation: `${input.cloud === "agnostic" ? "AWS or GCP" : input.cloud.toUpperCase()} with Terraform, containers, managed Postgres, Redis, CDN, and private networking`,
      why: "Compliance and high uptime need explicit network control, auditability, repeatable infrastructure, and mature managed services.",
      tradeoffs: ["Higher setup effort", "More operational ownership than Vercel/Railway"],
      alternatives: ["Vercel + managed services for lower compliance burden", "Fly.io for globally distributed smaller apps"],
      confidence: 90
    };
  }

  if (input.timeline === "urgent" || input.teamSize === "solo") {
    return {
      layer: "Infrastructure",
      recommendation: "Vercel for web, Neon/Supabase for Postgres, Upstash Redis, Cloudflare for DNS/CDN",
      why: "This stack minimizes infrastructure work while preserving enough production quality for early customers.",
      tradeoffs: ["Costs can jump with traffic", "Some workloads may need migration from serverless later"],
      alternatives: ["Railway", "Render", "Fly.io"],
      confidence: 93
    };
  }

  return {
    layer: "Infrastructure",
    recommendation: "Vercel or Fly.io for app hosting with managed Postgres, Redis, object storage, and CDN",
    why: "It balances speed, global delivery, and operational simplicity for growing product teams.",
    tradeoffs: ["Less low-level control than cloud primitives", "Need cost monitors as usage grows"],
    alternatives: ["AWS ECS/Fargate", "GCP Cloud Run", "Kubernetes only after clear platform need"],
    confidence: 89
  };
}

function devops(input: WizardInput): StackDecision {
  return {
    layer: "DevOps & Observability",
    recommendation: "GitHub Actions, Sentry, OpenTelemetry, Axiom/Better Stack logs, feature flags with Flagsmith",
    why: "It covers build, release, traces, errors, logs, and progressive delivery without forcing a heavy platform team.",
    tradeoffs: ["Multiple vendors to manage", "OpenTelemetry needs consistent instrumentation"],
    alternatives: ["Datadog for one integrated paid suite", "Grafana Cloud + Prometheus for open observability"],
    confidence: input.seniority === "junior-heavy" ? 84 : 90
  };
}

function aiLayer(input: WizardInput): StackDecision {
  if (input.aiFeatures === "none") {
    return {
      layer: "AI/ML",
      recommendation: "No dedicated AI platform yet; keep clean event and content schemas for future enrichment",
      why: "Avoiding premature AI infrastructure keeps the first release focused while preserving optionality.",
      tradeoffs: ["No immediate AI moat", "Future retrofits need schema discipline now"],
      alternatives: ["Add Vercel AI SDK once AI UX is validated", "Use pgvector for lightweight semantic search"],
      confidence: 82
    };
  }

  return {
    layer: "AI/ML",
    recommendation: "Vercel AI SDK with provider abstraction, Gemini free-tier or local Ollama for dev, OpenAI/Anthropic for premium quality, pgvector retrieval",
    why: "Provider abstraction lets you start free locally, compare model quality, and move high-value flows to stronger paid models later.",
    tradeoffs: ["Free models vary in latency and reasoning quality", "Prompt/version evaluation becomes a product responsibility"],
    alternatives: ["LangChain for complex agent graphs", "LlamaIndex for retrieval-heavy knowledge apps", "Self-hosted vLLM for scale"],
    confidence: 88
  };
}

function conflicts(input: WizardInput) {
  const warnings: string[] = [];

  if (input.architecturePreference === "microservices" && (input.teamSize === "solo" || input.seniority === "junior-heavy")) {
    warnings.push("Microservices are a poor fit for a solo or junior-heavy team unless there is a hard scaling or ownership boundary.");
  }
  if (input.language !== "typescript" && input.features.includes("trpc")) {
    warnings.push("tRPC pairs best with TypeScript end-to-end; a non-TypeScript backend weakens its main advantage.");
  }
  if (input.uptime === "five-nines" && input.budget === "lean") {
    warnings.push("99.999% uptime and a lean budget conflict; the reliability target needs either more budget or a narrower SLA.");
  }
  if (regulated(input) && input.cloud === "agnostic" && input.timeline === "urgent") {
    warnings.push("Strict compliance, cloud agnosticism, and urgent timelines rarely coexist cleanly; choose the compliance-first managed path.");
  }
  if (input.seo === "critical" && input.projectType === "internal") {
    warnings.push("SEO-critical settings usually do not matter for authenticated internal tools; this may be an accidental requirement.");
  }

  return warnings;
}

function scores(input: WizardInput, warningCount: number) {
  const teamFit = Math.max(52, 94 - (input.seniority === "junior-heavy" ? 10 : 0) - (input.architecturePreference === "microservices" ? 10 : 0) - warningCount * 4);
  const complexity = Math.min(10, 3 + (input.scale === "enterprise" ? 3 : 0) + (regulated(input) ? 2 : 0) + (input.architecturePreference === "microservices" ? 2 : 0) + (input.aiFeatures !== "none" ? 1 : 0));
  const cost = Math.min(10, 2 + (input.scale === "enterprise" ? 4 : 0) + (input.uptime === "five-nines" ? 3 : 0) + (input.dataProfile === "analytics" ? 2 : 0));
  const scalability = Math.min(98, 76 + (input.scale !== "mvp" ? 10 : 0) + (input.dataProfile === "analytics" ? 6 : 0) + (input.architecturePreference !== "serverless" ? 4 : 0));

  return { teamFit, complexity, cost, scalability };
}

function diagram(input: WizardInput, decisions: StackDecision[]) {
  const frontendDecision = decisions[0].recommendation.split(" with ")[0];
  const backendDecision = decisions[1].recommendation.split(" plus ")[0];
  const dataDecision = decisions[2].recommendation.split(" with ")[0];
  const ai = input.aiFeatures !== "none";
  const realtime = has(input, "realtime");

  return `flowchart LR
  User["Users / Teams"] --> Edge["CDN + Edge Routing"]
  Edge --> Web["${frontendDecision}"]
  Web --> API["${backendDecision}"]
  API --> Auth["Auth + RBAC"]
  API --> DB["${dataDecision}"]
  API --> Cache["Redis / Cache"]
  API --> Jobs["Background Jobs"]
  Jobs --> Queue["Queue"]
  DB --> Backup["Backups + DR"]
  API --> Obs["Logs, Traces, Errors"]
  ${realtime ? 'API --> Realtime["Realtime Gateway"]\n  Realtime --> Web' : ""}
  ${ai ? 'API --> AI["AI Provider Gateway"]\n  AI --> Vector["Embeddings / Vector Search"]\n  Vector --> DB' : ""}
  classDef edge fill:#dcecf2,stroke:#256f8d,color:#111318
  classDef app fill:#f3e5dc,stroke:#b35b45,color:#111318
  classDef data fill:#e8ecd9,stroke:#6f7b4d,color:#111318
  class Edge edge
  class Web,API,Jobs,Auth app
  class DB,Cache,Queue,Backup${ai ? ",Vector" : ""} data`;
}

export function analyzeArchitecture(input: WizardInput): ArchitectureAnalysis {
  const decisions = [frontend(input), backend(input), data(input), infra(input), devops(input), aiLayer(input)];
  const foundConflicts = conflicts(input);
  const scored = scores(input, foundConflicts.length);
  const title = `${input.projectType || "Product"} architecture recommendation`;

  return {
    title,
    executiveSummary: `Recommended architecture for a ${input.scale} ${input.projectType} with ${input.teamSize} delivery capacity, ${input.timeline} timeline pressure, and ${input.aiFeatures === "none" ? "no immediate AI platform requirement" : "AI-assisted product capabilities"}. The plan favors production readiness without taking on avoidable platform complexity.`,
    decisions,
    conflicts: foundConflicts,
    scores: scored,
    roadmap: [
      "Ship a typed product skeleton with auth, billing-ready domain boundaries, and observability from day one.",
      "Keep database migrations, environment contracts, and API schemas versioned before adding service sprawl.",
      "Add async jobs, search, analytics, and AI retrieval only when product workflows prove the need.",
      "Run a monthly architecture review against cost, latency, reliability, and team friction."
    ],
    mermaid: diagram(input, decisions),
    manifest: {
      frontend: decisions[0].recommendation,
      backend: decisions[1].recommendation,
      data: decisions[2].recommendation,
      infrastructure: decisions[3].recommendation,
      devops: decisions[4].recommendation,
      ai: decisions[5].recommendation,
      compliance: input.compliance,
      complexityScore: scored.complexity
    }
  };
}
