import { useState } from 'react';
import { Check, Copy, Languages, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import type { TranslateResult } from './types';

const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
];

export default function Translator() {
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = (await apiClient.translateText(text, targetLanguage)) as TranslateResult;
      setResult(data);
    } catch (caughtError) {
      console.error('Error translating text:', caughtError);
      setError('Translation failed. Please try again with a shorter or clearer passage.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result?.translated_text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.translated_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (caughtError) {
      console.error('Error copying translation:', caughtError);
      setError('Copying to clipboard failed in this browser.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Languages className="w-8 h-8 mr-3 text-green-500" />
          Translator
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Translate text into the language people need to use it.
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
            <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Target language</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full rounded-lg border border-kaleo-terracotta/20 bg-kaleo-sand px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/30"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-kaleo-charcoal">Original text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-64 w-full resize-none rounded-lg border border-kaleo-terracotta/20 bg-kaleo-sand px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/30"
              placeholder="Paste your text here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-500 px-6 py-3 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Languages className="h-5 w-5" />
                <span>Translate</span>
              </>
            )}
          </button>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-kaleo-charcoal">Translation</h3>
            {result && (
              <button
                type="button"
                onClick={() => void copyToClipboard()}
                className="p-2 text-kaleo-charcoal/60 transition-colors hover:text-green-500"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            )}
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-green-50 p-4">
                <p className="leading-relaxed text-kaleo-charcoal">{result.translated_text}</p>
              </div>
              {result.detected_source_language && (
                <p className="text-sm text-kaleo-charcoal/60">
                  Detected: {result.detected_source_language}
                </p>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-kaleo-charcoal/50">
              <Languages className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>{error ? 'Fix the issue above to see the translation.' : 'Your translation will appear here.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
