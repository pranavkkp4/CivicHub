import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Recycle,
  Trophy,
  Gamepad2,
  Zap,
  ArrowRight,
  Sparkles,
  Target,
} from 'lucide-react';
import apiClient from '../../api/client';
import type { SustainabilityLog, ImpactSummary } from '../../types';

interface SustainabilityTip {
  category: string;
  tip: string;
  impact?: string;
  difficulty: string;
}

interface SustainabilityAgentSuggestion {
  personalized_tip?: SustainabilityTip;
  challenge_recommendations?: string[];
  event_suggestions?: string[];
  impact_summary?: string;
}

export default function SustainabilityDashboard() {
  const [logs, setLogs] = useState<SustainabilityLog[]>([]);
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [agentSuggestion, setAgentSuggestion] = useState<SustainabilityAgentSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSustainabilityData();
  }, []);

  const fetchSustainabilityData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [logsData, impactData, agentData] = await Promise.all([
        apiClient.getEcoLogs(),
        apiClient.getImpactSummary('all'),
        apiClient.runSustainabilityAgent('sustainability_dashboard'),
      ]);
      setLogs(logsData.slice(0, 5));
      setImpact(impactData);
      setAgentSuggestion(agentData);
    } catch (fetchError) {
      console.error('Error fetching sustainability data:', fetchError);
      setError('We could not load sustainability data right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: 'Eco Tracker',
      description: 'Small eco actions become visible progress instead of guilt.',
      icon: Recycle,
      path: '/sustainability/tracker',
      color: 'bg-emerald-500',
    },
    {
      title: 'Eco Coach',
      description: 'Encouragement that helps sustainable habits keep moving.',
      icon: Zap,
      path: '/sustainability/coach',
      color: 'bg-yellow-500',
    },
    {
      title: 'Eco Trivia',
      description: 'Learn while reinforcing the habits you want to keep.',
      icon: Target,
      path: '/sustainability/trivia',
      color: 'bg-blue-500',
    },
    {
      title: 'Recycling Game',
      description: 'Practice sorting in a low-stakes way.',
      icon: Gamepad2,
      path: '/sustainability/recycling-game',
      color: 'bg-purple-500',
    },
    {
      title: 'Leaderboard',
      description: 'See progress without turning it into pressure.',
      icon: Trophy,
      path: '/sustainability/leaderboard',
      color: 'bg-orange-500',
    },
  ];

  const actionTypes = [
    { type: 'recycling', label: 'Recycling', category: 'waste', icon: Recycle },
    { type: 'composting', label: 'Composting', category: 'waste', icon: Leaf },
    { type: 'energy_saving', label: 'Energy Saving', category: 'energy', icon: Zap },
    { type: 'water_saving', label: 'Water Saving', category: 'water', icon: Target },
  ];

  const quickLog = async (actionType: string, category: string) => {
    try {
      await apiClient.logEcoAction({
        action_type: actionType,
        category,
        quantity: 1,
        unit: 'action',
      });
      fetchSustainabilityData();
    } catch (logError) {
      console.error('Error logging action:', logError);
      setError('Your action could not be saved. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-kaleo-terracotta/30 border-t-kaleo-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchSustainabilityData}
              className="self-start rounded-lg bg-white px-3 py-2 text-sm font-medium text-rose-700 shadow-sm transition-colors hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
            <Leaf className="w-8 h-8 mr-3 text-emerald-500" />
            Sustainability
          </h1>
          <p className="text-kaleo-charcoal/60 mt-1">
            Small eco actions become visible progress instead of guilt.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Actions', value: impact?.total_actions || 0, icon: Recycle, color: 'bg-emerald-500' },
          { label: 'CO2 Saved', value: `${impact?.co2_saved_kg?.toFixed(1) || 0} kg`, icon: Leaf, color: 'bg-blue-500' },
          { label: 'Water Saved', value: `${impact?.water_saved_liters?.toFixed(0) || 0} L`, icon: Target, color: 'bg-cyan-500' },
          { label: 'Energy Saved', value: `${impact?.energy_saved_kwh?.toFixed(1) || 0} kWh`, icon: Zap, color: 'bg-yellow-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-semibold text-kaleo-charcoal">{stat.value}</p>
            <p className="text-sm text-kaleo-charcoal/60">{stat.label}</p>
          </div>
        ))}
      </div>

      {agentSuggestion?.personalized_tip && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">Eco tip of the day</h3>
              <p className="text-white/90">{agentSuggestion.personalized_tip.tip}</p>
              <div className="flex items-center mt-3 space-x-4">
                <span className="text-white/60 text-sm">
                  Impact: {agentSuggestion.personalized_tip.impact}
                </span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs capitalize">
                  {agentSuggestion.personalized_tip.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-kaleo-charcoal mb-4">Quick log</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actionTypes.map((action) => (
            <button
              key={action.type}
              onClick={() => quickLog(action.type, action.category)}
              className="flex items-center justify-center space-x-2 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <action.icon className="w-5 h-5 text-emerald-500" />
              <span className="text-emerald-700 font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.path}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 card-hover"
          >
            <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">{feature.title}</h3>
            <p className="text-kaleo-charcoal/60 text-sm">{feature.description}</p>
            <div className="mt-4 flex items-center text-emerald-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-kaleo-charcoal">Recent eco actions</h2>
          <Link to="/sustainability/tracker" className="text-emerald-500 text-sm hover:underline">
            View all
          </Link>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg"
              >
                <div className="flex items-center">
                  <Recycle className="w-5 h-5 text-emerald-500 mr-3" />
                  <div>
                    <p className="font-medium text-kaleo-charcoal capitalize">{log.action_type.replace('_', ' ')}</p>
                    <p className="text-xs text-kaleo-charcoal/50">
                      {log.category} - {new Date(log.logged_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {log.co2_saved_kg != null && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-full">
                    {log.co2_saved_kg.toFixed(2)} kg CO2
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-kaleo-charcoal/50">
            <Leaf className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No eco actions logged yet</p>
            <p className="text-sm mt-1">Start with one small action and let the momentum build from there.</p>
          </div>
        )}
      </div>
    </div>
  );
}
