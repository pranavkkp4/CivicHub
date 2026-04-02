import { useState, useEffect } from 'react';
import { TrendingDown, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import type { WeakTopic } from '../../types';

export default function WeakTopicsPage() {
  const [topics, setTopics] = useState<WeakTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await apiClient.getWeakTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching weak topics:', error);
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
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <TrendingDown className="w-8 h-8 mr-3 text-orange-500" />
          Weak Topics
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Topics where focused review will make the biggest difference
        </p>
      </div>

      {topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-kaleo-charcoal">{topic.topic}</h3>
                <p className="text-sm text-kaleo-charcoal/60 mt-1">
                  {topic.subject || 'General'} | Missed {topic.miss_count} times
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                  Ready to review
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <TrendingDown className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
          <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">No priority topics yet</h3>
          <p className="text-kaleo-charcoal/60">
            Take a few drills or mock tests and the dashboard will surface the topics worth revisiting.
          </p>
        </div>
      )}
    </div>
  );
}
