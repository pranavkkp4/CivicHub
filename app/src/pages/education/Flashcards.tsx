import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Layers,
  Loader2,
  Mail,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import apiClient from '../../api/client';
import EmailContentDialog from '../../components/education/EmailContentDialog';
import type { Flashcard, StudyMaterial } from '../../types';

interface MaterialSignals {
  wordCount: number;
  readMinutes: number;
  flashcards: number;
  drills: number;
  interviewQuestions: number;
  sourceLabel: string;
  freshnessLabel: string;
  freshnessTone: string;
  tags: string[];
}

const normalizeFlashcards = (data: unknown): Flashcard[] => {
  if (Array.isArray(data)) {
    return data as Flashcard[];
  }

  if (data && typeof data === 'object' && Array.isArray((data as { flashcards?: unknown[] }).flashcards)) {
    return (data as { flashcards: Flashcard[] }).flashcards;
  }

  return [];
};

export default function Flashcards() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingMaterialId, setGeneratingMaterialId] = useState<number | null>(null);
  const [persistedFlashcardsByMaterial, setPersistedFlashcardsByMaterial] = useState<Record<number, Flashcard[]>>({});
  const [recentFlashcardsByMaterial, setRecentFlashcardsByMaterial] = useState<Record<number, Flashcard[]>>({});
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');
  const [emailPayload, setEmailPayload] = useState<{ subject: string; content: string } | null>(null);

  useEffect(() => {
    void fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getStudyMaterials();
      const fetchedMaterials = data as StudyMaterial[];
      setMaterials(fetchedMaterials);
      await hydratePersistedFlashcards(fetchedMaterials);
    } catch (fetchError) {
      console.error('Error fetching materials:', fetchError);
      setError('We could not load your study materials right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hydratePersistedFlashcards = async (fetchedMaterials: StudyMaterial[]) => {
    if (fetchedMaterials.length === 0) {
      setPersistedFlashcardsByMaterial({});
      return;
    }

    const persistedEntries = await Promise.allSettled(
      fetchedMaterials.map(async (material) => {
        const cards = normalizeFlashcards(await apiClient.getFlashcards(material.id));
        return [material.id, cards] as const;
      })
    );

    const nextPersisted: Record<number, Flashcard[]> = {};
    for (const entry of persistedEntries) {
      if (entry.status === 'fulfilled') {
        const [materialId, cards] = entry.value;
        nextPersisted[materialId] = cards;
      }
    }

    setPersistedFlashcardsByMaterial(nextPersisted);
  };

  const handleGenerateFlashcards = async (material: StudyMaterial) => {
    setGeneratingMaterialId(material.id);
    setError(null);

    try {
      const result = await apiClient.generateFlashcards(material.id, 10);
      const generatedFlashcards = normalizeFlashcards(result);

      if (generatedFlashcards.length === 0) {
        throw new Error('No flashcards were returned.');
      }

      setRecentFlashcardsByMaterial((current) => ({
        ...current,
        [material.id]: generatedFlashcards,
      }));

      setPersistedFlashcardsByMaterial((current) => ({
        ...current,
        [material.id]: generatedFlashcards,
      }));
    } catch (generateError) {
      console.error('Error generating flashcards:', generateError);
      setError(`We couldn't generate flashcards for "${material.title}" just now. Please try again.`);
    } finally {
      setGeneratingMaterialId(null);
    }
  };

  const openEmailForMaterial = (material: StudyMaterial, flashcards: Flashcard[]) => {
    setEmailPayload({
      subject: `Civic Hub flashcards: ${material.title}`,
      content: buildFlashcardsEmailContent(material, flashcards),
    });
    setIsEmailOpen(true);
  };

  const readyDecks = materials.filter((material) => getLatestFlashcards(material, recentFlashcardsByMaterial, persistedFlashcardsByMaterial).length > 0).length;
  const cardsGenerated = materials.reduce(
    (total, material) => total + getLatestFlashcards(material, recentFlashcardsByMaterial, persistedFlashcardsByMaterial).length,
    0
  );

  const heroMetrics = [
    {
      label: 'Source materials',
      value: materials.length,
      detail: 'ready to convert',
    },
    {
      label: 'Ready decks',
      value: readyDecks,
      detail: 'reviewable sets',
    },
    {
      label: 'Cards generated',
      value: cardsGenerated,
      detail: 'this session',
    },
  ];

  const emptyState = (
    <div className="rounded-[2rem] border border-[#2C3142] bg-[#161821]/92 p-8 text-center shadow-[0_24px_56px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.1)] text-[#C4B5FD]">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-serif text-2xl tracking-[-0.04em] text-[#F8F7FC]">Add a source article first</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#A5ADC0]">
        The generator works best when it has a real study source to learn from. Add notes, an article, or a seeded
        study pack and the deck builder will turn it into review cards.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/education/materials"
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#A855F7)] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_46px_-28px_rgba(139,92,246,0.9)] transition duration-300 hover:-translate-y-0.5"
        >
          Open materials library
          <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="text-sm text-[#A5ADC0]">
          Seeded sets include math, systems, and interview prep sources ready to use.
        </span>
      </div>
    </div>
  );

  return (
    <div className="relative isolate space-y-8 overflow-hidden text-[#F8F7FC]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-7rem] top-[-5rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-6rem] top-[8rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.18),transparent_72%)] blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.12),transparent_72%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-20" />
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-[#2C3142] bg-[linear-gradient(180deg,rgba(22,24,33,0.96),rgba(13,13,18,0.92))] px-6 py-8 shadow-[0_36px_120px_-72px_rgba(0,0,0,0.95)] backdrop-blur-xl md:px-8 md:py-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-10 top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.2),transparent_72%)] blur-3xl" />
          <div className="absolute right-12 top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.16),transparent_72%)] blur-3xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.84fr)] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#A5ADC0]">
              <Layers className="h-3.5 w-3.5 text-[#8B5CF6]" />
              Flashcards workspace
            </div>

            <h1 className="mt-5 max-w-2xl font-serif text-[clamp(2.7rem,5.1vw,4.8rem)] leading-[0.95] tracking-[-0.06em] text-[#F8F7FC]">
              Turn source material into a premium recall deck in seconds.
            </h1>
            <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-[#A5ADC0] md:text-[1.02rem]">
              Generate flashcards from saved study materials, review the latest deck right here, and email the set when
              it's ready to send.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/education/materials"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#A855F7)] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_46px_-28px_rgba(139,92,246,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_58px_-30px_rgba(139,92,246,0.95)]"
              >
                <BookOpen className="h-4 w-4" />
                Back to materials
              </Link>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-[#A5ADC0]">
                Each deck is tuned for fast review, email sharing, and mock-test prep.
              </span>
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
                    <span className="rounded-full border border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.09)] px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-[#FFB4B4]">
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
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#A5ADC0]">Generation loop</p>
                <h2 className="mt-2 font-serif text-2xl tracking-[-0.045em] text-[#F8F7FC]">
                  Smart deck workflow
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.1)] text-[#FFB4B4]">
                <WandSparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                'Choose a source article or notes packet.',
                'Generate a focused recall deck from the strongest sections.',
                'Email the cards or keep iterating from the same material.',
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-[1.15rem] border border-white/8 bg-[#1E2230]/70 px-4 py-3"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.1)] text-xs font-semibold text-[#C4B5FD]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-[#A5ADC0]">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.08)] p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#C4B5FD]">
                Session summary
              </p>
              <p className="mt-2 text-sm leading-6 text-[#F8F7FC]">
                {readyDecks > 0
                  ? `${readyDecks} deck${readyDecks === 1 ? '' : 's'} are ready to review and send.`
                  : 'Generate a deck below and the summary panel will update instantly.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[#FFB4B4] shadow-[0_18px_34px_-28px_rgba(255,107,107,0.45)]">
          {error}
        </div>
      ) : null}

      {emailNotice ? (
        <div className="rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.08)] px-4 py-3 text-sm text-[#C4B5FD] shadow-[0_18px_34px_-28px_rgba(139,92,246,0.45)]">
          {emailNotice}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex h-72 items-center justify-center rounded-[2rem] border border-[#2C3142] bg-[#161821]/92 shadow-[0_24px_56px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-[#A5ADC0]">
            <Loader2 className="h-5 w-5 animate-spin text-[#8B5CF6]" />
            <span>Loading your study materials...</span>
          </div>
        </div>
      ) : materials.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {materials.map((material, index) => {
            const latestFlashcards = getLatestFlashcards(material, recentFlashcardsByMaterial, persistedFlashcardsByMaterial);
            const signals = buildMaterialSignals(material);
            const isFeatured = index === 0;

            return (
              <article
                key={material.id}
                style={{ animationDelay: `${Math.min(index * 70, 360)}ms` }}
                className={`group relative overflow-hidden rounded-[2rem] border border-[#2C3142] bg-[linear-gradient(180deg,rgba(22,24,33,0.98),rgba(13,13,18,0.94))] p-5 shadow-[0_28px_64px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_72px_-38px_rgba(0,0,0,0.92)] ${
                  isFeatured ? 'xl:col-span-2 md:p-6' : ''
                }`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16),transparent_70%)] blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.12),transparent_72%)] blur-3xl" />
                </div>

                <div className={`relative grid gap-5 ${isFeatured ? 'xl:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(250px,0.82fr)]'}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isFeatured ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.09)] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#C4B5FD]">
                          <Sparkles className="h-3.5 w-3.5" />
                          Featured source
                        </span>
                      ) : null}
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">
                        {signals.sourceLabel}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] ${signals.freshnessTone}`}>
                        {signals.freshnessLabel}
                      </span>
                    </div>

                    <h2 className="mt-4 max-w-2xl font-serif text-[clamp(1.9rem,3.1vw,2.8rem)] leading-[1.02] tracking-[-0.055em] text-[#F8F7FC]">
                      {material.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[#A5ADC0] md:text-[0.96rem]">
                      {formatPreview(material.content)}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {signals.tags.slice(0, isFeatured ? 4 : 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.66rem] font-medium uppercase tracking-[0.18em] text-[#A5ADC0]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <SignalMetric label="Flashcards" value={latestFlashcards.length || signals.flashcards} tone="primary" />
                      <SignalMetric label="Drills" value={signals.drills} tone="secondary" />
                      <SignalMetric label="Interview Qs" value={signals.interviewQuestions} tone="amber" />
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => void handleGenerateFlashcards(material)}
                        disabled={generatingMaterialId === material.id}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8B5CF6,#A855F7)] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_46px_-28px_rgba(139,92,246,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_58px_-30px_rgba(139,92,246,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {generatingMaterialId === material.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <WandSparkles className="h-4 w-4" />
                            Generate flashcards
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openEmailForMaterial(material, latestFlashcards)}
                        disabled={latestFlashcards.length === 0}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.09)] px-5 py-3 text-sm font-semibold text-[#FFB4B4] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(255,107,107,0.28)] hover:bg-[rgba(255,107,107,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Mail className="h-4 w-4" />
                        Email cards
                      </button>
                      <Link
                        to="/education/materials"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-[#F8F7FC] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.22)] hover:bg-white/[0.08]"
                      >
                        Open source
                        <ArrowRight className="h-4 w-4 text-[#8B5CF6]" />
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[1.65rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_38px_-28px_rgba(0,0,0,0.82)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#A5ADC0]">
                          Latest deck
                        </p>
                        <p className="mt-2 font-serif text-2xl tracking-[-0.04em] text-[#F8F7FC]">
                          {latestFlashcards.length > 0 ? `${latestFlashcards.length} cards ready` : 'Ready to generate'}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#C4B5FD]">
                        <Layers className="h-5 w-5" />
                      </div>
                    </div>

                    {latestFlashcards.length > 0 ? (
                      <div className="mt-4 grid gap-3">
                        {latestFlashcards.slice(0, 4).map((card, cardIndex) => (
                          <div
                            key={`${material.id}-${card.id ?? cardIndex}`}
                            className="rounded-[1.15rem] border border-white/8 bg-[#1E2230]/78 p-4 transition duration-300 hover:border-[rgba(139,92,246,0.18)] hover:bg-[#1E2230]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#C4B5FD]">
                                Front
                              </span>
                              <CheckCircle2 className="h-4 w-4 text-[#8B5CF6]" />
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#F8F7FC]">{card.front}</p>
                            <div className="my-3 h-px bg-white/8" />
                            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">
                              Back
                            </span>
                            <p className="mt-2 text-sm leading-6 text-[#A5ADC0]">{card.back}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[1.35rem] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-[#A5ADC0]">
                        This source has not been turned into a deck yet. Generate flashcards and the preview pane will
                        fill with the latest recall set.
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between rounded-[1.15rem] border border-white/8 bg-white/[0.04] px-4 py-3">
                      <div>
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">
                          Read time
                        </p>
                        <p className="mt-1 text-sm text-[#F8F7FC]">{signals.readMinutes} min</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">
                          Source size
                        </p>
                        <p className="mt-1 text-sm text-[#F8F7FC]">{signals.wordCount} words</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">
                  <span>{formatDate(material.created_at)}</span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5" />
                    {signals.readMinutes} min read
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        emptyState
      )}

      <section className="rounded-[2rem] border border-[#2C3142] bg-[linear-gradient(135deg,rgba(139,92,246,0.16),rgba(255,107,107,0.12),rgba(22,24,33,0.92))] p-6 shadow-[0_28px_64px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#A5ADC0]">Study loop</p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.05em] text-[#F8F7FC]">Built for fast recall and clean demo flow.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#A5ADC0]">
              Use the materials library as the source of truth, generate a deck from the strongest passages, and send
              that set straight into the review loop or email handoff.
            </p>
          </div>
          <Link
            to="/education/materials"
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-[#F8F7FC] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.24)] hover:bg-white/[0.09]"
          >
            Open materials library
            <ArrowRight className="h-4 w-4 text-[#C4B5FD]" />
          </Link>
        </div>
      </section>

      <EmailContentDialog
        open={isEmailOpen}
        onOpenChange={setIsEmailOpen}
        title="Email flashcards"
        description="Send the generated flashcard set to any email address."
        defaultSubject={emailPayload?.subject || 'Civic Hub flashcards'}
        defaultContent={emailPayload?.content || ''}
        emailType="flashcards"
        sourcePage="education/flashcards"
        onSent={setEmailNotice}
      />
    </div>
  );
}

function SignalMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'primary' | 'secondary' | 'amber';
}) {
  const accents: Record<'primary' | 'secondary' | 'amber', string> = {
    primary: 'border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.1)] text-[#C4B5FD]',
    secondary: 'border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.09)] text-[#FFB4B4]',
    amber: 'border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.09)] text-[#FCD68A]',
  };

  return (
    <div className={`rounded-[1.15rem] border px-3 py-3 text-center ${accents[tone]}`}>
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">{label}</p>
      <p className="mt-2 font-serif text-2xl tracking-[-0.05em] text-[#F8F7FC]">{value}</p>
    </div>
  );
}

function buildMaterialSignals(material: Pick<StudyMaterial, 'content' | 'created_at' | 'subject' | 'source_type' | 'tags'>): MaterialSignals {
  const content = material.content || '';
  const normalized = content.toLowerCase();
  const wordCount = countWords(content);
  const readMinutes = Math.max(3, Math.round(wordCount / 170));
  const flashcards = clamp(Math.round(wordCount / 60), 6, 24);
  const drills = clamp(Math.round(wordCount / 100), 3, 14);
  const interviewQuestions = clamp(Math.round(wordCount / 140), 2, 8);
  const sourceLabel = formatSourceType(material.source_type);
  const freshness = getFreshnessState(material.created_at);

  const tags = [
    material.subject || 'General study',
    sourceLabel,
    wordCount > 420 ? 'Deep dive' : 'Quick review',
  ];

  if (Array.isArray(material.tags) && material.tags.length > 0) {
    tags.unshift(...material.tags.slice(0, 2));
  }

  const focusTokens = ['equation', 'formula', 'derive', 'example', 'project', 'concept', 'definition'];
  const focusTag = focusTokens.find((token) => normalized.includes(token));
  if (focusTag) {
    tags.unshift(focusTag === 'project' || focusTag === 'example' ? 'Interview-ready' : 'Recall-ready');
  }

  return {
    wordCount,
    readMinutes,
    flashcards,
    drills,
    interviewQuestions,
    sourceLabel,
    freshnessLabel: freshness.label,
    freshnessTone: freshness.tone,
    tags: Array.from(new Set(tags)).slice(0, 4),
  };
}

function getLatestFlashcards(
  material: StudyMaterial,
  recentFlashcardsByMaterial: Record<number, Flashcard[]>,
  persistedFlashcardsByMaterial: Record<number, Flashcard[]>
) {
  return recentFlashcardsByMaterial[material.id] ?? persistedFlashcardsByMaterial[material.id] ?? [];
}

function formatPreview(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 280) {
    return normalized;
  }

  return `${normalized.slice(0, 280).trimEnd()}...`;
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
      tone: 'border-white/10 bg-white/[0.05] text-[#A5ADC0]',
    };
  }

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return {
      label: 'Library ready',
      tone: 'border-white/10 bg-white/[0.05] text-[#A5ADC0]',
    };
  }

  const msDifference = Date.now() - parsed.getTime();
  const dayDifference = Math.floor(msDifference / (1000 * 60 * 60 * 24));

  if (dayDifference <= 1) {
    return {
      label: 'Fresh signal',
      tone: 'border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.09)] text-[#C4B5FD]',
    };
  }

  if (dayDifference <= 7) {
    return {
      label: 'Recent',
      tone: 'border-[rgba(255,107,107,0.18)] bg-[rgba(255,107,107,0.08)] text-[#FFB4B4]',
    };
  }

  return {
    label: 'Library',
    tone: 'border-white/10 bg-white/[0.05] text-[#A5ADC0]',
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

function buildFlashcardsEmailContent(material: StudyMaterial, flashcards: Flashcard[]) {
  const header = [
    `Flashcards: ${material.title}`,
    material.subject ? `Subject: ${material.subject}` : 'Subject: General study material',
    '',
  ];

  const cards = flashcards.slice(0, 20).map((card, index) => {
    return [
      `Card ${index + 1}`,
      `Front: ${card.front}`,
      `Back: ${card.back}`,
      '',
    ].join('\n');
  });

  return [...header, ...cards].join('\n');
}
