import { useState } from 'react';
import { Check, Copy, Loader2, Type } from 'lucide-react';
import apiClient from '../../api/client';
import type { SimplifyResult } from './types';

export default function TextSimplifier() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [result, setResult] = useState<SimplifyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = (await apiClient.simplifyText(text, level)) as SimplifyResult;
      setResult(data);
    } catch (caughtError) {
      console.error('Error simplifying text:', caughtError);
      setError('Simplification failed. Please try again with a smaller passage.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result?.simplified_text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.simplified_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (caughtError) {
      console.error('Error copying simplified text:', caughtError);
      setError('Copying to clipboard failed in this browser.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Type className="w-8 h-8 mr-3 text-blue-500" />
          Text Simplifier
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Make text easier to read without losing the message.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Reading level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-lg border border-kaleo-terracotta/20 bg-kaleo-sand px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Original text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-64 w-full resize-none rounded-lg border border-kaleo-terracotta/20 bg-kaleo-sand px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Paste your text here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Type className="h-5 w-5" />
                <span>Simplify text</span>
              </>
            )}
          </button>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-kaleo-charcoal">Simplified result</h3>
            {result && (
              <button
                type="button"
                onClick={() => void copyToClipboard()}
                className="p-2 text-kaleo-charcoal/60 transition-colors hover:text-blue-500"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            )}
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="leading-relaxed text-kaleo-charcoal">{result.simplified_text}</p>
              </div>
              {result.key_points.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-kaleo-charcoal">Key points</h4>
                  <ul className="space-y-1">
                    {result.key_points.map((point, index) => (
                      <li key={`${index}-${point}`} className="flex items-start text-sm text-kaleo-charcoal/70">
                        <span className="mr-2 text-blue-500">-</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center space-x-4 text-sm text-kaleo-charcoal/60">
                <span>Original: {result.word_count_original} words</span>
                <span>Simplified: {result.word_count_simplified} words</span>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-kaleo-charcoal/50">
              <Type className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>{error ? 'Fix the issue above to see the simplified version.' : 'A clearer version will appear here.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
