# Agentic Research Agent

A web-based AI research agent that:

- Performs web search
- Crawls relevant pages and follows links
- Finds and downloads documents (PDF/DOCX/PPTX/XLSX)
- Analyzes content and generates professional reports
- Works online (Vercel) or locally (Windows/macOS/Linux)

## Quickstart (Local)

Prerequisites: Node 18+

```bash
npm install
npm run dev
```

Open http://localhost:3000

Optional environment variables:

- `OPENAI_API_KEY`: Enables high-quality report generation
- `OPENAI_MODEL`: Defaults to `gpt-4o-mini`
- `SERPAPI_KEY`: Improves search quality (optional)

Create `.env.local`:

```bash
OPENAI_API_KEY=sk-...
SERPAPI_KEY=...
```

## Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

Use the provided token/environment to deploy:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-122fc986
```

After deployment, verify:

```bash
curl https://agentic-122fc986.vercel.app
```

## Notes

- Some sites block automated fetches; results are best-effort.
- The online ZIP includes a `manifest.txt` with attempted downloads.
- Without `OPENAI_API_KEY`, a heuristic summarizer is used.