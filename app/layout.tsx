import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Agentic - Web Research Agent',
  description: 'Search, browse, download, analyze, and report.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">
              Agentic <span className="text-primary-600">Research Agent</span>
            </h1>
            <p className="text-gray-600">
              Manus-like AI agent: web search, crawling, downloads, and professional reports.
            </p>
          </header>
          {children}
          <footer className="mt-12 text-xs text-gray-500">
            Results are best-effort and may contain inaccuracies. Provide API keys for best quality.
          </footer>
        </div>
      </body>
    </html>
  );
}

