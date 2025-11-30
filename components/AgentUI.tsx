'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

type SearchResult = {
  title: string;
  url: string;
  snippet?: string;
};

type AgentResponse = {
  report: string;
  results: SearchResult[];
  crawled: { url: string; title?: string; contentPreview?: string }[];
  documents: { url: string; filename: string }[];
  usedOpenAI: boolean;
};

export default function AgentUI() {
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('Idle');
  const controllerRef = useRef<AbortController | null>(null);

  const canRun = useMemo(() => prompt.trim().length > 3 && !isRunning, [prompt, isRunning]);

  const runAgent = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setResponse(null);
    setProgress('Searching the web...');
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Request failed');
      }
      const data = (await res.json()) as AgentResponse & { checkpoints?: string[] };
      setResponse(data);
      setProgress('Complete');
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setProgress('Failed');
    } finally {
      setIsRunning(false);
      controllerRef.current = null;
    }
  }, [prompt]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const downloadZip = useCallback(async () => {
    const res = await fetch('/api/zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to build ZIP');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agentic-downloads.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, [prompt]);

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your prompt</label>
        <textarea
          className="input h-32 resize-y"
          placeholder="e.g., Research the latest AI agents similar to Manus AI, gather docs, and write a report."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="mt-3 flex gap-3">
          <button className="btn" onClick={runAgent} disabled={!canRun}>
            {isRunning ? 'Running...' : 'Run Agent'}
          </button>
          <button className="btn-secondary" onClick={cancel} disabled={!isRunning}>
            Cancel
          </button>
          <button className="btn" onClick={downloadZip} disabled={prompt.trim().length < 4}>
            Download ZIP
          </button>
          <span className="ml-auto text-sm text-gray-600">Status: {progress}</span>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {response && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="card p-4">
              <h2 className="mb-2 text-lg font-semibold">Web Results</h2>
              <ul className="list-disc pl-5 space-y-2">
                {response.results.map((r, i) => (
                  <li key={i}>
                    <a className="text-primary-700 hover:underline" href={r.url} target="_blank" rel="noreferrer">
                      {r.title || r.url}
                    </a>
                    {r.snippet && <div className="text-sm text-gray-600">{r.snippet}</div>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <h2 className="mb-2 text-lg font-semibold">Crawled Pages</h2>
              <ul className="list-disc pl-5 space-y-2 max-h-80 overflow-auto">
                {response.crawled.map((c, i) => (
                  <li key={i}>
                    <a className="text-primary-700 hover:underline" href={c.url} target="_blank" rel="noreferrer">
                      {c.title || c.url}
                    </a>
                    {c.contentPreview && <div className="text-sm text-gray-600 line-clamp-3">{c.contentPreview}</div>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <h2 className="mb-2 text-lg font-semibold">Documents</h2>
              <ul className="list-disc pl-5 space-y-2">
                {response.documents.map((d, i) => (
                  <li key={i}>
                    <a className="text-primary-700 hover:underline" href={d.url} target="_blank" rel="noreferrer">
                      {d.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card p-4">
            <h2 className="mb-2 text-lg font-semibold">Report</h2>
            <div className="prose max-w-none whitespace-pre-wrap">
              {response.report}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {response.usedOpenAI ? 'Generated with OpenAI' : 'Generated with local summarizer'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

