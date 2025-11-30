import JSZip from 'jszip';
import { NextRequest } from 'next/server';
import { webSearch } from '@/lib/search';
import { crawlFromSeeds } from '@/lib/crawl';

export const maxDuration = 60;

async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return buf;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt || prompt.trim().length < 4) {
      return new Response('Invalid prompt', { status: 400 });
    }
    const results = await webSearch(prompt);
    const seeds = results.map((r) => r.url).slice(0, 8);
    const { documents } = await crawlFromSeeds(seeds, 14, true);

    const zip = new JSZip();

    // Download documents and add to zip
    const limitedDocs = documents.slice(0, 16);
    const downloaded = await Promise.all(
      limitedDocs.map(async (d) => {
        const data = await fetchAsArrayBuffer(d.url);
        if (!data) return null;
        zip.file(d.filename, data);
        return d;
      })
    );

    // Also include a manifest
    const manifest = [
      `Agentic Downloads Manifest`,
      `Prompt: ${prompt}`,
      ``,
      `Included documents (${downloaded.filter(Boolean).length} of ${limitedDocs.length} attempted):`,
      ...limitedDocs.map((d, i) => `- [${i + 1}] ${d.filename} -> ${d.url}`),
      ``,
      `Note: Some downloads may fail due to remote restrictions.`,
    ].join('\n');
    zip.file('manifest.txt', manifest);

    const bytes = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
    return new Response(bytes, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="agentic-downloads.zip"',
      },
    });
  } catch (e: any) {
    return new Response(e?.message || 'Internal error', { status: 500 });
  }
}

