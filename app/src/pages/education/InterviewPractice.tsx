import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Loader2, Mail, MessageSquare, ShieldCheck, Sparkles, Target } from 'lucide-react';

import apiClient from '../../api/client';
import EmailContentDialog from '../../components/education/EmailContentDialog';
import type { InterviewAnswerResult, InterviewQuestion, InterviewStartResponse } from '../../types';

interface InterviewLocationState {
  topic?: string;
  materialId?: number;
  materialTitle?: string;
  materialSubject?: string;
  sourcePreview?: string;
}

interface SessionEvaluation {
  questionId: number;
  question: string;
  answer: string;
  result: InterviewAnswerResult;
}

const shellClass = 'rounded-[2rem] border border-[#2C3142] bg-[#161821]/90 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl';
const panelClass = 'rounded-3xl border border-[#2C3142] bg-[#1E2230]/85 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.85)]';

const studioSignals = [
  { label: 'Answer structure', value: 'Lead, evidence, impact', note: 'Keeps every response crisp under pressure.' },
  { label: 'Practice mode', value: 'Backend session', note: 'Questions and feedback come from the real APIs.' },
  { label: 'Delivery layer', value: 'Email-ready brief', note: 'Send the prep summary once the session is shaped.' },
];

const coachingMoments = [
  'Open with the direct answer before expanding.',
  'Use one concrete example that proves the point.',
  'Close with the tradeoff, result, or next step.',
];

export default function InterviewPractice() {
  const location = useLocation();
  const locationState = location.state as InterviewLocationState | null;

  const [topic, setTopic] = useState(locationState?.topic ?? '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluations, setEvaluations] = useState<SessionEvaluation[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');

  const trimmedTopic = topic.trim();
  const activeQuestion = questions[currentQuestionIndex] ?? null;
  const sessionComplete = questions.length > 0 && currentQuestionIndex >= questions.length;
  const answeredCount = evaluations.length;
  const averageScore = evaluations.length
    ? Math.round(evaluations.reduce((total, entry) => total + entry.result.score, 0) / evaluations.length)
    : 0;
  const sessionProgress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const latestEvaluation = evaluations[evaluations.length - 1] ?? null;
  const sourceTitle = locationState?.materialTitle ?? (trimmedTopic || 'Interview practice');
  const sourcePreview = locationState?.sourcePreview?.trim();

  const emailSubject = trimmedTopic ? `Civic Hub interview prep: ${trimmedTopic}` : 'Civic Hub interview prep';
  const emailContent = buildInterviewPrepContent({
    topic: trimmedTopic,
    materialTitle: locationState?.materialTitle,
    materialSubject: locationState?.materialSubject,
    sourcePreview: locationState?.sourcePreview,
    questions,
    evaluations,
  });

  const queueItems = questions.map((question, index) => ({
    question,
    index,
    evaluation: evaluations.find((entry) => entry.questionId === question.id) ?? null,
  }));

  const handleStart = async (event: FormEvent) => {
    event.preventDefault();
    if (!trimmedTopic) {
      setStartError('Add a topic so the interview session has something to work from.');
      return;
    }

    setIsStarting(true);
    setStartError(null);
    setAnswerError(null);

    try {
      const response = (await apiClient.startInterview({
        topic: trimmedTopic,
        difficulty,
        question_count: questionCount,
        study_material_id: locationState?.materialId,
      })) as InterviewStartResponse;

      setSessionId(response.session_id);
      setQuestions([...(response.questions ?? [])].sort((a, b) => a.order_index - b.order_index));
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      setEvaluations([]);
    } catch (error) {
      console.error('Error starting interview session:', error);
      setStartError('We could not start the interview session right now. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeQuestion) return;
    const answer = currentAnswer.trim();
    if (!answer) {
      setAnswerError('Write an answer before you submit.');
      return;
    }

    setIsSubmittingAnswer(true);
    setAnswerError(null);

    try {
      const result = (await apiClient.submitInterviewAnswer(activeQuestion.id, answer)) as InterviewAnswerResult;
      setEvaluations((current) => [...current, { questionId: activeQuestion.id, question: activeQuestion.question, answer, result }]);
      setCurrentAnswer('');
      setCurrentQuestionIndex((index) => (index + 1 < questions.length ? index + 1 : questions.length));
    } catch (error) {
      console.error('Error submitting interview answer:', error);
      setAnswerError('We could not score that answer right now. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleResetSession = () => {
    setSessionId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setEvaluations([]);
    setStartError(null);
    setAnswerError(null);
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#0D0D12] text-[#F8F7FC]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
        <div className="absolute -right-24 top-32 h-96 w-96 rounded-full bg-[#FF6B6B]/12 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.15),_transparent_56%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-[0.18]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {emailNotice ? <div className="rounded-3xl border border-[#2C3142] bg-[#1E2230]/90 px-4 py-3 text-sm shadow-[0_20px_50px_-36px_rgba(0,0,0,0.85)]"><span className="text-[#F59E0B]">Brief sent.</span> {emailNotice}</div> : null}

        <section className={`${shellClass} relative overflow-hidden p-6 lg:p-8`}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/60 to-transparent" />
            <div className="absolute right-[-3rem] top-[-2rem] h-56 w-56 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
            <div className="absolute bottom-[-4rem] left-1/3 h-64 w-64 rounded-full bg-[#FF6B6B]/10 blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2C3142] bg-[#1E2230]/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#A5ADC0]">
                <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
                AI interview workspace
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-serif text-4xl leading-[1.03] tracking-tight text-[#F8F7FC] sm:text-5xl lg:text-6xl">Practice answers that feel calm, sharp, and ready for the room.</h1>
                <p className="max-w-2xl text-base leading-7 text-[#A5ADC0] sm:text-lg">
                  Turn a topic or saved study source into a real interview session. Questions, scoring, and feedback now come from the backend so the demo behaves like a product instead of a placeholder.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {studioSignals.map((signal) => (
                  <div key={signal.label} className="rounded-2xl border border-[#2C3142] bg-[#161821]/70 p-4 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.9)]">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">{signal.label}</p>
                    <p className="mt-2 text-sm font-semibold text-[#F8F7FC]">{signal.value}</p>
                    <p className="mt-1 text-sm leading-6 text-[#A5ADC0]">{signal.note}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleStart} className={`${panelClass} space-y-5 p-5 sm:p-6`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Practice topic</p>
                    <h2 className="mt-1 text-lg font-semibold text-[#F8F7FC]">Shape the next interview round</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs text-[#A5ADC0]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#F59E0B]" />
                    Backend session ready
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-[#F8F7FC]" htmlFor="interview-topic">Interview Topic</label>
                    <input
                      id="interview-topic"
                      type="text"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      className="w-full rounded-2xl border border-[#2C3142] bg-[#0D0D12]/80 px-4 py-3 text-[#F8F7FC] outline-none transition placeholder:text-[#6E7488] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30"
                      placeholder="e.g., product strategy, algorithms, cross-functional teamwork"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F8F7FC]" htmlFor="difficulty">Difficulty</label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(event) => setDifficulty(event.target.value as 'easy' | 'medium' | 'hard')}
                      className="w-full rounded-2xl border border-[#2C3142] bg-[#0D0D12]/80 px-4 py-3 text-[#F8F7FC] outline-none transition focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F8F7FC]" htmlFor="question-count">Questions</label>
                    <select
                      id="question-count"
                      value={questionCount}
                      onChange={(event) => setQuestionCount(Number(event.target.value))}
                      className="w-full rounded-2xl border border-[#2C3142] bg-[#0D0D12]/80 px-4 py-3 text-[#F8F7FC] outline-none transition focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30"
                    >
                      {[3, 5, 7].map((count) => <option key={count} value={count}>{count} questions</option>)}
                    </select>
                  </div>
                  <div className="rounded-2xl border border-[#2C3142] bg-[#0D0D12]/65 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Source context</p>
                    <p className="mt-2 text-sm font-medium text-[#F8F7FC]">{sourceTitle}</p>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-[#A5ADC0]">{sourcePreview || 'Add a study material from Materials to anchor the session in real context.'}</p>
                  </div>
                </div>

                {startError ? <div className="rounded-2xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FFB4B4]">{startError}</div> : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isStarting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] px-5 py-3 font-medium text-white shadow-[0_18px_40px_-24px_rgba(139,92,246,0.95)] transition duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isStarting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
                    <span>Start practice session</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmailOpen(true)}
                    disabled={!trimmedTopic}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2C3142] bg-[#161821]/80 px-5 py-3 font-medium text-[#F8F7FC] transition duration-300 hover:-translate-y-[1px] hover:border-[#8B5CF6]/60 hover:bg-[#1E2230] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4 text-[#F59E0B]" />
                    Email brief
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-[#A5ADC0]">
                  <span className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1">Live answer coaching</span>
                  <span className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1">Backend scoring</span>
                  <span className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1">Email-ready recap</span>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <div className={`${panelClass} overflow-hidden p-5 sm:p-6`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">AI signal board</p>
                    <h2 className="mt-1 text-xl font-semibold text-[#F8F7FC]">What the coach is tracking</h2>
                  </div>
                  <div className="rounded-full border border-[#2C3142] bg-[#161821]/80 p-2 text-[#8B5CF6]"><Target className="h-5 w-5" /></div>
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
                    <div className="flex items-center justify-between text-sm"><span className="text-[#A5ADC0]">Session progress</span><span className="text-[#F59E0B]">{sessionProgress}%</span></div>
                    <div className="mt-3 h-2 rounded-full bg-[#0D0D12]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#8B5CF6,#FF6B6B)] transition-all duration-500" style={{ width: `${sessionProgress}%` }} /></div>
                    <p className="mt-3 text-sm text-[#A5ADC0]">The backend evaluates each answer and returns strengths, gaps, and an improved version.</p>
                  </div>
                  <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
                    <div className="flex items-center justify-between text-sm"><span className="text-[#A5ADC0]">Current focus</span><span className="text-[#8B5CF6]">{sessionId ? 'Live' : 'Ready'}</span></div>
                    <p className="mt-3 text-sm leading-6 text-[#A5ADC0]">{activeQuestion ? activeQuestion.question : 'Start a session and the current question will appear here with live scoring.'}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
                    <div className="flex items-center justify-between text-sm"><span className="text-[#A5ADC0]">Delivery layer</span><span className="text-[#FF6B6B]">{evaluations.length > 0 ? 'Scored' : 'Unscored'}</span></div>
                    <p className="mt-3 text-sm leading-6 text-[#A5ADC0]">{latestEvaluation ? latestEvaluation.result.feedback : 'Each answer turns into a feedback block you can review, email, or build on.'}</p>
                  </div>
                </div>
              </div>

              <div className={`${panelClass} p-5 sm:p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Coach notes</p>
                    <h3 className="mt-1 text-lg font-semibold text-[#F8F7FC]">A few reminders before you answer</h3>
                  </div>
                  <Clock3 className="mt-1 h-5 w-5 text-[#F59E0B]" />
                </div>
                <ul className="mt-4 space-y-3">
                  {coachingMoments.map((moment) => <li key={moment} className="flex gap-3 text-sm leading-6 text-[#A5ADC0]"><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#8B5CF6]" /><span>{moment}</span></li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className={`${panelClass} p-6 sm:p-7`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Live interview</p>
                <h2 className="mt-2 font-serif text-2xl text-[#F8F7FC]">{sessionComplete ? 'Session complete' : activeQuestion ? `Question ${currentQuestionIndex + 1}` : 'Awaiting session start'}</h2>
              </div>
              <button type="button" onClick={() => setIsEmailOpen(true)} disabled={!trimmedTopic} className="inline-flex items-center gap-2 rounded-2xl border border-[#2C3142] bg-[#161821]/80 px-4 py-2 text-sm font-medium text-[#F8F7FC] transition duration-300 hover:-translate-y-[1px] hover:border-[#8B5CF6]/60 hover:bg-[#1E2230] disabled:cursor-not-allowed disabled:opacity-50">
                <Mail className="h-4 w-4 text-[#F59E0B]" />
                Email brief
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {!sessionId ? (
                <div className="rounded-2xl border border-dashed border-[#2C3142] bg-[#0D0D12]/70 p-6">
                  <div className="flex items-center gap-2 text-[#F59E0B]"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.18em]">Session preview</span></div>
                  <h3 className="mt-4 font-serif text-2xl text-[#F8F7FC]">Start the backend interview to unlock questions and scoring.</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A5ADC0]">The page stays visually polished, but the actual question generation and answer feedback now come from the live interview APIs.</p>
                </div>
              ) : sessionComplete && !activeQuestion ? (
                <div className="rounded-2xl border border-[#2C3142] bg-[#0D0D12]/70 p-6">
                  <div className="flex items-center gap-2 text-[#8B5CF6]"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.18em]">Complete</span></div>
                  <h3 className="mt-4 font-serif text-2xl text-[#F8F7FC]">You finished the session.</h3>
                  <p className="mt-3 text-sm leading-7 text-[#A5ADC0]">Review the score cards on the right, then use the email brief to share the prep or keep iterating on the same topic.</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <SmallStat label="Answered" value={answeredCount} />
                    <SmallStat label="Average" value={`${averageScore}%`} />
                    <SmallStat label="Session" value={sessionId ? `#${sessionId}` : '—'} />
                  </div>
                  <button type="button" onClick={handleResetSession} className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#2C3142] bg-[#161821]/80 px-4 py-2 text-sm font-medium text-[#F8F7FC] transition duration-300 hover:-translate-y-[1px] hover:border-[#8B5CF6]/60 hover:bg-[#1E2230]">
                    Start over
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-5 rounded-2xl border border-[#2C3142] bg-[#0D0D12]/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">Prompt</p>
                      <h3 className="mt-2 text-2xl font-semibold text-[#F8F7FC]">{activeQuestion?.question}</h3>
                    </div>
                    <div className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs text-[#A5ADC0]">{questions.length} questions</div>
                  </div>

                  <textarea
                    value={currentAnswer}
                    onChange={(event) => setCurrentAnswer(event.target.value)}
                    className="min-h-56 w-full rounded-3xl border border-[#2C3142] bg-[#161821]/80 p-4 text-base leading-7 text-[#F8F7FC] outline-none transition placeholder:text-[#6E7488] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30"
                    placeholder="Answer in a clear, structured voice. Lead with the point, then support it."
                  />

                  {answerError ? <div className="rounded-2xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FFB4B4]">{answerError}</div> : null}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void handleSubmitAnswer()}
                      disabled={isSubmittingAnswer || !activeQuestion}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] px-5 py-3 font-medium text-white shadow-[0_18px_40px_-24px_rgba(139,92,246,0.95)] transition duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingAnswer ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      Submit answer
                    </button>
                    <button type="button" onClick={() => setIsEmailOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2C3142] bg-[#161821]/80 px-5 py-3 font-medium text-[#F8F7FC] transition duration-300 hover:-translate-y-[1px] hover:border-[#8B5CF6]/60 hover:bg-[#1E2230]">
                      <Mail className="h-4 w-4 text-[#F59E0B]" />
                      Send brief
                    </button>
                  </div>
                </div>
              )}

              {latestEvaluation ? (
                <div className="rounded-2xl border border-[#2C3142] bg-[linear-gradient(180deg,rgba(139,92,246,0.12),rgba(22,24,33,0.9))] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Latest evaluation</p>
                    <span className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs text-[#A5ADC0]">{latestEvaluation.result.score}% score</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#F8F7FC]">{latestEvaluation.result.feedback}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">Strengths</p>
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-[#F8F7FC]">
                        {latestEvaluation.result.strengths.map((strength) => <li key={strength}>• {strength}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">Sharper version</p>
                      <p className="mt-2 text-sm leading-6 text-[#A5ADC0]">{latestEvaluation.result.improved_answer}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className={`${panelClass} p-6 sm:p-7`}>
            <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Session map</p>
            <h2 className="mt-2 font-serif text-2xl text-[#F8F7FC]">What the backend generated</h2>
            <p className="mt-3 text-sm leading-6 text-[#A5ADC0]">Questions are stored in the session and the answers are scored one by one, so the interface can stay clean without losing any real interaction.</p>

            <div className="mt-6 space-y-3">
              {queueItems.length > 0 ? queueItems.map(({ question, evaluation, index }) => (
                <div key={question.id} className={`rounded-2xl border p-4 transition duration-300 ${index === currentQuestionIndex ? 'border-[#8B5CF6]/45 bg-[#8B5CF6]/10' : 'border-[#2C3142] bg-[#161821]/80'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">Question {index + 1}</p>
                      <p className="mt-2 text-sm leading-6 text-[#F8F7FC]">{question.question}</p>
                    </div>
                    <span className="rounded-full border border-[#2C3142] bg-[#161821]/90 px-3 py-1 text-xs text-[#A5ADC0]">{evaluation ? `${evaluation.result.score}%` : 'Pending'}</span>
                  </div>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-[#2C3142] bg-[#0D0D12]/70 p-5 text-sm leading-7 text-[#A5ADC0]">Start a session to populate the interview queue.</div>}
            </div>

            <div className="mt-6 rounded-2xl border border-[#2C3142] bg-[#0D0D12]/70 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Source context</p>
              <h3 className="mt-2 text-lg font-semibold text-[#F8F7FC]">{sourceTitle}</h3>
              <p className="mt-2 line-clamp-5 text-sm leading-7 text-[#A5ADC0]">{sourcePreview || 'This panel will show the saved study source preview when you launch from Materials.'}</p>
            </div>
          </section>
        </div>
      </div>

      <EmailContentDialog
        open={isEmailOpen}
        onOpenChange={setIsEmailOpen}
        title="Email interview prep"
        description="Send the generated interview brief to any email address."
        defaultSubject={emailSubject}
        defaultContent={emailContent}
        emailType="interview_prep"
        sourcePage="education/interview"
        onSent={setEmailNotice}
      />
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#F8F7FC]">{value}</p>
    </div>
  );
}

function buildInterviewPrepContent({
  topic,
  materialTitle,
  materialSubject,
  sourcePreview,
  questions,
  evaluations,
}: {
  topic: string;
  materialTitle?: string;
  materialSubject?: string;
  sourcePreview?: string;
  questions: InterviewQuestion[];
  evaluations: SessionEvaluation[];
}) {
  if (!topic) {
    return [
      'Interview prep brief',
      '',
      'Enter a topic to generate a polished interview summary that can be sent by email.',
      '',
      'Suggested structure:',
      '1. Explain the idea clearly.',
      '2. Add one practical example.',
      '3. Close with why it matters.',
    ].join('\n');
  }

  const averageScore = evaluations.length ? Math.round(evaluations.reduce((total, entry) => total + entry.result.score, 0) / evaluations.length) : null;
  const lines = [
    `Interview prep brief: ${topic}`,
    materialTitle ? `Source: ${materialTitle}` : null,
    materialSubject ? `Subject: ${materialSubject}` : null,
    '',
    `Session questions: ${questions.length}`,
    evaluations.length ? `Average score: ${averageScore}%` : 'Average score: pending',
    '',
    `1. Core idea: explain ${topic} in plain language before diving into the details.`,
    '2. Practical angle: connect the concept to a real scenario, project, or decision.',
    '3. Strong answer flow: main point, supporting detail, concise conclusion.',
    '4. Follow-up prep: be ready to define tradeoffs, assumptions, and examples.',
  ].filter((line): line is string => line !== null);

  if (sourcePreview) {
    lines.push('', 'Source preview:', sourcePreview.slice(0, 500));
  }

  if (evaluations.length > 0) {
    lines.push('', 'Latest feedback:');
    evaluations.slice(-3).forEach((entry, index) => {
      lines.push(`${index + 1}. ${entry.question}`);
      lines.push(`   Score: ${entry.result.score}%`);
      lines.push(`   Feedback: ${entry.result.feedback}`);
    });
  }

  return lines.join('\n');
}
