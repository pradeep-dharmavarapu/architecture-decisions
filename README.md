# TechStack Architect AI

Interactive architecture decision engine for software teams. It interviews users about product shape, scale, constraints, team profile, and feature needs, then generates:

- Opinionated stack decisions across frontend, backend, data, infrastructure, DevOps, and AI/ML
- Conflict warnings and trade-off cards
- Team fit, complexity, cost pressure, and scale-readiness scores
- Mermaid architecture diagram
- PNG, PDF, Markdown, and JSON exports

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## AI Integration

The app works without a paid AI key because `/api/analyze` always runs a deterministic architecture engine first.

Optional free/local enrichment:

```bash
cp .env.example .env.local
```

- Local and free: install Ollama, run `ollama pull llama3.1`, keep `AI_PROVIDER=local`.
- Hosted free-tier option: set `GEMINI_API_KEY` and the API route will ask Gemini for a short second opinion.

The deterministic recommendation remains the source of truth; AI notes are an additive review layer.

## Verification

```bash
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel and choose the Next.js framework preset.
3. Keep the default commands:
   - Install: `npm install`
   - Build: `npm run build`
   - Output: Next.js default
4. Set environment variables only if you want hosted AI enrichment:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-2.5-flash`
5. Do not set `AI_PROVIDER=local` on Vercel unless `OLLAMA_BASE_URL` points to a reachable hosted Ollama server.
6. After deployment, test:
   - Wizard navigation
   - `/api/analyze` response
   - Mermaid diagram rendering
   - JSON, Markdown, PNG, and PDF exports

The app is intentionally useful without any hosted AI key; the deterministic architect engine still returns the full recommendation.
