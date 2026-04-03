import type { CSSProperties } from 'react';
import { ArrowRight, Clock3, FileText, GraduationCap, Layers, Mail, Sparkles } from 'lucide-react';

import { cn } from '../../lib/utils';
import type { StudyMaterial } from '../../types';

type StudyMaterialCardVariant = 'featured' | 'standard';

interface StudyMaterialCardProps {
  material: StudyMaterial;
  index?: number;
  variant?: StudyMaterialCardVariant;
  onCreateDrills: () => void;
  onInterviewPrep: () => void;
  onEmail: () => void;
}

interface MaterialSignals {
  wordCount: number;
  readMinutes: number;
  flashcards: number;
  drills: number;
  interviewQuestions: number;
  focusLabel: string;
  focusTone: string;
  freshnessLabel: string;
  freshnessTone: string;
  sourceLabel: string;
  insight: string;
  tags: string[];
}

const focusDictionary = [
  {
    label: 'Formula-heavy',
    tone: 'border-[rgba(245,158,11,0.24)] bg-[rgba(245,158,11,0.12)] text-[#fcd68a]',
    matches: ['equation', 'formula', 'derive', 'calculate', 'acceleration'],
    insight: 'Dense enough to spin into high-signal drills and quick formula checks.',
  },
  {
    label: 'Interview-ready',
    tone: 'border-[rgba(255,107,107,0.22)] bg-[rgba(255,107,107,0.12)] text-[#ffb4b4]',
    matches: ['example', 'workflow', 'project', 'application', 'system', 'tradeoff'],
    insight: 'Strong applied language. Great candidate for behavioral and concept interview prompts.',
  },
  {
    label: 'Concept-heavy',
    tone: 'border-[rgba(139,92,246,0.22)] bg-[rgba(139,92,246,0.12)] text-[#c4b5fd]',
    matches: ['concept', 'definition', 'theory', 'explain', 'understand', 'idea'],
    insight: 'Best suited for layered summaries, recall cards, and short-answer reviews.',
  },
];

export function getMaterialSignals(material: Pick<StudyMaterial, 'content' | 'created_at' | 'subject' | 'source_type' | 'tags'>): MaterialSignals {
  const content = material.content || '';
  const normalized = content.toLowerCase();
  const wordCount = countWords(content);
  const readMinutes = Math.max(3, Math.round(wordCount / 165));
  const drills = clamp(Math.round(wordCount / 95), 3, 14);
  const flashcards = clamp(Math.round(wordCount / 58), 6, 26);
  const interviewQuestions = clamp(Math.round(wordCount / 135), 2, 9);
  const sourceLabel = formatSourceType(material.source_type);
  const freshness = getFreshnessState(material.created_at);

  const focusMatch = focusDictionary.find((entry) => entry.matches.some((token) => normalized.includes(token)));
  const focusLabel = focusMatch?.label || 'Review-ready';
  const focusTone =
    focusMatch?.tone || 'border-[rgba(255,255,255,0.12)] bg-white/[0.06] text-kaleo-charcoal/76';
  const insight =
    focusMatch?.insight ||
    'Balanced enough for flashcards, concise recaps, and a polished practice round.';

  const tags = [
    material.subject || 'General study',
    sourceLabel,
    wordCount > 420 ? 'Deep dive' : 'Quick review',
  ];

  if (Array.isArray(material.tags) && material.tags.length > 0) {
    tags.unshift(...material.tags.slice(0, 2));
  }

  return {
    wordCount,
    readMinutes,
    flashcards,
    drills,
    interviewQuestions,
    focusLabel,
    focusTone,
    freshnessLabel: freshness.label,
    freshnessTone: freshness.tone,
    sourceLabel,
    insight,
    tags: Array.from(new Set(tags)).slice(0, 4),
  };
}

export default function StudyMaterialCard({
  material,
  index = 0,
  variant = 'standard',
  onCreateDrills,
  onInterviewPrep,
  onEmail,
}: StudyMaterialCardProps) {
  const signals = getMaterialSignals(material);
  const isFeatured = variant === 'featured';
  const preview = material.content.replace(/\s+/g, ' ').trim();

  const animationStyle: CSSProperties = {
    animationDelay: `${Math.min(index * 70, 420)}ms`,
  };

  return (
    <article
      style={animationStyle}
      className={cn(
        'workspace-surface group animate-rise-in relative flex h-full flex-col overflow-hidden p-6 text-left transition duration-300 ease-out',
        isFeatured
          ? 'min-h-[31rem] border-white/12 bg-[linear-gradient(180deg,rgba(16,18,24,0.98),rgba(11,13,18,0.94))] lg:p-7'
          : 'min-h-[24rem] border-white/10 bg-[linear-gradient(180deg,rgba(17,19,24,0.94),rgba(12,14,18,0.9))]',
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.28),transparent_72%)] blur-3xl" />
        <div className="absolute -left-12 bottom-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.22),transparent_72%)] blur-3xl" />
      </div>

      <div className="relative flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2.5">
          {isFeatured ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.12)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#c4b5fd]">
              <Sparkles className="h-3.5 w-3.5" />
              Featured Signal
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-kaleo-charcoal/64">
            <FileText className="h-3.5 w-3.5" />
            {material.subject || 'General study'}
          </span>
          <span className={cn('inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em]', signals.freshnessTone)}>
            {signals.freshnessLabel}
          </span>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-kaleo-charcoal/42">
                {signals.sourceLabel}
              </p>
              <h3
                className={cn(
                  'mt-2 max-w-[22rem] font-serif tracking-[-0.045em] text-kaleo-charcoal',
                  isFeatured ? 'text-[clamp(2rem,3.1vw,3rem)] leading-[0.98]' : 'text-2xl leading-[1.02]',
                )}
              >
                {material.title}
              </h3>
            </div>
            <p
              className={cn(
                'max-w-2xl text-sm leading-7 text-kaleo-charcoal/72',
                isFeatured ? 'line-clamp-6 lg:text-[0.98rem]' : 'line-clamp-4',
              )}
            >
              {preview}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em]', signals.focusTone)}>
            {signals.focusLabel}
          </span>
          {signals.tags.slice(0, isFeatured ? 3 : 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 bg-white/[0.045] px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-kaleo-charcoal/46"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-kaleo-charcoal/40">
                AI Read
              </p>
              <p className="mt-1 text-sm leading-6 text-kaleo-charcoal/72">{signals.insight}</p>
            </div>
            <span className="hidden rounded-full border border-[rgba(139,92,246,0.16)] bg-[rgba(139,92,246,0.08)] p-3 text-kaleo-cream shadow-[0_18px_30px_-24px_rgba(139,92,246,0.8)] sm:inline-flex">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <SignalMetric icon={FileText} label="Drills" value={signals.drills} />
          <SignalMetric icon={Layers} label="Flashcards" value={signals.flashcards} />
          <SignalMetric icon={GraduationCap} label="Prompts" value={signals.interviewQuestions} />
        </div>

        <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
          <button
            type="button"
            onClick={onCreateDrills}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ease-out',
              isFeatured
                ? 'bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] text-[#fff4eb] shadow-[0_24px_38px_-22px_rgba(139,92,246,0.82)] hover:-translate-y-0.5 hover:shadow-[0_28px_42px_-22px_rgba(139,92,246,0.88)]'
                : 'bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] text-[#fff4eb] shadow-[0_22px_34px_-22px_rgba(139,92,246,0.8)] hover:-translate-y-0.5 hover:shadow-[0_28px_40px_-20px_rgba(139,92,246,0.84)]',
            )}
          >
            Create drills
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onInterviewPrep}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-kaleo-charcoal/78 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.18)] hover:bg-white/[0.08] hover:text-kaleo-charcoal"
          >
            <GraduationCap className="h-4 w-4" />
            Interview prep
          </button>
          <button
            type="button"
            onClick={onEmail}
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-kaleo-charcoal/58 transition duration-300 ease-out hover:text-kaleo-charcoal"
          >
            <Mail className="h-4 w-4 text-kaleo-earth" />
            Email
          </button>
        </div>

        <div className="mt-auto pt-5">
          <div className="soft-divider" />
          <div className="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-kaleo-charcoal/40">
            <span>{formatDate(material.created_at)}</span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5" />
              {signals.readMinutes} min read
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function SignalMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] px-4 py-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-kaleo-charcoal/38">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-kaleo-earth/70" />
      </div>
      <p className="mt-2 font-serif text-2xl tracking-[-0.04em] text-kaleo-charcoal">{value}</p>
    </div>
  );
}

function countWords(content: string) {
  return content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatSourceType(sourceType?: string) {
  if (!sourceType) {
    return 'Manual notes';
  }

  return sourceType
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getFreshnessState(createdAt?: string) {
  if (!createdAt) {
    return {
      label: 'Library ready',
      tone: 'border-white/10 bg-white/[0.05] text-kaleo-charcoal/74',
    };
  }

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return {
      label: 'Library ready',
      tone: 'border-white/10 bg-white/[0.05] text-kaleo-charcoal/74',
    };
  }

  const msDifference = Date.now() - parsed.getTime();
  const dayDifference = Math.floor(msDifference / (1000 * 60 * 60 * 24));

  if (dayDifference <= 1) {
    return {
      label: 'Fresh signal',
      tone: 'border-[rgba(245,158,11,0.24)] bg-[rgba(245,158,11,0.12)] text-[#fcd68a]',
    };
  }

  if (dayDifference <= 7) {
    return {
      label: 'Recent',
      tone: 'border-[rgba(255,107,107,0.22)] bg-[rgba(255,107,107,0.12)] text-[#ffb4b4]',
    };
  }

  return {
    label: 'Library',
    tone: 'border-white/10 bg-white/[0.05] text-kaleo-charcoal/74',
  };
}

function formatDate(createdAt?: string) {
  if (!createdAt) {
    return 'No date';
  }

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'No date';
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
