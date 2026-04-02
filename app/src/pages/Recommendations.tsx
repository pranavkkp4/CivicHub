import { useState, useEffect } from 'react';
import { Target, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';
import type { Recommendation } from '../types';
import { Link } from 'react-router-dom';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await apiClient.getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      await apiClient.generateRecommendations();
      fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'education': return 'bg-blue-500';
      case 'healthcare': return 'bg-green-500';
      case 'sustainability': return 'bg-emerald-500';
      case 'accessibility': return 'bg-purple-500';
      default: return 'bg-kaleo-terracotta';
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
            <Target className="w-8 h-8 mr-3 text-kaleo-terracotta" />
            Recommendations
          </h1>
          <p className="text-kaleo-charcoal/60 mt-1">
            Recommended next steps based on your learning, wellness, sustainability, and accessibility activity
          </p>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-kaleo-terracotta text-white rounded-lg hover:bg-kaleo-charcoal transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Refresh recommendations</span>
        </button>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${
                rec.priority === 'high' ? 'border-red-500' :
                rec.priority === 'medium' ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`${getModuleColor(rec.module)} px-2 py-0.5 text-white text-xs rounded-full capitalize`}>
                      {rec.module}
                    </span>
                    <span className={`text-xs capitalize ${
                      rec.priority === 'high' ? 'text-red-500' :
                      rec.priority === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-kaleo-charcoal">{rec.title}</h3>
                  <p className="text-kaleo-charcoal/60 mt-2">{rec.description}</p>
                  {rec.reason && (
                    <p className="text-kaleo-charcoal/40 text-sm mt-2">{rec.reason}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {rec.action_link && (
                    <Link
                      to={rec.action_link}
                      className="p-2 text-kaleo-terracotta hover:bg-kaleo-terracotta/10 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
          <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">No recommendations ready yet</h3>
          <p className="text-kaleo-charcoal/60 mb-6">Use the modules and the platform will surface the next useful step automatically.</p>
          <button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="px-6 py-3 bg-kaleo-terracotta text-white rounded-lg hover:bg-kaleo-charcoal transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Refreshing...' : 'Refresh recommendations'}
          </button>
        </div>
      )}
    </div>
  );
}
