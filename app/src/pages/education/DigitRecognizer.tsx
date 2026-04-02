import { useState, useRef, useCallback } from 'react';
import { Brain, RefreshCw, Info, BarChart3 } from 'lucide-react';
import apiClient from '../../api/client';

export default function DigitRecognizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [probabilities, setProbabilities] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
    setConfidence(null);
    setProbabilities(null);
  };

  const recognizeDigit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
            <Brain className="w-8 h-8 mr-3 text-indigo-500" />
            Digit Recognizer
          </h1>
          <p className="text-kaleo-charcoal/60 mt-1">
            A lightweight machine learning demo for handwritten digit recognition.
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-kaleo-charcoal/60 hover:text-kaleo-terracotta transition-colors"
        >
          <Info className="w-6 h-6" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-indigo-50 rounded-2xl p-6">
          <h3 className="font-medium text-indigo-900 mb-2">How it works</h3>
          <p className="text-indigo-700 text-sm mb-4">
            This demo uses a machine learning model trained on the classic MNIST dataset 
            to recognize handwritten digits (0-9). Draw a digit in the canvas below and 
            click "Recognize" to see the prediction.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-indigo-900">Tips for best results:</p>
              <ul className="text-indigo-700 mt-1 space-y-1">
                <li>• Draw the digit in the center</li>
                <li>• Use dark, clear strokes</li>
                <li>• Make the digit large enough</li>
                <li>• Avoid decorative elements</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-indigo-900">Technical details:</p>
              <ul className="text-indigo-700 mt-1 space-y-1">
                <li>• Model: Random Forest Classifier</li>
                <li>• Dataset: sklearn digits (8x8)</li>
                <li>• Accuracy: ~95% on test set</li>
                <li>• Input: 28x28 grayscale image</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Drawing Canvas */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-serif text-xl text-kaleo-charcoal mb-4">Draw a Digit</h2>
          
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="border-2 border-kaleo-terracotta/20 rounded-xl cursor-crosshair bg-white touch-none"
              style={{ width: '100%', maxWidth: '280px', aspectRatio: '1' }}
            />
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={clearCanvas}
              className="flex items-center space-x-2 px-4 py-2 bg-kaleo-sand text-kaleo-charcoal rounded-lg hover:bg-kaleo-terracotta/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear</span>
            </button>
            <button
              onClick={recognizeDigit}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Recognize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-serif text-xl text-kaleo-charcoal mb-4">Prediction Results</h2>

          {prediction !== null ? (
            <div className="space-y-6">
              {/* Main Prediction */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-indigo-500 rounded-2xl mb-4">
                  <span className="text-6xl font-bold text-white">{prediction}</span>
                </div>
                <p className="text-kaleo-charcoal/60">
                  Confidence: <span className="font-semibold text-indigo-500">{(confidence! * 100).toFixed(1)}%</span>
                </p>
              </div>

              {/* Probability Chart */}
              {probabilities && (
                <div>
                  <h3 className="text-sm font-medium text-kaleo-charcoal mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    All Probabilities
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([digit, prob]) => (
                        <div key={digit} className="flex items-center">
                          <span className="w-8 text-sm font-medium text-kaleo-charcoal">{digit}</span>
                          <div className="flex-1 h-6 bg-kaleo-sand rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                parseInt(digit) === prediction ? 'bg-indigo-500' : 'bg-indigo-200'
                              }`}
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                          <span className="w-16 text-right text-sm text-kaleo-charcoal/60">
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-kaleo-charcoal/50">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Draw a digit and click "Recognize"</p>
              <p className="text-sm mt-1">The model will predict which digit (0-9) you've drawn</p>
            </div>
          )}
        </div>
      </div>

      {/* Educational Content */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
        <h3 className="font-serif text-xl mb-4">Learn About Machine Learning</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2">Classification</h4>
            <p className="text-white/80 text-sm">
              This model performs classification - it categorizes input images into one of 10 digit classes.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Feature Extraction</h4>
            <p className="text-white/80 text-sm">
              The model analyzes pixel patterns to identify distinguishing features of each digit.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Confidence Scores</h4>
            <p className="text-white/80 text-sm">
              The model outputs probabilities for each digit, showing how confident it is in each prediction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
