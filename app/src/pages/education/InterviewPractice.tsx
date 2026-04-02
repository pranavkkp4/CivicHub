import { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';

export default function InterviewPractice() {
  const [topic, setTopic] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    // Would start interview session here
    setTimeout(() => setIsStarting(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-pink-500" />
          Interview Practice
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Turn your study materials into clearer answers and stronger interview readiness.
        </p>
      </div>

      <form onSubmit={handleStart} className="bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-kaleo-charcoal mb-2">
            Interview Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/30"
            placeholder="e.g., Product strategy, algorithms, cross-functional teamwork"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isStarting}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {isStarting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <MessageSquare className="w-5 h-5" />
              <span>Start practice session</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
