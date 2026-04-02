import { useState } from 'react';
import { Stethoscope, Loader2, AlertTriangle } from 'lucide-react';
import apiClient from '../../api/client';

interface SymptomCheckResult {
  ai_guidance?: string;
  self_care_suggestions?: string[];
  red_flags?: string[];
  disclaimer?: string;
}

type Severity = 'mild' | 'moderate' | 'severe';

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<Severity>('mild');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError(null);
    try {
      const symptomList = symptoms.split(',').map((s) => s.trim()).filter(Boolean);
      if (symptomList.length === 0) {
        setError('Please enter at least one symptom.');
        return;
      }
      const data = await apiClient.checkSymptoms(symptomList, duration, severity);
      setResult(data as SymptomCheckResult);
    } catch (error) {
      console.error('Error checking symptoms:', error);
      setError('We could not check symptoms right now. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Stethoscope className="w-8 h-8 mr-3 text-orange-500" />
          Symptom Checker
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Use it for general wellness guidance and next steps, not diagnosis.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-800 text-sm font-medium">General guidance only</p>
          <p className="text-yellow-700 text-xs mt-1">
            This tool offers general wellness guidance only. It is not a substitute for professional medical advice,
            diagnosis, or treatment. If symptoms feel severe or unusual, contact a qualified health provider.
          </p>
        </div>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-kaleo-charcoal mb-2">
              Symptoms (comma separated)
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 h-24 resize-none"
              placeholder="e.g., headache, fever, fatigue..."
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="e.g., 2 days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isChecking}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isChecking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Stethoscope className="w-5 h-5" />
                <span>Review guidance</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="font-serif text-2xl text-kaleo-charcoal mb-4">Wellness guidance</h2>
          <div className="space-y-6">
            <p className="whitespace-pre-line text-kaleo-charcoal/80">{result.ai_guidance}</p>

            {result.self_care_suggestions?.length ? (
              <div>
                <h3 className="font-medium text-kaleo-charcoal mb-2">Self-care suggestions</h3>
                <ul className="space-y-2">
                  {result.self_care_suggestions.map((suggestion) => (
                    <li key={suggestion} className="rounded-lg bg-kaleo-sand/60 px-4 py-3 text-sm text-kaleo-charcoal/80">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.red_flags?.length ? (
              <div>
                <h3 className="font-medium text-red-700 mb-2">When to seek care</h3>
                <ul className="space-y-2">
                  {result.red_flags.map((redFlag) => (
                    <li key={redFlag} className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                      {redFlag}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.disclaimer && (
              <p className="rounded-lg bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
                {result.disclaimer}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setResult(null);
              setError(null);
            }}
            className="mt-6 px-6 py-3 bg-kaleo-sand text-kaleo-charcoal rounded-lg hover:bg-kaleo-terracotta/10 transition-colors"
          >
            Check another set of symptoms
          </button>
        </div>
      )}
    </div>
  );
}
