import { ArrowRight, Loader2 } from 'lucide-react';

import { getMaterialSignals } from './StudyMaterialCard';

interface StarterPackCardProps {
  label: string;
  title: string;
  subject: string;
  content: string;
  isLoading: boolean;
  onLoad: () => void;
  index: number;
}

export default function StarterPackCard({
  label,
  title,
  subject,
  content,
  isLoading,
  onLoad,
  index,
}: StarterPackCardProps) {
  const signals = getMaterialSignals({
    content,
    created_at: new Date().toISOString(),
    subject,
    source_type: 'curated pack',
    tags: [label],
  });

  return (
    <article
      className="workspace-surface group animate-rise-in relative overflow-hidden rounded-[2rem] p-6"
      style={{ animationDelay: `${180 + index * 70}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.24),transparent_72%)] blur-3xl" />
      </div>
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.1)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#fcd68a]">
            {label}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-kaleo-charcoal/50">
            {signals.focusLabel}
          </span>
        </div>

        <h3 className="mt-5 font-serif text-[2rem] leading-[0.98] tracking-[-0.045em] text-kaleo-charcoal">
          {title}
        </h3>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-kaleo-charcoal/36">{subject}</p>
        <p className="mt-4 line-clamp-5 text-sm leading-7 text-kaleo-charcoal/68">{content}</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <SeedMetric label="Cards" value={signals.flashcards} />
          <SeedMetric label="Drills" value={signals.drills} />
          <SeedMetric label="Prompts" value={signals.interviewQuestions} />
        </div>

        <button
          type="button"
          onClick={onLoad}
          disabled={isLoading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] px-5 py-3.5 text-sm font-semibold text-[#fff3eb] shadow-[0_22px_34px_-22px_rgba(139,92,246,0.82)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_28px_40px_-20px_rgba(139,92,246,0.86)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          <span>{isLoading ? 'Loading pack...' : 'Load preset pack'}</span>
        </button>
      </div>
    </article>
  );
}

function SeedMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.04] px-3 py-3 text-center backdrop-blur-md">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-kaleo-charcoal/34">{label}</p>
      <p className="mt-1 font-serif text-2xl tracking-[-0.04em] text-kaleo-charcoal">{value}</p>
    </div>
  );
}
