import { useState, useEffect } from 'react';
import { Zap, Loader2, Sparkles } from 'lucide-react';
import apiClient from '../../api/client';

interface EcoTip {
  category: string;
  tip: string;
  impact?: string;
  difficulty: string;
}

interface EcoCoachResponse {
  personalized_tip?: EcoTip;
  challenge_recommendations?: string[];
  based_on_recent_logs: boolean;
  generated_at: string;
}

export default function EcoCoach() {
  const [tips, setTips] = useState<EcoCoachResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getEcoCoachTips();
      setTips(data);
    } catch (fetchError) {
      console.error('Error fetching tips:', fetchError);
      setError('We could not load your eco coach tips right now.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-kaleo-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Zap className="w-8 h-8 mr-3 text-yellow-500" />
          Eco Coach
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Small eco actions become visible progress instead of guilt.
        </p>
      </div>

      {tips?.personalized_tip ? (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-2">Today&apos;s eco tip</h3>
              <p className="text-white/90">{tips.personalized_tip.tip}</p>
              <div className="flex items-center mt-3 space-x-4">
                <span className="text-white/60 text-sm">Impact: {tips.personalized_tip.impact}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs capitalize">
                  {tips.personalized_tip.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 text-kaleo-charcoal shadow-sm">
          <p className="text-sm text-kaleo-charcoal/60">
            Log a few eco actions and we will turn them into a practical next step.
          </p>
        </div>
      )}

      {tips?.challenge_recommendations?.length ? (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-serif text-xl text-kaleo-charcoal mb-4">Recommended challenges</h2>
          <div className="space-y-3">
            {tips.challenge_recommendations.map((challenge, idx) => (
              <div key={`${challenge}-${idx}`} className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-kaleo-charcoal">{challenge}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 text-kaleo-charcoal shadow-sm">
          <p className="text-sm text-kaleo-charcoal/60">
            Challenge recommendations will appear here once the coach has enough activity to tailor them.
          </p>
        </div>
      )}
    </div>
  );
}
