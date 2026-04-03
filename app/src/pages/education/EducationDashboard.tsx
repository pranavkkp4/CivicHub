import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Brain,
  ClipboardList,
  FileText,
  Layers,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react';
import apiClient from '../../api/client';
import type { AgentResult, StudyMaterial, WeakTopic } from '../../types';

type FeatureTone = 'primary' | 'secondary' | 'amber' | 'surface';

interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  tone: FeatureTone;
  eyebrow: string;
}

const toneStyles: Record<FeatureTone, string> = {
  primary:
    'border-[rgba(139,92,246,0.25)] bg-[linear-gradient(180deg,rgba(139,92,246,0.16),rgba(22,24,33,0.86))]',
  secondary:
    'border-[rgba(255,107,107,0.22)] bg-[linear-gradient(180deg,rgba(255,107,107,0.15),rgba(22,24,33,0.86))]',
  amber:
    'border-[rgba(245,158,11,0.22)] bg-[linear-gradient(180deg,rgba(245,158,11,0.12),rgba(22,24,33,0.86))]',
  surface: 'border-[#2C3142] bg-[linear-gradient(180deg,rgba(30,34,48,0.9),rgba(22,24,33,0.88))]',
};

export default function EducationDashboard() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [agentSuggestion, setAgentSuggestion] = useState<AgentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      const [materialsData, topicsData, agentData] = await Promise.all([
        apiClient.getStudyMaterials(),
        apiClient.getWeakTopics(),
        apiClient.runEducationAgent('education_dashboard'),
      ]);
      setMaterials((materialsData as StudyMaterial[]).slice(0, 4));
      setWeakTopics((topicsData as WeakTopic[]).slice(0, 5));
      setAgentSuggestion(agentData as AgentResult);
    } catch (error) {
      console.error('Error fetching education data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features: FeatureItem[] = [
    {
      title: 'Study Materials',
      description: 'Store source material and turn it into the next layer of the study workflow.',
      icon: FileText,
      path: '/education/materials',
      tone: 'primary',
      eyebrow: 'Library',
    },
    {
      title: 'Flashcards',
      description: 'Generate crisp recall cards from your saved notes and recent lessons.',
      icon: Layers,
      path: '/education/flashcards',
      tone: 'secondary',
      eyebrow: 'Recall',
    },
    {
      title: 'Mock Tests',
      description: 'Practice in a structured test mode that feels measurable and polished.',
      icon: ClipboardList,
      path: '/education/mock-tests',
      tone: 'amber',
      eyebrow: 'Practice',
    },
    {
      title: 'Weak Topics',
      description: 'Spot the topics that deserve one more pass before the next review cycle.',
      icon: TrendingDown,
      path: '/education/weak-topics',
      tone: 'surface',
      eyebrow: 'Focus',
    },
    {
      title: 'Interview Practice',
      description: 'Convert notes into stronger answers, clearer examples, and sharper storytelling.',
      icon: MessageSquare,
      path: '/education/interview',
      tone: 'primary',
      eyebrow: 'Prepare',
    },
    {
      title: 'Digit Recognizer',
      description: 'A compact ML demo that keeps the product feel grounded in something tactile.',
      icon: Brain,
      path: '/education/digit-recognizer',
      tone: 'surface',
      eyebrow: 'ML Demo',
    },
  ];

  const heroMetrics = [
    {
      label: 'Materials indexed',
      value: materials.length,
      detail: 'source nodes',
    },
    {
      label: 'Topics to review',
      value: weakTopics.length,
      detail: 'priority signals',
    },
    {
      label: 'AI next steps',
      value: agentSuggestion?.recommendations.length ?? 0,
      detail: 'action cards',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[rgba(139,92,246,0.25)] border-t-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div className="relative isolate space-y-8 overflow-hidden text-[#F8F7FC]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-6rem] top-[10rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.18),transparent_72%)] blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.12),transparent_72%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-20" />
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-[#2C3142] bg-[linear-gradient(180deg,rgba(22,24,33,0.96),rgba(13,13,18,0.92))] px-6 py-8 shadow-[0_36px_120px_-72px_rgba(0,0,0,0.95)] backdrop-blur-xl md:px-8 md:py-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_72%)] blur-3xl" />
          <div className="absolute right-12 top-12 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.18),transparent_72%)] blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#A5ADC0]">
              <Zap className="h-3.5 w-3.5 text-[#F59E0B]" />
              Premium study workspace
            </div>

            <h1 className="mt-5 max-w-2xl font-serif text-[clamp(2.7rem,5.2vw,5rem)] leading-[0.95] tracking-[-0.06em] text-[#F8F7FC]">
              Study commands, review signals, and AI prep in one cinematic dashboard.
            </h1>
            <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-[#A5ADC0] md:text-[1.02rem]">
              Move from source material to flashcards, mock tests, weak-topic review, and interview practice in a
              single workspace designed to feel polished enough for a live demo.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/education/materials"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#A855F7)] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_46px_-28px_rgba(139,92,246,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_58px_-30px_rgba(139,92,246,0.95)]"
              >
                <Plus className="h-4 w-4" />
                Add material
              </Link>
              <Link
                to="/education/flashcards"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-[#F8F7FC] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.35)] hover:bg-white/[0.08]"
              >
                <Layers className="h-4 w-4 text-[#8B5CF6]" />
                Open flashcards
              </Link>
              <Link
                to="/education/weak-topics"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#FF6B6B] transition hover:text-[#ff8787]"
              >
                Review weak topics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_16px_34px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">
                    {metric.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="font-serif text-3xl tracking-[-0.05em] text-[#F8F7FC]">{metric.value}</p>
                    <span className="rounded-full border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.09)] px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-[#C4B5FD]">
                      {metric.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_56px_-34px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#A5ADC0]">AI signal</p>
                <h2 className="mt-2 font-serif text-2xl tracking-[-0.045em] text-[#F8F7FC]">
                  {agentSuggestion?.action || 'Your next best study move'}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(139,92,246,0.22)] bg-[rgba(139,92,246,0.12)] text-[#C4B5FD]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#A5ADC0]">
              {agentSuggestion?.summary ||
                'The workspace is ready to turn your notes into flashcards, drills, tests, and interview practice.'}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniMetric label="Materials" value={materials.length} tone="primary" />
              <MiniMetric label="Focus topics" value={weakTopics.length} tone="secondary" />
              <MiniMetric label="Follow-ups" value={agentSuggestion?.follow_up_prompts.length ?? 0} tone="amber" />
            </div>

            <div className="mt-5 space-y-2">
              {(agentSuggestion?.recommendations ?? []).slice(0, 2).map((recommendation) => (
                <Link
                  key={recommendation.title}
                  to={resolveRecommendationLink(recommendation.link)}
                  className="group flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-[#1E2230]/70 px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.24)] hover:bg-[#1E2230]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F8F7FC]">{recommendation.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#A5ADC0]">{recommendation.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#8B5CF6] transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <Link
            key={feature.title}
            to={feature.path}
            style={{ animationDelay: `${Math.min(index * 70, 360)}ms` }}
            className={`group relative overflow-hidden rounded-[1.65rem] border p-5 text-left shadow-[0_22px_56px_-36px_rgba(0,0,0,0.85)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_64px_-34px_rgba(0,0,0,0.92)] ${toneStyles[feature.tone]}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16),transparent_70%)] blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-[#F8F7FC] shadow-[0_20px_34px_-26px_rgba(0,0,0,0.85)]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#A5ADC0]">
                      {feature.eyebrow}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl tracking-[-0.05em] text-[#F8F7FC]">{feature.title}</h3>
                  </div>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[#A5ADC0] transition duration-300 group-hover:border-white/15 group-hover:bg-white/[0.1] group-hover:text-[#F8F7FC]">
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-[#A5ADC0]">{feature.description}</p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#C4B5FD]">
                <span>Explore workspace</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <WorkspacePanel
          title="Recent materials"
          actionLabel="View all"
          actionPath="/education/materials"
        >
          {materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map((material, index) => (
                <Link
                  key={material.id}
                  to="/education/materials"
                  style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
                  className="group flex items-start gap-4 rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.22)] hover:bg-white/[0.06]"
                >
                  <div className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.1)] text-[#C4B5FD]">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.09)] px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#C4B5FD]">
                        {material.subject || 'General study'}
                      </span>
                      <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">
                        {formatSourceType(material.source_type)}
                      </span>
                    </div>
                    <h3 className="mt-3 truncate font-serif text-[1.35rem] tracking-[-0.04em] text-[#F8F7FC]">
                      {material.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#A5ADC0]">
                      {material.content.replace(/\s+/g, ' ').trim()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="rounded-full border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.09)] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#FFB4B4]">
                      {formatDate(material.created_at)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#8B5CF6] transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No study materials yet"
              description="Add your first source article or notes packet and this dashboard will start suggesting the next best move."
              actionLabel="Add material"
              actionPath="/education/materials"
            />
          )}
        </WorkspacePanel>

        <WorkspacePanel title="Topics to review" actionLabel="View all" actionPath="/education/weak-topics">
          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              {weakTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
                  className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(255,107,107,0.22)] hover:bg-white/[0.06]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.1)] text-[#FFB4B4]">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#F8F7FC]">{topic.topic}</p>
                      <p className="mt-1 text-xs text-[#A5ADC0]">
                        {topic.subject || 'General'} - Last seen {formatDate(topic.last_seen_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full border border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.09)] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#FCD68A]">
                      Missed {topic.miss_count}x
                    </span>
                    <Link
                      to="/education/weak-topics"
                      className="text-xs font-medium text-[#FF6B6B] transition hover:text-[#ff8787]"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrendingDown}
              title="No weak topics yet"
              description="Once you complete a few drills, the review panel will surface what needs another pass."
              actionLabel="Open mock tests"
              actionPath="/education/mock-tests"
            />
          )}
        </WorkspacePanel>
      </section>
    </div>
  );
}

function MiniMetric({ label, value, tone }: { label: string; value: number; tone: FeatureTone }) {
  const accents: Record<FeatureTone, string> = {
    primary: 'border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.1)] text-[#C4B5FD]',
    secondary: 'border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.09)] text-[#FFB4B4]',
    amber: 'border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.09)] text-[#FCD68A]',
    surface: 'border-white/10 bg-white/[0.05] text-[#F8F7FC]',
  };

  return (
    <div className={`rounded-[1.15rem] border px-3 py-3 text-center ${accents[tone]}`}>
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">{label}</p>
      <p className="mt-2 font-serif text-2xl tracking-[-0.05em] text-[#F8F7FC]">{value}</p>
    </div>
  );
}

function WorkspacePanel({
  title,
  actionLabel,
  actionPath,
  children,
}: {
  title: string;
  actionLabel: string;
  actionPath: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-[#2C3142] bg-[#161821]/90 p-5 shadow-[0_24px_56px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#A5ADC0]">Workspace</p>
          <h2 className="mt-2 font-serif text-2xl tracking-[-0.045em] text-[#F8F7FC]">{title}</h2>
        </div>
        <Link
          to={actionPath}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#F8F7FC] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.24)] hover:bg-white/[0.07]"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4 text-[#8B5CF6]" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionPath,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
}) {
  return (
    <div className="rounded-[1.65rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#C4B5FD]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-serif text-2xl tracking-[-0.04em] text-[#F8F7FC]">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#A5ADC0]">{description}</p>
      <Link
        to={actionPath}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#A855F7)] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_46px_-28px_rgba(139,92,246,0.9)] transition duration-300 hover:-translate-y-0.5"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function resolveRecommendationLink(link?: string) {
  if (!link) {
    return '/education/materials';
  }

  return link.startsWith('/') ? link : '/education/materials';
}

function formatSourceType(sourceType?: string) {
  if (!sourceType) {
    return 'Manual notes';
  }

  return sourceType
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
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
