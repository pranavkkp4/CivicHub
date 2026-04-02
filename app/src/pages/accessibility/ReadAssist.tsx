import { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import type { ReadAssistResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function submitReadAssistRequest(payload: {
  text: string;
  highlight_key_terms: boolean;
  add_phonetics: boolean;
  break_into_chunks: boolean;
}): Promise<ReadAssistResult> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}/accessibility/read-assist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = 'Read assist failed. Please try again.';
    try {
      const data = (await response.json()) as { detail?: string; message?: string };
      message = data.detail || data.message || message;
    } catch {
      // Keep the generic error message when the response body is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<ReadAssistResult>;
}

export default function ReadAssist() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [highlightKeyTerms, setHighlightKeyTerms] = useState(true);
  const [addPhonetics, setAddPhonetics] = useState(false);
  const [breakIntoChunks, setBreakIntoChunks] = useState(true);
  const [result, setResult] = useState<ReadAssistResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await submitReadAssistRequest({
        text,
        highlight_key_terms: highlightKeyTerms,
        add_phonetics: addPhonetics,
        break_into_chunks: breakIntoChunks,
      });
      setResult(data);
    } catch (caughtError) {
      console.error('Error processing read assist text:', caughtError);
      setError(caughtError instanceof Error ? caughtError.message : 'Read assist failed unexpectedly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-orange-500" />
          Read Assist
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Clearer reading support with key terms, phonetics, and chunked sections.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-64 w-full resize-none rounded-lg border border-kaleo-terracotta/20 bg-kaleo-sand px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="Paste your text here..."
            required
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-xl bg-kaleo-sand px-3 py-2 text-sm text-kaleo-charcoal">
            <input
              type="checkbox"
              checked={highlightKeyTerms}
              onChange={(e) => setHighlightKeyTerms(e.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            Highlight key terms
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-kaleo-sand px-3 py-2 text-sm text-kaleo-charcoal">
            <input
              type="checkbox"
              checked={addPhonetics}
              onChange={(e) => setAddPhonetics(e.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            Add phonetics
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-kaleo-sand px-3 py-2 text-sm text-kaleo-charcoal">
            <input
              type="checkbox"
              checked={breakIntoChunks}
              onChange={(e) => setBreakIntoChunks(e.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            Break into chunks
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <BookOpen className="h-5 w-5" />
            <span>Process text</span>
            </>
          )}
        </button>
      </form>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-kaleo-charcoal">Processed output</h3>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-orange-500" />}
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-orange-50 p-4">
              <p className="leading-relaxed text-kaleo-charcoal">{result.assisted_text}</p>
            </div>

            {result.key_terms.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-kaleo-charcoal">Key terms</h4>
                <div className="space-y-2">
                  {result.key_terms.map((item) => (
                    <div key={`${item.term}-${item.definition}`} className="rounded-xl bg-kaleo-sand p-3">
                      <p className="font-medium text-kaleo-charcoal">{item.term}</p>
                      <p className="text-sm text-kaleo-charcoal/70">{item.definition}</p>
                      {item.phonetic && (
                        <p className="text-xs text-kaleo-charcoal/50">Phonetic: {item.phonetic}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.chunks.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-kaleo-charcoal">Reading chunks</h4>
                <div className="space-y-2">
                  {result.chunks.map((chunk, index) => (
                    <div
                      key={`${index}-${chunk.slice(0, 20)}`}
                      className="rounded-xl border border-kaleo-terracotta/10 p-3 text-sm text-kaleo-charcoal/75"
                    >
                      <span className="mr-2 font-medium text-orange-500">Chunk {index + 1}:</span>
                      {chunk}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-kaleo-charcoal/60">
              Estimated reading level: {result.estimated_reading_level}
            </p>
          </div>
        ) : (
          <div className="py-16 text-center text-kaleo-charcoal/50">
            <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>{error ? 'Fix the issue above to see the processed text.' : 'Processed reading support will appear here.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
