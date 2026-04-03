import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Loader2, Mail, TrendingDown, TriangleAlert } from 'lucide-react';

import apiClient from '../../api/client';
import EmailContentDialog from '../../components/education/EmailContentDialog';
import type { WeakTopic } from '../../types';

const shell =
  'relative overflow-hidden rounded-[2rem] border border-[#2C3142] bg-[#161821]/95 shadow-[0_36px_120px_-70px_rgba(0,0,0,0.98)] backdrop-blur-xl';
const panel =
  'rounded-[1.8rem] border border-[#2C3142] bg-[#1E2230]/92 shadow-[0_24px_80px_-54px_rgba(0,0,0,0.9)] backdrop-blur-xl';
const card =
  'rounded-[1.45rem] border border-[#2C3142] bg-[#161821]/92 shadow-[0_20px_70px_-52px_rgba(139,92,246,0.4)] transition duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/45 hover:shadow-[0_28px_90px_-56px_rgba(139,92,246,0.5)]';

export default function WeakTopicsPage() {
  const [topics, setTopics] = useState<WeakTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');

  useEffect(() => {
    void fetchTopics();
  }, []);

  const orderedTopics = useMemo(
    () =>
      [...topics].sort((left, right) => {
        if (right.miss_count !== left.miss_count) {
          return right.miss_count - left.miss_count;
        }
        return new Date(right.last_seen_at).getTime() - new Date(left.last_seen_at).getTime();
      }),
    [topics],
  );

  const summary = useMemo(() => {
    const totalMisses = orderedTopics.reduce((sum, topic) => sum + topic.miss_count, 0);
    const topSubject = orderedTopics.find((topic) => topic.subject)?.subject || 'General';
    const latestSeen = orderedTopics[0]?.last_seen_at;
    return {
      totalTopics: orderedTopics.length,
      totalMisses,
      topSubject,
      latestSeen: latestSeen ? formatShortDate(latestSeen) : 'Waiting',
    };
  }, [orderedTopics]);

  async function fetchTopics() {
    try {
      const data = await apiClient.getWeakTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching weak topics:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const trimmedContent = buildWeakTopicReview(orderedTopics);
  const emailSubject = orderedTopics.length > 0 ? `Civic Hub weak-topic review: ${orderedTopics[0]?.topic}` : 'Civic Hub weak-topic review';

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-[#2C3142] bg-[#161821] px-6 py-20 shadow-[0_36px_120px_-70px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_44%),radial-gradient(circle_at_bottom_right,rgba(255,107,107,0.12),transparent_28%)]" />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#8B5CF6]" />
          <p className="text-sm text-[#A5ADC0]">Loading your weak-topic map...</p>
        </div>
      </div>
    );
  }

  const canEmail = orderedTopics.length > 0;
  const maxMisses = Math.max(...orderedTopics.map((topic) => topic.miss_count), 1);

  return (
    <div className="space-y-6">
      <div className={`${shell} min-h-[22rem]`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,107,107,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(44,49,66,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(44,49,66,0.45)_1px,transparent_1px)] bg-[size:42px_42px] opacity-15" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F8F7FC]">
              <TrendingDown className="h-3.5 w-3.5 text-[#8B5CF6]" />
              Focus map
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl font-serif text-4xl leading-tight text-[#F8F7FC] sm:text-5xl lg:text-6xl">
                Weak topics, ranked and ready for a fast recovery session.
              </h1>
              <p className="max-w-xl text-base leading-7 text-[#A5ADC0] sm:text-lg">
                See the concepts that need attention, why they matter, and what to revisit first so your next study block feels intentional.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsEmailOpen(true)}
                disabled={!canEmail}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#9F6CFF] to-[#FF6B6B] px-5 py-3 text-sm font-semibold text-[#F8F7FC] shadow-[0_20px_50px_-22px_rgba(139,92,246,0.6)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Mail className="h-4 w-4" />
                Email review list
              </button>
              <Link
                to="/education/mock-tests"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2C3142] bg-[#1E2230]/90 px-5 py-3 text-sm font-semibold text-[#F8F7FC] transition hover:-translate-y-0.5 hover:border-[#8B5CF6]/35 hover:bg-[#1E2230]"
              >
                Generate more data
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className={panel + ' p-5'}>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#A5ADC0]">Summary</p>
                  <h2 className="mt-1 font-serif text-2xl text-[#F8F7FC]">Recovery cockpit</h2>
                </div>
                <div className="rounded-full border border-[#2C3142] bg-[#161821] px-3 py-1 text-xs font-medium text-[#A5ADC0]">
                  Priority view
                </div>
              </div>

              {orderedTopics.length > 0 ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Stat label="Topics" value={String(summary.totalTopics)} />
                    <Stat label="Misses" value={String(summary.totalMisses)} />
                    <Stat label="Top subject" value={summary.topSubject} />
                    <Stat label="Last seen" value={summary.latestSeen} />
                  </div>
                  <div className="rounded-[1.35rem] border border-[#2C3142] bg-[#161821] p-4">
                    <div className="flex items-center gap-2 text-[#F59E0B]">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Next move</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#A5ADC0]">
                      Start with the highest-miss topic, then work down the list in short focused rounds so the next mock test has a stronger baseline.
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-[#2C3142] bg-[#0D0D12]/45 p-5">
                  <div className="flex items-center gap-2 text-[#F59E0B]">
                    <TriangleAlert className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">No priorities yet</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[#A5ADC0]">
                    Take a few drills or mock tests and the review workspace will surface the topics worth revisiting first.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {emailNotice ? <div className="rounded-[1.35rem] border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-4 py-3 text-sm text-[#F8F7FC]">{emailNotice}</div> : null}

      {orderedTopics.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className={`${panel} p-5 sm:p-6`}>
            <h2 className="font-serif text-2xl text-[#F8F7FC]">Review summary</h2>
            <p className="mt-2 text-sm leading-7 text-[#A5ADC0]">
              This is the exact outline that gets sent in the email, so the workspace and the export stay aligned.
            </p>
            <div className="mt-4 whitespace-pre-wrap rounded-[1.35rem] border border-[#2C3142] bg-[#0D0D12]/55 p-5 text-sm leading-7 text-[#A5ADC0]">
              {trimmedContent}
            </div>
          </div>

          <div className="space-y-4">
            {orderedTopics.map((topic, index) => {
              const intensity = Math.max(14, Math.round((topic.miss_count / maxMisses) * 100));
              return (
                <article key={topic.id} className={`${card} p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="violet"># {index + 1}</Badge>
                        <Badge tone="surface">{topic.subject || 'General'}</Badge>
                      </div>
                      <h3 className="mt-3 line-clamp-1 font-serif text-2xl text-[#F8F7FC]">{topic.topic}</h3>
                      <p className="mt-2 text-sm text-[#A5ADC0]">
                        Missed {topic.miss_count} times
                      </p>
                    </div>
                    <Badge tone="gold">Priority</Badge>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0D0D12]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#9F6CFF] to-[#FF6B6B]"
                      style={{ width: `${intensity}%` }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-[#2C3142] bg-[#0D0D12] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">
                      {formatShortDate(topic.last_seen_at)}
                    </span>
                    <span className="text-sm text-[#A5ADC0]">Ready to review</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={`${panel} px-6 py-14 text-center`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#2C3142] bg-[#0D0D12] text-[#8B5CF6]">
            <TrendingDown className="h-8 w-8" />
          </div>
          <h3 className="mt-5 font-serif text-3xl text-[#F8F7FC]">No priority topics yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#A5ADC0]">
            Take a few drills or mock tests and the dashboard will surface the topics worth revisiting.
          </p>
          <Link
            to="/education/mock-tests"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] px-6 py-3 text-sm font-semibold text-[#F8F7FC] shadow-[0_20px_50px_-24px_rgba(139,92,246,0.6)] transition hover:-translate-y-0.5"
          >
            Go to Mock Tests
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <EmailContentDialog
        open={isEmailOpen}
        onOpenChange={setIsEmailOpen}
        title="Email weak-topic review"
        description="Send the current priority list and study plan to any email address."
        defaultSubject={emailSubject}
        defaultContent={trimmedContent}
        emailType="weak_topics_review"
        sourcePage="education/weak-topics"
        onSent={setEmailNotice}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#2C3142] bg-[#0D0D12]/55 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#A5ADC0]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[#F8F7FC]">{value}</p>
    </div>
  );
}

function Badge({ tone, children }: { tone: 'violet' | 'gold' | 'surface'; children: ReactNode }) {
  const toneClass =
    tone === 'violet'
      ? 'border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#F8F7FC]'
      : tone === 'gold'
        ? 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F8F7FC]'
        : 'border-[#2C3142] bg-[#161821] text-[#A5ADC0]';

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClass}`}>
      {children}
    </span>
  );
}

function buildWeakTopicReview(topics: WeakTopic[]) {
  if (topics.length === 0) {
    return ['Weak-topic review', '', 'No priority topics are available yet.', 'Take a few drills or mock tests and we will build a focused review list here.'].join('\n');
  }

  return [
    'Weak-topic review',
    '',
    'Priority topics:',
    ...topics.slice(0, 5).map((topic, index) => `${index + 1}. ${topic.topic} ${topic.subject ? `(${topic.subject})` : ''} - missed ${topic.miss_count} times`),
    '',
    'Recommended next step:',
    'Revisit the top topic first, then work through the remaining list with short practice sets.',
  ].join('\n');
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}
