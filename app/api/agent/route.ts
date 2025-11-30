import { NextRequest } from 'next/server';
import { webSearch } from '@/lib/search';
import { crawlFromSeeds } from '@/lib/crawl';
import { generateReport } from '@/lib/report';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt || prompt.trim().length < 4) {
      return new Response('Invalid prompt', { status: 400 });
    }
    // 1) Search
    const results = await webSearch(prompt);
    const seeds = results.map((r) => r.url).slice(0, 8);

    // 2) Crawl
    const { pages, documents } = await crawlFromSeeds(seeds, 14, true);

    // 3) Report
    const { report, usedOpenAI } = await generateReport(
      prompt,
      pages.map((p) => ({ url: p.url, title: p.title, text: p.text }))
    );

    const resp = {
      report,
      usedOpenAI,
      results,
      crawled: pages.map((p) => ({
        url: p.url,
        title: p.title,
        contentPreview: p.contentPreview,
      })),
      documents,
    };
    return Response.json(resp, { status: 200 });
  } catch (e: any) {
    return new Response(e?.message || 'Internal error', { status: 500 });
  }
}

