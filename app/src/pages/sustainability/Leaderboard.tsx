import { useState, useEffect } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';

interface LeaderboardEntry {
  user_id: number;
  user_name: string;
  score: number;
  rank: number;
}

interface LeaderboardResponse {
  category: string;
  period: string;
  entries: LeaderboardEntry[];
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getLeaderboard('overall');
      setLeaderboard(data);
    } catch (fetchError) {
      console.error('Error fetching leaderboard:', fetchError);
      setError('We could not load the leaderboard right now.');
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
          <Trophy className="w-8 h-8 mr-3 text-orange-500" />
          Leaderboard
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Progress shows up as shared momentum, not pressure.
        </p>
      </div>

      {leaderboard?.entries?.length ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-kaleo-terracotta/10">
            {leaderboard.entries.map((entry, idx) => (
              <div key={entry.user_id} className="flex items-center p-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    idx === 0
                      ? 'bg-yellow-100 text-yellow-600'
                      : idx === 1
                        ? 'bg-gray-100 text-gray-600'
                        : idx === 2
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-kaleo-sand text-kaleo-charcoal'
                  }`}
                >
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-kaleo-charcoal">{entry.user_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-kaleo-charcoal">{entry.score}</p>
                  <p className="text-xs text-kaleo-charcoal/50">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
          <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">No activity yet</h3>
          <p className="text-kaleo-charcoal/60">Start logging actions and your progress will appear here.</p>
        </div>
      )}
    </div>
  );
}
