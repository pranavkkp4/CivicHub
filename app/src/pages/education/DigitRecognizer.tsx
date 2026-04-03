import { useCallback, useEffect, useRef, useState } from 'react';
import { BarChart3, Brain, ChevronRight, Info, RefreshCw, Sparkles, Target } from 'lucide-react';

import apiClient from '../../api/client';

type Point = {
  x: number;
  y: number;
};

const shellClass =
  'rounded-[2rem] border border-[#2C3142] bg-[#161821]/90 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.95)] backdrop-blur-xl';
const panelClass = 'rounded-3xl border border-[#2C3142] bg-[#1E2230]/85 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.85)]';

const modelNotes = [
  {
    label: 'Classifier',
    value: 'KNN + standardization',
    note: 'Matches the classic sklearn digits workflow.',
  },
  {
    label: 'Input',
    value: 'Centered 8x8 digit',
    note: 'Bold strokes and a clean silhouette help most.',
  },
  {
    label: 'Output',
    value: 'Probability spread',
    note: 'Inspect the confidence trail across all ten classes.',
  },
];

const learningCards = [
  {
    title: 'Classification',
    body: 'The model maps your drawing to one of ten digit classes and returns the most likely result first.',
  },
  {
    title: 'Feature extraction',
    body: 'The preprocessing step centers the digit and converts it into the same compact grayscale format used in training.',
  },
  {
    title: 'Confidence scores',
    body: 'Each class receives a probability, which makes the prediction easier to trust, compare, and explain.',
  },
];

export default function DigitRecognizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [probabilities, setProbabilities] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const prepareCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#111827';
    ctx.imageSmoothingEnabled = true;
  }, []);

  useEffect(() => {
    prepareCanvas();
  }, [prepareCanvas]);

  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();

    return {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    };
  }, []);

  const startDrawing = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      setIsDrawing(true);
      lastPointRef.current = getPoint(e);

      if (canvas.setPointerCapture) {
        canvas.setPointerCapture(e.pointerId);
      }
    },
    [getPoint]
  );

  const draw = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const point = getPoint(e);
      if (!lastPointRef.current) {
        lastPointRef.current = point;
        return;
      }

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      lastPointRef.current = point;
    },
    [getPoint, isDrawing]
  );

  const stopDrawing = useCallback((e?: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (canvas && e?.pointerId !== undefined && canvas.releasePointerCapture) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }, []);

  const clearCanvas = () => {
    prepareCanvas();
    setIsDrawing(false);
    lastPointRef.current = null;
    setPrediction(null);
    setConfidence(null);
    setProbabilities(null);
  };

  const recognizeDigit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
            return;
          }

          reject(new Error('Unable to export the drawing.'));
        }, 'image/png');
      });

      const file = new File([blob], 'digit.png', { type: 'image/png' });
      const result = await apiClient.recognizeDigit(file);

      setPrediction(result.prediction);
      setConfidence(result.confidence);
      setProbabilities(result.all_probabilities);
    } catch (error) {
      console.error('Error recognizing digit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedProbabilities = probabilities
    ? Object.entries(probabilities).sort(([, a], [, b]) => b - a)
    : [];

  const confidenceLabel = confidence !== null ? `${(confidence * 100).toFixed(1)}%` : 'Waiting';

  return (
    <div className="relative min-h-full overflow-hidden bg-[#0D0D12] text-[#F8F7FC]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
        <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-[#FF6B6B]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.16),_transparent_56%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-[0.18]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className={`${shellClass} relative overflow-hidden p-6 lg:p-8`}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/60 to-transparent" />
            <div className="absolute right-[-3rem] top-[-2rem] h-56 w-56 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
            <div className="absolute bottom-[-4rem] left-1/3 h-64 w-64 rounded-full bg-[#F59E0B]/10 blur-3xl" />
          </div>

          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2C3142] bg-[#1E2230]/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#A5ADC0]">
                <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
                ML demo workspace
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl font-serif text-4xl leading-[1.03] tracking-tight text-[#F8F7FC] sm:text-5xl lg:text-6xl">
                  Draw a digit and watch the model read it like a product demo.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#A5ADC0] sm:text-lg">
                  A polished handwritten digit studio with probability feedback, inference guidance,
                  and a clear explanation of how the classifier thinks.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {modelNotes.map((note) => (
                  <div
                    key={note.label}
                    className="rounded-2xl border border-[#2C3142] bg-[#161821]/70 p-4 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.9)]"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">{note.label}</p>
                    <p className="mt-2 text-sm font-semibold text-[#F8F7FC]">{note.value}</p>
                    <p className="mt-1 text-sm leading-6 text-[#A5ADC0]">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className={`${panelClass} p-5 sm:p-6`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Model signal</p>
                    <h2 className="mt-1 text-xl font-semibold text-[#F8F7FC]">Live inference at a glance</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInfo((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#A5ADC0] transition duration-300 hover:border-[#8B5CF6]/60 hover:text-[#F8F7FC]"
                  >
                    <Info className="h-3.5 w-3.5 text-[#F59E0B]" />
                    {showInfo ? 'Hide' : 'Learn more'}
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#A5ADC0]">Confidence</span>
                      <span className="text-[#F59E0B]">{confidenceLabel}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#0D0D12]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#8B5CF6,#FF6B6B)] transition-all duration-500"
                        style={{ width: confidence !== null ? `${confidence * 100}%` : '24%' }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-[#A5ADC0]">Confidence updates after recognition and helps judge certainty.</p>
                  </div>

                  <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#A5ADC0]">Guide overlay</span>
                      <span className="text-[#8B5CF6]">{showGuide ? 'On' : 'Off'}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#A5ADC0]">
                      The helper frame keeps the digit centered so the classifier gets a cleaner silhouette.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#A5ADC0]">Output state</span>
                      <span className="text-[#FF6B6B]">{prediction !== null ? 'Predicted' : 'Waiting'}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#A5ADC0]">
                      Draw once, recognize once, and inspect the probability trail for the full class spread.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showInfo ? (
          <section className={`${panelClass} p-6 sm:p-7`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">How it works</p>
                <h2 className="mt-2 font-serif text-2xl text-[#F8F7FC]">The demo is simple, but the signal is real.</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#A5ADC0] transition hover:border-[#8B5CF6]/60 hover:text-[#F8F7FC]"
              >
                Collapse
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-5">
                <p className="text-sm font-semibold text-[#F8F7FC]">Best drawing habits</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#A5ADC0]">
                  <li>- Keep the digit centered in the canvas.</li>
                  <li>- Use one bold stroke instead of many thin marks.</li>
                  <li>- Fill most of the frame without touching the edges.</li>
                  <li>- Avoid extra decoration or overlapping symbols.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#2C3142] bg-[#161821]/80 p-5">
                <p className="text-sm font-semibold text-[#F8F7FC]">Technical details</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#A5ADC0]">
                  <li>- Model: K-nearest neighbors with standardized features.</li>
                  <li>- Dataset: sklearn digits, trained on 8x8 grayscale samples.</li>
                  <li>- Output: class prediction plus per-digit probabilities.</li>
                  <li>- Input: centered canvas exported as a PNG.</li>
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${panelClass} p-6 sm:p-7`}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Canvas input</p>
                <h2 className="mt-2 font-serif text-2xl text-[#F8F7FC]">Draw a digit</h2>
                <p className="mt-2 text-sm text-[#A5ADC0]">A single bold character performs best.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide((value) => !value)}
                className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#A5ADC0] transition duration-300 hover:border-[#8B5CF6]/60 hover:text-[#F8F7FC]"
              >
                {showGuide ? 'Hide guide' : 'Show guide'}
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#2C3142] bg-[#0D0D12] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.14),_transparent_62%)]" />
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                onPointerCancel={stopDrawing}
                className="relative block h-auto w-full cursor-crosshair touch-none rounded-[1.25rem] border border-[#2C3142] bg-white"
                style={{ width: '100%', maxWidth: '280px', aspectRatio: '1' }}
              />
              {showGuide ? (
                <div className="pointer-events-none absolute inset-3 rounded-[1.1rem] border border-[#8B5CF6]/25">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#8B5CF6]/20" />
                  <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#FF6B6B]/18" />
                  <div className="absolute inset-x-0 bottom-3 text-center text-[0.7rem] uppercase tracking-[0.2em] text-[#A5ADC0]">
                    Keep the digit centered
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2C3142] bg-[#161821]/80 px-4 py-3 font-medium text-[#F8F7FC] transition duration-300 hover:-translate-y-[1px] hover:border-[#8B5CF6]/60 hover:bg-[#1E2230]"
              >
                <RefreshCw className="h-4 w-4 text-[#F59E0B]" />
                Clear
              </button>
              <button
                type="button"
                onClick={recognizeDigit}
                disabled={isLoading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] px-4 py-3 font-medium text-white shadow-[0_18px_40px_-24px_rgba(139,92,246,0.95)] transition duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Recognize
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#A5ADC0]">
              <span className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1">Touch-friendly canvas</span>
              <span className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1">Fast export to PNG</span>
              <span className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1">Built for demos</span>
            </div>
          </section>

          <section className={`${panelClass} p-6 sm:p-7`} aria-live="polite">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Prediction results</p>
                <h2 className="mt-2 font-serif text-2xl text-[#F8F7FC]">What the model sees</h2>
              </div>
              <div className="rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#A5ADC0]">
                {prediction !== null ? 'Live result' : 'Awaiting input'}
              </div>
            </div>

            {prediction !== null ? (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-[#2C3142] bg-[#0D0D12]/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#A5ADC0]">Predicted digit</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] border border-[#2C3142] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.26),_rgba(30,34,48,0.96))] shadow-[0_18px_40px_-28px_rgba(139,92,246,0.95)]">
                        <div className="absolute inset-[-6px] rounded-[1.75rem] bg-[conic-gradient(from_180deg,#8B5CF6,#FF6B6B,#F59E0B,#8B5CF6)] opacity-45 blur-md" />
                        <span className="relative text-5xl font-bold text-white">{prediction}</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-[#A5ADC0]">Confidence</p>
                        <p className="text-3xl font-semibold text-[#F8F7FC]">{((confidence ?? 0) * 100).toFixed(1)}%</p>
                        <p className="text-sm text-[#A5ADC0]">Highest probability class</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#2C3142] bg-[#161821]/80 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#A5ADC0]">Signal summary</span>
                      <Target className="h-4 w-4 text-[#F59E0B]" />
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-[#A5ADC0]">
                      <div className="flex items-center justify-between rounded-2xl border border-[#2C3142] bg-[#0D0D12]/60 px-3 py-2">
                        <span>Primary class</span>
                        <span className="font-medium text-[#F8F7FC]">{prediction}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-[#2C3142] bg-[#0D0D12]/60 px-3 py-2">
                        <span>Confidence spread</span>
                        <span className="font-medium text-[#F8F7FC]">{confidenceLabel}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-[#2C3142] bg-[#0D0D12]/60 px-3 py-2">
                        <span>Total classes</span>
                        <span className="font-medium text-[#F8F7FC]">10 digits</span>
                      </div>
                    </div>
                  </div>
                </div>

                {probabilities ? (
                  <div>
                    <h3 className="mb-3 flex items-center text-sm font-medium text-[#F8F7FC]">
                      <BarChart3 className="mr-2 h-4 w-4 text-[#8B5CF6]" />
                      All probabilities
                    </h3>
                    <div className="space-y-2">
                      {sortedProbabilities.map(([digit, prob]) => (
                        <div key={digit} className="flex items-center gap-3">
                          <span className="w-6 text-sm font-medium text-[#F8F7FC]">{digit}</span>
                          <div className="h-6 flex-1 overflow-hidden rounded-full bg-[#0D0D12]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                parseInt(digit, 10) === prediction
                                  ? 'bg-[linear-gradient(90deg,#8B5CF6,#FF6B6B)]'
                                  : 'bg-[linear-gradient(90deg,rgba(139,92,246,0.45),rgba(255,107,107,0.18))]'
                              }`}
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                          <span className="w-16 text-right text-sm text-[#A5ADC0]">{(prob * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#2C3142] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),_transparent_64%)] px-6 text-center">
                <div className="rounded-[1.75rem] border border-[#2C3142] bg-[#161821]/80 p-5 text-[#8B5CF6] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.85)]">
                  <Brain className="h-12 w-12" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[#F8F7FC]">Draw a digit to inspect the model signal</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#A5ADC0]">
                  Recognize a handwritten number to reveal the predicted class, confidence trail, and full probability spread.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">
                  <ChevronRight className="h-3.5 w-3.5 text-[#F59E0B]" />
                  Model response appears here
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {learningCards.map((card) => (
            <div
              key={card.title}
              className={`${panelClass} p-5 transition duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/40 hover:bg-[#1E2230]`}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2C3142] bg-[#161821]/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#A5ADC0]">
                <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
                Learning note
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#F8F7FC]">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#A5ADC0]">{card.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
