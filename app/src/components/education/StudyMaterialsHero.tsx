import { BarChart3, BookOpen, Layers, Plus, Sparkles, TrendingUp, Zap, ArrowRight } from 'lucide-react';

import { getMaterialSignals } from './StudyMaterialCard';
import type { StudyMaterial } from '../../types';

interface StudyMaterialsHeroProps {
  materialsCount: number;
  uniqueSubjectCount: number;
  totalOutputsReady: number;
  totalStudyMinutes: number;
  workspaceReadiness: number;
  featuredMaterial: StudyMaterial | null;
  latestMaterial: StudyMaterial | null;
  summaryRows: StudyMaterial[];
  onAddMaterial: () => void;
  onSecondaryAction: () => void;
  secondaryLabel: string;
}

export default function StudyMaterialsHero({
  materialsCount,
  uniqueSubjectCount,
  totalOutputsReady,
  totalStudyMinutes,
  workspaceReadiness,
  featuredMaterial,
  latestMaterial,
  summaryRows,
  onAddMaterial,
  onSecondaryAction,
  secondaryLabel,
}: StudyMaterialsHeroProps) {
  const latestSignals = latestMaterial ? getMaterialSignals(latestMaterial) : null;
  const hasMaterials = materialsCount > 0;

  return (
    <section className="workspace-surface relative overflow-hidden rounded-[2.6rem] px-6 py-7 shadow-[0_48px_110px_-58px_rgba(0,0,0,0.92)] sm:px-8 sm:py-9 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03),transparent_34%,rgba(255,255,255,0.04)_70%,transparent)]" />
        <div className="animate-ambient-drift absolute -left-20 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.24),transparent_70%)] blur-3xl" />
        <div className="animate-ambient-drift-delayed absolute right-0 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.2),transparent_74%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
      </div>

      <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.22)] bg-[rgba(139,92,246,0.1)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d8c8ff]">
                <Sparkles className="h-3.5 w-3.5" />
                Premium AI workspace
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-kaleo-charcoal/50">
                <Zap className="h-3.5 w-3.5 text-kaleo-earth" />
                Demo-ready study flow
              </span>
            </div>

            <div className="max-w-4xl space-y-5">
              <div className="space-y-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-kaleo-charcoal/40">
                  Study Materials
                </p>
                <h1 className="max-w-4xl font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.06em] text-kaleo-charcoal">
                  Where source notes become a{' '}
                  <span className="bg-[linear-gradient(135deg,#f8f7fc_6%,#c4b5fd_38%,#ff9d9d_82%)] bg-clip-text text-transparent">
                    premium study system
                  </span>
                  .
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-8 text-kaleo-charcoal/66 sm:text-lg">
                Curate notes, surface the best AI next step, and turn dense material into drills, flashcards, interview prep, and shareable study packets without leaving the page.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroMetricCard label="Materials in orbit" value={materialsCount || 3} caption={hasMaterials ? 'Live library' : 'Start with a preset'} icon={Layers} />
              <HeroMetricCard label="Subjects covered" value={uniqueSubjectCount || 3} caption={hasMaterials ? 'Cross-topic context' : 'Curated starter packs'} icon={BookOpen} />
              <HeroMetricCard label="AI outputs ready" value={totalOutputsReady || 27} caption={hasMaterials ? 'Derived from current notes' : 'Potential outputs waiting'} icon={TrendingUp} />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onAddMaterial}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] px-6 py-4 text-sm font-semibold text-[#fff3eb] shadow-[0_28px_42px_-24px_rgba(139,92,246,0.9)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_34px_48px_-22px_rgba(139,92,246,0.95)]"
            >
              <Plus className="h-4 w-4" />
              Add material
            </button>

            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-4 text-sm font-semibold text-kaleo-charcoal/76 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.18)] hover:bg-white/[0.08] hover:text-kaleo-charcoal"
            >
              {secondaryLabel}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="sm:ml-auto">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-kaleo-charcoal/36">
                Latest focus
              </p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-kaleo-charcoal/70">
                {featuredMaterial
                  ? `${featuredMaterial.title} is the strongest candidate for your next AI run.`
                  : 'Load one pack and the workspace will immediately surface its next best AI action.'}
              </p>
            </div>
          </div>
        </div>

        <div className="workspace-surface-muted relative overflow-hidden rounded-[2.25rem] p-5 sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,rgba(139,92,246,0.08)_100%)]" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-kaleo-charcoal/40">
                  AI Workspace Pulse
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-kaleo-charcoal">
                  Cinematic study cockpit
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,107,107,0.16)] bg-[rgba(255,107,107,0.08)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#ffb4b4]">
                <BarChart3 className="h-3.5 w-3.5" />
                Live metrics
              </span>
            </div>

            <div className="orbital-map mt-5 min-h-[23rem] border-white/8 bg-[radial-gradient(circle_at_center,rgba(22,25,33,0.98),rgba(9,11,15,0.96))]">
              <div className="animate-ambient-drift absolute -left-6 top-12 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.26),transparent_72%)] blur-2xl" />
              <div className="animate-ambient-drift-delayed absolute right-6 top-4 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.24),transparent_72%)] blur-2xl" />
              <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[rgba(139,92,246,0.18)] bg-[radial-gradient(circle,rgba(139,92,246,0.2),rgba(12,14,18,0.98)_68%)] shadow-[0_34px_80px_-44px_rgba(139,92,246,0.7)]">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-kaleo-charcoal/42">
                  Ready score
                </p>
                <p className="mt-2 font-serif text-5xl tracking-[-0.06em] text-kaleo-charcoal">
                  {workspaceReadiness}
                  <span className="text-xl text-kaleo-charcoal/48">%</span>
                </p>
                <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-kaleo-charcoal/36">
                  {hasMaterials ? 'Library primed for AI' : 'Add first source'}
                </p>
              </div>

              <div className="orbit-node left-[7%] top-[12%] animate-float-slow">
                <span className="orbit-title">Materials</span>
                <span className="orbit-body">{materialsCount || 3} sources in view</span>
              </div>
              <div className="orbit-node right-[6%] top-[18%] animate-float-delayed">
                <span className="orbit-title">Signals</span>
                <span className="orbit-body">{latestSignals?.focusLabel || 'Preset pack ready'}</span>
              </div>
              <div className="orbit-node bottom-[12%] left-[11%] animate-float-delayed">
                <span className="orbit-title">Study load</span>
                <span className="orbit-body">{totalStudyMinutes || 21} minutes mapped</span>
              </div>
              <div className="orbit-node bottom-[15%] right-[8%] animate-float-slow">
                <span className="orbit-title">AI outputs</span>
                <span className="orbit-body">{totalOutputsReady || 27} next-step actions</span>
              </div>
            </div>

            <div className="mt-5 rounded-[1.65rem] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-kaleo-charcoal/38">
                    AI focus lanes
                  </p>
                  <p className="mt-1 text-sm text-kaleo-charcoal/58">Signals based on your highest-value sources.</p>
                </div>
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-kaleo-charcoal/38">
                  Top 3
                </span>
              </div>

              <div className="space-y-3">
                {summaryRows.length > 0 ? (
                  summaryRows.map((material) => {
                    const signals = getMaterialSignals(material);

                    return (
                      <div key={material.id} className="rounded-[1.3rem] border border-white/6 bg-black/10 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-kaleo-charcoal">{material.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-kaleo-charcoal/38">
                              {signals.focusLabel}
                            </p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-kaleo-charcoal/42">
                            {signals.flashcards} cards
                          </span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#8B5CF6,#FF6B6B)] shadow-[0_10px_20px_-12px_rgba(139,92,246,0.75)]"
                            style={{ width: `${Math.min(Math.max(Math.round((signals.wordCount / 520) * 100), 28), 92)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[1.3rem] border border-dashed border-white/10 bg-black/10 px-4 py-5 text-sm leading-6 text-kaleo-charcoal/58">
                    Once you add a material, the workspace will surface its strongest AI pathway here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetricCard({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_28px_60px_-42px_rgba(0,0,0,0.8)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-kaleo-charcoal/38">{label}</p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.05] text-kaleo-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 font-serif text-4xl tracking-[-0.05em] text-kaleo-charcoal">{value}</p>
      <p className="mt-2 text-sm leading-6 text-kaleo-charcoal/54">{caption}</p>
    </div>
  );
}
