import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Dumbbell, Apple, Stethoscope, 
  Activity, ArrowRight,
  Sparkles, Plus
} from 'lucide-react';
import apiClient from '../../api/client';
import type { WorkoutPlan, NutritionPlan } from '../../types';

type WellnessSuggestionValue = string | number | boolean | null;

interface WellnessAgentSuggestion {
  priority?: string;
  suggestions?: Record<string, WellnessSuggestionValue>;
  plan_recommendations?: string[];
  safety_note?: string;
}

export default function HealthcareDashboard() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [agentSuggestion, setAgentSuggestion] = useState<WellnessAgentSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchHealthcareData();
  }, []);

  const fetchHealthcareData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [workoutsResult, nutritionResult, agentResult] = await Promise.allSettled([
        apiClient.getWorkoutPlans(),
        apiClient.getNutritionPlans(),
        apiClient.runWellnessAgent('healthcare_dashboard'),
      ]);

      if (workoutsResult.status === 'fulfilled') {
        setWorkoutPlans((workoutsResult.value as WorkoutPlan[]).filter((p) => p.is_active).slice(0, 2));
      }

      if (nutritionResult.status === 'fulfilled') {
        setNutritionPlans((nutritionResult.value as NutritionPlan[]).filter((p) => p.is_active).slice(0, 2));
      }

      if (agentResult.status === 'fulfilled') {
        setAgentSuggestion(agentResult.value as WellnessAgentSuggestion);
      }

      const failures = [workoutsResult, nutritionResult, agentResult]
        .filter((result) => result.status === 'rejected')
        .map((result) => (result as PromiseRejectedResult).reason);

      if (failures.length > 0) {
        console.error('Error fetching healthcare data:', failures);
        setError('Some wellness data could not be loaded right now. You can still use the modules below.');
      }
    } catch (error) {
      console.error('Unexpected error fetching healthcare data:', error);
      setError('Healthcare data could not be loaded right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: 'Workout Planner',
      description: 'Goals become routines that fit real schedules and energy levels.',
      icon: Dumbbell,
      path: '/healthcare/workout',
      color: 'bg-blue-500',
    },
    {
      title: 'Nutrition Planner',
      description: 'Meal plans that fit the week you actually have.',
      icon: Apple,
      path: '/healthcare/nutrition',
      color: 'bg-green-500',
    },
    {
      title: 'Symptom Checker',
      description: 'Helpful guidance with clear limits and clear next steps.',
      icon: Stethoscope,
      path: '/healthcare/symptoms',
      color: 'bg-orange-500',
    },
    {
      title: 'Wellness History',
      description: 'See routines, patterns, and progress over time.',
      icon: Activity,
      path: '/healthcare/history',
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-kaleo-terracotta/30 border-t-kaleo-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
            <Heart className="w-8 h-8 mr-3 text-green-500" />
            Healthcare & Wellness
          </h1>
          <p className="text-kaleo-charcoal/60 mt-1">
            Goals become routines that fit real schedules and energy levels.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 flex items-center justify-between gap-4">
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void fetchHealthcareData()}
            className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
        <Activity className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-800 text-sm font-medium">Medical Disclaimer</p>
          <p className="text-yellow-700 text-xs mt-1">
            This platform provides general wellness guidance only. It is not medical advice.
            Always consult healthcare professionals for diagnosis and treatment.
          </p>
        </div>
      </div>

      {/* AI Agent Suggestion */}
      {agentSuggestion && (
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">Today&apos;s priority: {agentSuggestion.priority}</h3>
              {agentSuggestion.safety_note && (
                <p className="text-white/80 text-sm mt-2">{agentSuggestion.safety_note}</p>
              )}
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {agentSuggestion.suggestions &&
                  Object.entries(agentSuggestion.suggestions).map(([key, value]) =>
                    value ? (
                      <div key={key} className="bg-white/10 rounded-lg p-3">
                        <p className="text-white/60 text-xs capitalize">{key}</p>
                        <p className="text-white text-sm">{String(value)}</p>
                      </div>
                    ) : null
                  )}
              </div>
              {agentSuggestion.plan_recommendations?.length ? (
                <div className="mt-4 space-y-2">
                  {agentSuggestion.plan_recommendations.map((recommendation) => (
                    <p key={recommendation} className="text-white/90 text-sm">
                      {recommendation}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="mt-4 flex items-center text-green-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Active Plans */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Workout Plans */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-kaleo-charcoal flex items-center">
              <Dumbbell className="w-5 h-5 mr-2 text-blue-500" />
              Active Workout Plans
            </h2>
            <Link
              to="/healthcare/workout"
              className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </Link>
          </div>

          {workoutPlans.length > 0 ? (
            <div className="space-y-3">
              {workoutPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 bg-blue-50 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-kaleo-charcoal">{plan.title}</h4>
                      <p className="text-sm text-kaleo-charcoal/60 mt-1">
                        {plan.days_per_week} days/week • {plan.time_per_session_minutes} min/session
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full capitalize">
                          {plan.fitness_level}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full capitalize">
                          {plan.goal.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/healthcare/workout"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-kaleo-charcoal/50">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active workout plans yet</p>
              <Link
                to="/healthcare/workout"
                className="text-blue-500 text-sm hover:underline mt-2 inline-block"
              >
                Create a personalized routine
              </Link>
            </div>
          )}
        </div>

        {/* Nutrition Plans */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-kaleo-charcoal flex items-center">
              <Apple className="w-5 h-5 mr-2 text-green-500" />
              Active Nutrition Plans
            </h2>
            <Link
              to="/healthcare/nutrition"
              className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </Link>
          </div>

          {nutritionPlans.length > 0 ? (
            <div className="space-y-3">
              {nutritionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 bg-green-50 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-kaleo-charcoal">{plan.title}</h4>
                      <p className="text-sm text-kaleo-charcoal/60 mt-1">
                        {plan.meals_per_day} meals/day • {plan.diet_type || 'Standard'}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full capitalize">
                          {plan.goal.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/healthcare/nutrition"
                      className="text-green-500 hover:text-green-600"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-kaleo-charcoal/50">
              <Apple className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active nutrition plans yet</p>
              <Link
                to="/healthcare/nutrition"
                className="text-green-500 text-sm hover:underline mt-2 inline-block"
              >
                Build a meal plan that fits your week
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
