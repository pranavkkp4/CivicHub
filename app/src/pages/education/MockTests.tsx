import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  Mail,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

import apiClient from '../../api/client';
import EmailContentDialog from '../../components/education/EmailContentDialog';
import type { MockTest, MockTestResult, StudyMaterial } from '../../types';

interface GeneratedTestState {
  materialId: number;
  materialTitle: string;
  test: MockTest;
}

interface MockTestsLocationState {
  materialId?: number;
  materialTitle?: string;
  materialSubject?: string;
  sourcePreview?: string;
}

interface RawQuestion {
  id?: number;
  question_text?: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  points?: number;
}

interface RawMockTest {
  id?: number;
  title?: string;
  description?: string;
  total_questions?: number;
  time_limit_minutes?: number;
  questions?: RawQuestion[];
}

const PLACEHOLDER_TEST_QUESTION = 'What is one key concept from the material?';
const PLACEHOLDER_TEST_OPTION = 'A detail that matches the topic';

const shell =
  'relative overflow-hidden rounded-[2rem] border border-[#2C3142] bg-[#161821]/95 shadow-[0_36px_120px_-70px_rgba(0,0,0,0.98)] backdrop-blur-xl';
const panel =
  'rounded-[1.8rem] border border-[#2C3142] bg-[#1E2230]/92 shadow-[0_24px_80px_-54px_rgba(0,0,0,0.9)] backdrop-blur-xl';
const card =
  'group relative overflow-hidden rounded-[1.45rem] border border-[#2C3142] bg-[#161821]/92 shadow-[0_20px_70px_-52px_rgba(139,92,246,0.45)] transition duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/45 hover:shadow-[0_28px_90px_-56px_rgba(139,92,246,0.55)]';

export default function MockTests() {
  const location = useLocation();
  const locationState = location.state as MockTestsLocationState | null;
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingMaterialId, setGeneratingMaterialId] = useState<number | null>(null);
  const [generatedTest, setGeneratedTest] = useState<GeneratedTestState | null>(null);
  const [focusedMaterialId, setFocusedMaterialId] = useState<number | null>(locationState?.materialId ?? null);
  const [persistedTestsByMaterial, setPersistedTestsByMaterial] = useState<Record<number, MockTest[]>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedResult, setSubmittedResult] = useState<MockTestResult | null>(null);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');
  const [generationNotice, setGenerationNotice] = useState('');

  useEffect(() => {
    void fetchMaterials();
  }, []);

  const orderedMaterials = useMemo(
    () =>
      [...materials].sort((left, right) => {
        const rightTime = new Date(right.created_at).getTime();
        const leftTime = new Date(left.created_at).getTime();
        return rightTime - leftTime;
      }),
    [materials],
  );

  useEffect(() => {
    if (!focusedMaterialId && orderedMaterials[0]) {
      setFocusedMaterialId(orderedMaterials[0].id);
    }
  }, [focusedMaterialId, orderedMaterials]);

  const featuredMaterial = useMemo(
    () => orderedMaterials.find((material) => material.id === focusedMaterialId) ?? orderedMaterials[0],
    [focusedMaterialId, orderedMaterials],
  );
  const featuredSavedTests = featuredMaterial ? persistedTestsByMaterial[featuredMaterial.id] ?? [] : [];
  const activeTest = generatedTest;
  const totalSavedTests = useMemo(
    () => Object.values(persistedTestsByMaterial).reduce((count, tests) => count + tests.length, 0),
    [persistedTestsByMaterial],
  );
  const heroStats = [
    { label: 'Materials', value: String(materials.length), icon: BookOpenCheck },
    { label: 'Saved tests', value: String(totalSavedTests), icon: ClipboardList },
    { label: 'Preview', value: submittedResult ? 'Scored' : activeTest ? 'Live' : 'Ready', icon: Sparkles },
  ];

  async function fetchMaterials() {
    try {
      setError(null);
      const data = await apiClient.getStudyMaterials();
      const fetchedMaterials = data as StudyMaterial[];
      setMaterials(fetchedMaterials);
      await hydratePersistedMockTests(fetchedMaterials);
    } catch (fetchError) {
      console.error('Error fetching materials:', fetchError);
      setError('We could not load your study materials right now. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  }

  async function hydratePersistedMockTests(fetchedMaterials: StudyMaterial[]) {
    if (fetchedMaterials.length === 0) {
      setPersistedTestsByMaterial({});
      return;
    }

    const persistedEntries = await Promise.allSettled(
      fetchedMaterials.map(async (material) => {
        const tests = await apiClient.getMockTests(material.id);
        const normalizedTests = Array.isArray(tests)
          ? tests
              .map((test) => normalizeTest(material, test as RawMockTest))
              .filter((test): test is MockTest => test !== null)
          : [];
        return [material.id, normalizedTests] as const;
      })
    );

    const nextPersisted: Record<number, MockTest[]> = {};
    for (const entry of persistedEntries) {
      if (entry.status === 'fulfilled') {
        const [materialId, tests] = entry.value;
        nextPersisted[materialId] = tests;
      }
    }

    setPersistedTestsByMaterial(nextPersisted);
  }

  function normalizeTest(material: StudyMaterial, rawTest?: RawMockTest): MockTest | null {
    const questions = Array.isArray(rawTest?.questions)
      ? rawTest.questions
          .filter((question) => question && question.question_text)
          .map((question, index) => ({
            id: question.id ?? index + 1,
            question_text: question.question_text ?? `Question ${index + 1}`,
            options: Array.isArray(question.options) ? question.options : [],
            correct_answer: question.correct_answer ?? '',
            explanation: question.explanation ?? '',
            points: question.points ?? 1,
          }))
      : [];

    const looksLikePlaceholderTest = questions.length === 1
      && questions[0].question_text === PLACEHOLDER_TEST_QUESTION
      && questions[0].options?.includes(PLACEHOLDER_TEST_OPTION);

    if (questions.length > 0 && !looksLikePlaceholderTest) {
      return {
        id: rawTest?.id ?? Date.now(),
        title: rawTest?.title || `${material.title} Practice Test`,
        description: rawTest?.description || `A focused practice test based on ${material.title}.`,
        total_questions: rawTest?.total_questions ?? questions.length,
        time_limit_minutes: rawTest?.time_limit_minutes ?? 30,
        questions,
      };
    }

    return null;
  }

  async function handleGenerateTest(material: StudyMaterial) {
    setFocusedMaterialId(material.id);
    setGeneratingMaterialId(material.id);
    setError(null);
    setGenerationNotice('');

    try {
      const rawTest = await apiClient.generateMockTest(material.id, 10);
      const normalizedTest = normalizeTest(material, rawTest as RawMockTest);
      if (!normalizedTest) {
        throw new Error('The AI provider returned a placeholder test.');
      }
      setSelectedAnswers({});
      setSubmittedResult(null);
      setGeneratedTest({ materialId: material.id, materialTitle: material.title, test: normalizedTest });
      await hydratePersistedMockTests([material]);
    } catch (generationError) {
      console.error('Error generating test:', generationError);
      const fallbackTest = (persistedTestsByMaterial[material.id] ?? [])[0];
      if (fallbackTest) {
        setSelectedAnswers({});
        setSubmittedResult(null);
        setGeneratedTest({ materialId: material.id, materialTitle: material.title, test: fallbackTest });
        setGenerationNotice(`Live generation is unavailable right now. Showing the most recent saved quiz for "${material.title}" instead.`);
      } else {
        setGeneratedTest(null);
        setError(`We could not generate a new test for "${material.title}" right now, and there is no saved quiz for this material yet.`);
      }
    } finally {
      setGeneratingMaterialId(null);
    }
  }

  function handleSelectAnswer(questionId: number, option: string) {
    if (submittedResult) {
      return;
    }

    setSelectedAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  }

  async function handleSubmitGeneratedTest() {
    if (!activeTest) {
      return;
    }

    const answers = activeTest.test.questions
      .map((question) => {
        const questionId = question.id;
        if (typeof questionId !== 'number') {
          return null;
        }

        const answer = selectedAnswers[questionId];
        if (!answer) {
          return null;
        }

        return {
          question_id: questionId,
          answer,
        };
      })
      .filter((entry): entry is { question_id: number; answer: string } => entry !== null);

    if (answers.length !== activeTest.test.questions.length) {
      setError('Select an answer for every question before scoring the test.');
      return;
    }

    setIsSubmittingTest(true);
    setError(null);

    try {
      const result = await apiClient.submitMockTest(activeTest.test.id, answers);
      setSubmittedResult(result as MockTestResult);
    } catch (submitError) {
      console.error('Error submitting mock test:', submitError);
      setError('We could not score this test right now. Please try again.');
    } finally {
      setIsSubmittingTest(false);
    }
  }

  const canEmail = Boolean(activeTest);
  const answeredCount = activeTest
    ? activeTest.test.questions.filter((question) => typeof question.id === 'number' && selectedAnswers[question.id]).length
    : 0;
  const canSubmitGeneratedTest = Boolean(
    activeTest && answeredCount === activeTest.test.questions.length && activeTest.test.questions.length > 0,
  );

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-[#2C3142] bg-[#161821] px-6 py-20 shadow-[0_36px_120px_-70px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.20),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(255,107,107,0.12),transparent_30%)]" />
        <div className="relative flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#8B5CF6]" />
          <p className="text-sm text-[#A5ADC0]">Loading your study materials and practice tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${shell} min-h-[24rem]`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,107,107,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(44,49,66,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(44,49,66,0.45)_1px,transparent_1px)] bg-[size:42px_42px] opacity-15" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="flex flex-col justify-between gap-6">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F8F7FC]">
                <Target className="h-3.5 w-3.5 text-[#8B5CF6]" />
                AI exam cockpit
              </div>
              <div className="space-y-4">
                <h1 className="max-w-2xl font-serif text-4xl leading-tight text-[#F8F7FC] sm:text-5xl lg:text-6xl">
                  Generate mock tests with a cinematic, high-velocity study workflow.
                </h1>
                <p className="max-w-xl text-base leading-7 text-[#A5ADC0] sm:text-lg">
                  Turn every uploaded material into a polished practice test, then review the generated questions in a premium preview workspace.
                </p>
                {locationState?.materialTitle ? (
                  <div className="inline-flex max-w-fit items-center gap-2 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C4B5FD]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Pinned from Materials: {locationState.materialTitle}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (featuredMaterial) {
                      void handleGenerateTest(featuredMaterial);
                    }
                  }}
                  disabled={!featuredMaterial || generatingMaterialId === featuredMaterial?.id}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#9F6CFF] to-[#FF6B6B] px-5 py-3 text-sm font-semibold text-[#F8F7FC] shadow-[0_20px_50px_-22px_rgba(139,92,246,0.6)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_65px_-26px_rgba(255,107,107,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {featuredMaterial && generatingMaterialId === featuredMaterial.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate featured test
                    </>
                  )}
                </button>
                <Link
                  to="/education/materials"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2C3142] bg-[#1E2230]/90 px-5 py-3 text-sm font-semibold text-[#F8F7FC] transition duration-300 hover:-translate-y-0.5 hover:border-[#8B5CF6]/35 hover:bg-[#1E2230]"
                >
                  Add or refine material
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-[1.35rem] border border-[#2C3142] bg-[#0D0D12]/45 px-4 py-3">
                    <div className="flex items-center gap-2 text-[#A5ADC0]">
                      <Icon className="h-4 w-4 text-[#F59E0B]" />
                      <span className="text-xs uppercase tracking-[0.18em]">{stat.label}</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-[#F8F7FC]">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={panel + ' p-5'}>
            <div className="absolute right-4 top-4 h-24 w-24 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
            <div className="absolute bottom-6 left-0 h-20 w-20 rounded-full bg-[#FF6B6B]/15 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#A5ADC0]">Workspace summary</p>
                  <h2 className="mt-1 font-serif text-2xl text-[#F8F7FC]">AI test cockpit</h2>
                </div>
                <div className="rounded-full border border-[#2C3142] bg-[#161821] px-3 py-1 text-xs font-medium text-[#A5ADC0]">
                  Premium preview
                </div>
              </div>

              {activeTest ? (
                <>
                  <div className="rounded-[1.35rem] border border-[#2C3142] bg-[#161821] p-4">
                    <div className="flex items-center gap-2 text-[#8B5CF6]">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                        Generated from
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-2xl text-[#F8F7FC]">{activeTest.test.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#A5ADC0]">{activeTest.test.description}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Questions" value={String(activeTest.test.questions.length)} />
                    <Metric label="Time" value={`${activeTest.test.time_limit_minutes || 30} min`} />
                    <Metric label="Points" value={String(activeTest.test.questions.reduce((sum, q) => sum + (q.points ?? 1), 0))} />
                  </div>
                  <button
                    onClick={() => setIsEmailOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-semibold text-[#F8F7FC] transition duration-300 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canEmail}
                  >
                    <Mail className="h-4 w-4 text-[#8B5CF6]" />
                    Email this test
                  </button>
                </>
              ) : (
                <div className="space-y-4 rounded-[1.35rem] border border-dashed border-[#2C3142] bg-[#0D0D12]/50 p-5">
                  <div className="flex items-center gap-2 text-[#F59E0B]">
                    <ClipboardList className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">Preview state</span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#F8F7FC]">Generate a test to unlock the question preview.</h3>
                  <p className="text-sm leading-6 text-[#A5ADC0]">
                    Select a study material on the left and we will render the full practice set here with answer key and timing info.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Format" value="Exam mode" />
                    <Metric label="Review" value="Instant" />
                    <Metric label="Delivery" value="Email ready" />
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Featured source" value={featuredMaterial ? shortLabel(featuredMaterial.title) : 'None yet'} />
                <Metric label="Saved tests" value={String(featuredSavedTests.length)} />
                <Metric label="Last added" value={featuredMaterial ? formatShortDate(featuredMaterial.created_at) : 'Waiting'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-[#FF6B6B]/20 bg-[#FF6B6B]/10 px-5 py-4 text-[#F8F7FC]">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B6B]" />
            <div>
              <p className="font-medium">Something needs a quick retry</p>
              <p className="mt-1 text-sm text-[#A5ADC0]">{error}</p>
              <button
                onClick={() => void fetchMaterials()}
                className="mt-4 rounded-full border border-[#FF6B6B]/25 bg-[#161821] px-4 py-2 text-sm font-semibold text-[#F8F7FC] transition hover:border-[#FF6B6B]/40 hover:bg-[#1E2230]"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {generationNotice ? (
        <div className="rounded-[1.35rem] border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F8F7FC]">
          {generationNotice}
        </div>
      ) : null}
      {emailNotice ? <div className="rounded-[1.35rem] border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-4 py-3 text-sm text-[#F8F7FC]">{emailNotice}</div> : null}

      {materials.length === 0 ? (
        <div className={`${panel} px-6 py-14 text-center`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#2C3142] bg-[#0D0D12] text-[#8B5CF6]">
            <ClipboardList className="h-8 w-8" />
          </div>
          <h2 className="mt-5 font-serif text-3xl text-[#F8F7FC]">No study materials yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#A5ADC0]">
            Add a reading, note set, or lecture handout first. Once the material is in place, the platform can build a polished practice test from it.
          </p>
          <Link
            to="/education/materials"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] px-6 py-3 text-sm font-semibold text-[#F8F7FC] shadow-[0_20px_50px_-24px_rgba(139,92,246,0.6)] transition hover:-translate-y-0.5"
          >
            Go to Materials
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.03fr_0.97fr]">
          <div className={`${panel} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#A5ADC0]">Materials</p>
                <h2 className="mt-1 font-serif text-2xl text-[#F8F7FC]">Choose a source and generate a test</h2>
              </div>
              <div className="rounded-full border border-[#2C3142] bg-[#161821] px-3 py-1 text-xs font-medium text-[#A5ADC0]">
                {materials.length} items
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {orderedMaterials.map((material, index) => {
                const testCount = persistedTestsByMaterial[material.id]?.length ?? 0;
                const isGenerating = generatingMaterialId === material.id;
                const isFeatured = index === 0;
                const isSelected = focusedMaterialId === material.id;

                return (
                  <article
                    key={material.id}
                    className={`${card} p-5 ${
                      isSelected
                        ? 'border-[#8B5CF6]/55 shadow-[0_28px_90px_-52px_rgba(139,92,246,0.62)]'
                        : ''
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,107,107,0.08),transparent_38%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                    <div className="relative space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <Pill tone="violet">{material.subject || 'General'}</Pill>
                            <Pill tone="surface">{material.source_type || 'Study material'}</Pill>
                            {isFeatured ? <Pill tone="gold">Featured</Pill> : null}
                            {isSelected ? <Pill tone="violet">Selected</Pill> : null}
                          </div>
                          <h3 className="mt-3 line-clamp-2 font-serif text-2xl text-[#F8F7FC]">{material.title}</h3>
                        </div>
                        <div className="rounded-full border border-[#2C3142] bg-[#0D0D12] px-3 py-1 text-xs font-medium text-[#A5ADC0]">
                          {formatShortDate(material.created_at)}
                        </div>
                      </div>

                      <p className="line-clamp-4 text-sm leading-7 text-[#A5ADC0]">{material.content}</p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <Metric label="Saved tests" value={String(testCount)} compact />
                        <Metric label="Readability" value={estimateReadability(material.content)} compact />
                        <Metric label="Status" value={isGenerating ? 'Working' : 'Ready'} compact />
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => void handleGenerateTest(material)}
                          disabled={isGenerating}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#9F6CFF] to-[#FF6B6B] px-4 py-3 text-sm font-semibold text-[#F8F7FC] shadow-[0_18px_45px_-22px_rgba(139,92,246,0.6)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Generate test
                            </>
                          )}
                        </button>
                        <Link
                          to="/education/materials"
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2C3142] bg-[#1E2230]/90 px-4 py-3 text-sm font-semibold text-[#F8F7FC] transition hover:border-[#8B5CF6]/35 hover:bg-[#1E2230]"
                        >
                          Refine source
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className={`${panel} p-5 sm:p-6`}>
            {activeTest ? (
              <div className="space-y-5">
                <div className="rounded-[1.4rem] border border-[#2C3142] bg-[#161821] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Pill tone="violet">Generated test</Pill>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">
                      <Clock3 className="h-4 w-4 text-[#F59E0B]" />
                      {activeTest.test.time_limit_minutes || 30} min
                    </div>
                  </div>
                  <h2 className="mt-4 font-serif text-3xl text-[#F8F7FC]">{activeTest.test.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#A5ADC0]">{activeTest.test.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Based on {activeTest.materialTitle}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric label="Questions" value={String(activeTest.test.questions.length)} />
                  <Metric label="Points" value={String(activeTest.test.questions.reduce((sum, q) => sum + (q.points ?? 1), 0))} />
                  <Metric label="Material" value={shortLabel(activeTest.materialTitle)} />
                </div>
                {submittedResult ? (
                  <div className="rounded-[1.35rem] border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#C4B5FD]">Scored result</p>
                        <p className="mt-2 text-3xl font-semibold text-[#F8F7FC]">
                          {submittedResult.percentage.toFixed(0)}%
                        </p>
                      </div>
                      <div className="rounded-full border border-[#2C3142] bg-[#0D0D12]/55 px-4 py-2 text-sm text-[#A5ADC0]">
                        {submittedResult.earned_points}/{submittedResult.total_points} points
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#2C3142] bg-[#161821]/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#F8F7FC]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#8B5CF6]" />
                        Test submitted
                      </span>
                      {submittedResult.weak_topics.length > 0 ? (
                        <Link
                          to="/education/weak-topics"
                          className="inline-flex items-center gap-2 rounded-full border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FFB4B4] transition hover:border-[#FF6B6B]/45"
                        >
                          Review weak topics
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-[#2C3142] bg-[#0D0D12]/55 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">Answer progress</p>
                        <p className="mt-2 text-lg font-semibold text-[#F8F7FC]">
                          {answeredCount}/{activeTest.test.questions.length} questions answered
                        </p>
                      </div>
                      <button
                        onClick={() => void handleSubmitGeneratedTest()}
                        disabled={!canSubmitGeneratedTest || isSubmittingTest}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF6B6B] px-4 py-3 text-sm font-semibold text-[#F8F7FC] shadow-[0_18px_45px_-22px_rgba(139,92,246,0.6)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmittingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Score this test
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setIsEmailOpen(true)}
                  disabled={!canEmail}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-semibold text-[#F8F7FC] transition duration-300 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Mail className="h-4 w-4 text-[#8B5CF6]" />
                  Email this test
                </button>
                <div className="space-y-4">
                  {activeTest.test.questions.map((question, index) => (
                    <article key={question.id ?? index} className="rounded-[1.35rem] border border-[#2C3142] bg-[#0D0D12]/55 p-4 transition hover:border-[#8B5CF6]/35">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Question {index + 1}</p>
                          <h3 className="mt-1 text-base font-semibold leading-7 text-[#F8F7FC]">{question.question_text}</h3>
                        </div>
                        <Pill tone="gold">{question.points ?? 1} pt</Pill>
                      </div>
                      {question.options?.length ? (
                        <div className="mt-4 grid gap-2">
                          {question.options.map((option) => {
                            const questionId = question.id ?? index;
                            const isSelected = selectedAnswers[questionId] === option;
                            const answerResult = submittedResult?.answers.find((answer) => answer.question_id === questionId);
                            const isCorrect = option === question.correct_answer;
                            const isIncorrectSelection = Boolean(answerResult && isSelected && !isCorrect);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleSelectAnswer(questionId, option)}
                                disabled={Boolean(submittedResult)}
                                className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${
                                  submittedResult
                                    ? isCorrect
                                      ? 'border-[#8B5CF6]/35 bg-[#8B5CF6]/12 text-[#F8F7FC]'
                                      : isIncorrectSelection
                                        ? 'border-[#FF6B6B]/35 bg-[#FF6B6B]/12 text-[#F8F7FC]'
                                        : 'border-[#2C3142] bg-[#161821] text-[#A5ADC0]'
                                    : isSelected
                                      ? 'border-[#8B5CF6]/35 bg-[#8B5CF6]/12 text-[#F8F7FC]'
                                      : 'border-[#2C3142] bg-[#161821] text-[#A5ADC0] hover:border-[#8B5CF6]/25 hover:bg-[#1E2230]'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {submittedResult ? (
                        <details className="mt-4 rounded-2xl border border-[#2C3142] bg-[#161821]/90 px-4 py-3">
                          <summary className="cursor-pointer list-none text-sm font-semibold text-[#F8F7FC]">Show answer and explanation</summary>
                          <div className="mt-3 space-y-2 text-sm leading-7 text-[#A5ADC0]">
                            <p>
                              <span className="font-semibold text-[#F8F7FC]">Answer:</span> {question.correct_answer || 'Not provided'}
                            </p>
                            {question.explanation ? <p>{question.explanation}</p> : null}
                          </div>
                        </details>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[34rem] flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-[#2C3142] bg-[#0D0D12]/45 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#2C3142] bg-[#161821] text-[#8B5CF6]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h2 className="mt-5 font-serif text-3xl text-[#F8F7FC]">Generate a test to preview it here</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-[#A5ADC0]">
                  Pick a study material on the left, generate a practice test, and the full set of questions will appear here immediately.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <span className="rounded-full border border-[#2C3142] bg-[#161821] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">Live answer key</span>
                  <span className="rounded-full border border-[#2C3142] bg-[#161821] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A5ADC0]">Email ready</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <EmailContentDialog
        open={isEmailOpen}
        onOpenChange={setIsEmailOpen}
        title="Email mock test"
        description="Send the generated test and answer key to any email address."
        defaultSubject={activeTest ? `Civic Hub mock test: ${activeTest.materialTitle}` : 'Civic Hub mock test'}
        defaultContent={activeTest ? buildMockTestEmailContent(activeTest) : ''}
        emailType="mock_test"
        sourcePage="education/mock-tests"
        onSent={setEmailNotice}
      />
    </div>
  );
}

function Metric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`rounded-[1.2rem] border border-[#2C3142] bg-[#0D0D12]/55 px-4 py-3 ${compact ? 'shadow-[0_16px_38px_-32px_rgba(0,0,0,0.7)]' : ''}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#A5ADC0]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[#F8F7FC]">{value}</p>
    </div>
  );
}

function Pill({ tone, children }: { tone: 'violet' | 'gold' | 'surface'; children: ReactNode }) {
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

function buildMockTestEmailContent(generatedTest: GeneratedTestState) {
  const lines: string[] = [`Mock test: ${generatedTest.test.title}`, `Material: ${generatedTest.materialTitle}`, generatedTest.test.description || 'Practice test generated by Civic Hub.', ''];
  generatedTest.test.questions.forEach((question, index) => {
    lines.push(`Question ${index + 1}: ${question.question_text}`);
    question.options?.forEach((option) => lines.push(`- ${option}`));
    lines.push(`Answer: ${question.correct_answer || 'Not provided'}`);
    if (question.explanation) lines.push(`Explanation: ${question.explanation}`);
    lines.push('');
  });
  return lines.join('\n');
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function estimateReadability(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  if (words < 80) return 'Quick';
  if (words < 180) return 'Balanced';
  return 'Dense';
}

function shortLabel(value: string) {
  return value.length <= 20 ? value : `${value.slice(0, 17)}...`;
}
