import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  ArrowRight,
  BookOpen,
  FileText,
  Globe,
  History,
  Languages,
  Sparkles,
  Type,
} from 'lucide-react';
import apiClient from '../../api/client';
import type {
  AccessibilityAssistantSuggestion,
  AccessibilityTransformHistoryItem,
} from './types';

export default function AccessibilityDashboard() {
  const [transformHistory, setTransformHistory] = useState<AccessibilityTransformHistoryItem[]>([]);
  const [agentSuggestion, setAgentSuggestion] = useState<AccessibilityAssistantSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccessibilityData = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const historyData = (await apiClient.getTransformHistory()) as AccessibilityTransformHistoryItem[];
      const safeHistory = Array.isArray(historyData) ? historyData : [];

      setTransformHistory(safeHistory.slice(0, 5));
      setAgentSuggestion({
        recommended_transformation: { type: 'simplify', settings: {} },
        accessibility_suggestions: [
          'Try simplifying complex texts',
          'Use translation for foreign content',
          'Break long passages into shorter reading chunks',
        ],
      });
    } catch (caughtError) {
      console.error('Error fetching accessibility data:', caughtError);
      setError('We could not load your recent accessibility activity. Please try again.');
      setTransformHistory([]);
      setAgentSuggestion(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAccessibilityData();
  }, [fetchAccessibilityData]);

  const tools = [
    {
      title: 'Text Simplifier',
      description: 'Make complex writing easier to read and act on.',
      icon: Type,
      path: '/accessibility/simplify',
      color: 'bg-blue-500',
      features: ['Beginner mode', 'Intermediate mode', 'Key points extraction'],
    },
    {
      title: 'Translator',
      description: 'Translate text while keeping the meaning clear.',
      icon: Languages,
      path: '/accessibility/translate',
      color: 'bg-green-500',
      features: ['12+ languages', 'Auto-detection', 'Simplified translation'],
    },
    {
      title: 'Summarizer',
      description: 'Turn long passages into concise, usable summaries.',
      icon: FileText,
      path: '/accessibility/summarize',
      color: 'bg-purple-500',
      features: ['Concise mode', 'Detailed mode', 'Bullet points'],
    },
    {
      title: 'Read Assist',
      description: 'Support reading with chunking, highlights, and context.',
      icon: BookOpen,
      path: '/accessibility/read-assist',
      color: 'bg-orange-500',
      features: ['Key term highlighting', 'Chunked text', 'Reading level info'],
    },
  ];

  const supportedLanguages = [
    { code: 'en', name: 'English' },
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

  if (isLoading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-kaleo-terracotta/30 border-t-kaleo-terracotta" />
          <p className="text-sm text-kaleo-charcoal/60">Loading accessibility tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Accessibility className="w-8 h-8 mr-3 text-purple-500" />
          Accessibility
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Clear, inclusive tools that make content easier to read, translate, and use.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void fetchAccessibilityData()}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {agentSuggestion && (
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-medium">Accessibility assistant</h3>
              <p className="text-white/90">
                {agentSuggestion.recommended_transformation?.type
                  ? `Recommended tool: ${agentSuggestion.recommended_transformation.type}`
                  : 'Choose a tool that makes the next step easier to read, understand, or share.'}
              </p>
              {agentSuggestion.accessibility_suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {agentSuggestion.accessibility_suggestions.slice(0, 3).map((suggestion) => (
                    <span key={suggestion} className="rounded-lg bg-white/20 px-3 py-1 text-sm">
                      {suggestion}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            to={tool.path}
            className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl card-hover"
          >
            <div className="flex items-start justify-between">
              <div className={`${tool.color} flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110`}>
                <tool.icon className="h-7 w-7 text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-kaleo-charcoal/30 transition-all group-hover:translate-x-1 group-hover:text-purple-500" />
            </div>
            <h3 className="mt-4 mb-2 font-serif text-2xl text-kaleo-charcoal">{tool.title}</h3>
            <p className="mb-4 text-kaleo-charcoal/60">{tool.description}</p>
            <div className="flex flex-wrap gap-2">
              {tool.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-600"
                >
                  {feature}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center font-serif text-xl text-kaleo-charcoal">
          <Globe className="mr-2 h-5 w-5 text-purple-500" />
          Supported Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {supportedLanguages.map((lang) => (
            <span
              key={lang.code}
              className="cursor-default rounded-lg bg-kaleo-sand px-3 py-2 text-sm text-kaleo-charcoal transition-colors hover:bg-purple-50 hover:text-purple-600"
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-purple-600">
                {lang.code.toUpperCase()}
              </span>
              {lang.name}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center font-serif text-xl text-kaleo-charcoal">
            <History className="mr-2 h-5 w-5 text-purple-500" />
            Recent Transformations
          </h2>
        </div>

        {transformHistory.length > 0 ? (
          <div className="space-y-3">
            {transformHistory.map((transform) => (
              <div key={transform.id} className="flex items-center rounded-lg bg-purple-50 p-3">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  {transform.transform_type === 'simplify' && <Type className="h-5 w-5 text-purple-500" />}
                  {transform.transform_type === 'translate' && <Languages className="h-5 w-5 text-purple-500" />}
                  {transform.transform_type === 'summarize' && <FileText className="h-5 w-5 text-purple-500" />}
                  {transform.transform_type === 'read_assist' && <BookOpen className="h-5 w-5 text-purple-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium capitalize text-kaleo-charcoal">
                    {transform.transform_type.replace(/_/g, ' ')}
                  </p>
                  <p className="truncate text-xs text-kaleo-charcoal/50">
                    {transform.original_preview}
                  </p>
                </div>
                <span className="text-xs text-kaleo-charcoal/40">
                  {new Date(transform.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-kaleo-charcoal/50">
            <History className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>{error ? 'No recent transformations available' : 'No transformations yet'}</p>
            <p className="mt-1 text-sm">Start with the tool that helps make the content easier to use.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <h3 className="mb-4 font-serif text-xl">Common Use Cases</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <h4 className="mb-2 font-medium">Study Materials</h4>
            <p className="text-sm text-white/80">
              Simplify long readings or study notes so the main idea is easier to act on.
            </p>
          </div>
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Globe className="h-5 w-5" />
            </div>
            <h4 className="mb-2 font-medium">Language Learning</h4>
            <p className="text-sm text-white/80">
              Translate content into the language that is most comfortable for you.
            </p>
          </div>
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Accessibility className="h-5 w-5" />
            </div>
            <h4 className="mb-2 font-medium">Accessibility</h4>
            <p className="text-sm text-white/80">
              Make content more accessible with simpler language and clearer structure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
