import { useState } from 'react';
import { Dumbbell, Loader2, Check } from 'lucide-react';
import apiClient from '../../api/client';

interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: string;
  duration_minutes?: number;
  rest_seconds?: number;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
  duration_minutes: number;
}

interface WorkoutPlanContent {
  description: string;
  weekly_schedule: WorkoutDay[];
  warmup?: string;
  cooldown?: string;
  tips?: string[];
}

interface WorkoutPlanResult {
  title: string;
  plan_content: WorkoutPlanContent;
}

type EquipmentOption = 'none' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'gym';

export default function WorkoutPlanner() {
  const [formData, setFormData] = useState<{
    goal: string;
    fitness_level: string;
    days_per_week: number;
    time_per_session_minutes: number;
    equipment_available: EquipmentOption[];
    injuries_or_limitations: string;
  }>({
    goal: 'general_fitness',
    fitness_level: 'beginner',
    days_per_week: 3,
    time_per_session_minutes: 30,
    equipment_available: ['none'],
    injuries_or_limitations: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<WorkoutPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goals = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'general_fitness', label: 'General Fitness' },
  ];

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const equipmentOptions: { value: EquipmentOption; label: string }[] = [
    { value: 'none', label: 'No Equipment' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'resistance_bands', label: 'Resistance Bands' },
    { value: 'gym', label: 'Full Gym Access' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await apiClient.createWorkoutPlan(formData);
      setResult(data as WorkoutPlanResult);
    } catch (error) {
      console.error('Error creating workout plan:', error);
      setError('We could not generate a workout plan right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Dumbbell className="w-8 h-8 mr-3 text-blue-500" />
          Workout Planner
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Create a routine that fits your goals, schedule, and current capacity.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {goals.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Fitness level</label>
              <select
                value={formData.fitness_level}
                onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {fitnessLevels.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Days per week</label>
              <input
                type="number"
                min={1}
                max={7}
                value={formData.days_per_week}
                onChange={(e) => setFormData({ ...formData, days_per_week: Number.parseInt(e.target.value, 10) || 1 })}
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Time per session (minutes)</label>
              <input
                type="number"
                min={15}
                max={120}
                step={5}
                value={formData.time_per_session_minutes}
                onChange={(e) => setFormData({ ...formData, time_per_session_minutes: Number.parseInt(e.target.value, 10) || 15 })}
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Available equipment</label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((eq) => (
                <button
                  key={eq.value}
                  type="button"
                  onClick={() => {
                    const current = formData.equipment_available;
                    const updated: EquipmentOption[] = eq.value === 'none'
                      ? ['none']
                      : current.includes(eq.value)
                        ? current.filter((e) => e !== eq.value).filter((e) => e !== 'none')
                        : [...current.filter((e) => e !== 'none'), eq.value];
                    setFormData({ ...formData, equipment_available: updated });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    formData.equipment_available.includes(eq.value)
                      ? 'bg-blue-500 text-white'
                      : 'bg-kaleo-sand text-kaleo-charcoal hover:bg-blue-50'
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-kaleo-charcoal mb-2">
              Injuries or limitations (optional)
            </label>
            <textarea
              value={formData.injuries_or_limitations}
              onChange={(e) => setFormData({ ...formData, injuries_or_limitations: e.target.value })}
              className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 h-24 resize-none"
              placeholder="e.g., knee pain, lower back issues..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Dumbbell className="w-5 h-5" />
                <span>Generate plan</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-kaleo-charcoal">Your workout plan is ready</h2>
              <p className="text-kaleo-charcoal/60">{result.title}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-kaleo-charcoal mb-2">Plan overview</h3>
              <p className="whitespace-pre-line text-kaleo-charcoal/80">
                {result.plan_content.description}
              </p>
            </div>

            {result.plan_content.warmup && (
              <div className="rounded-xl bg-blue-50 p-4">
                <h3 className="font-medium text-kaleo-charcoal mb-2">Warm-up</h3>
                <p className="text-kaleo-charcoal/80 whitespace-pre-line">{result.plan_content.warmup}</p>
              </div>
            )}

            {result.plan_content.weekly_schedule?.length > 0 && (
              <div>
                <h3 className="font-medium text-kaleo-charcoal mb-3">Weekly schedule</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.plan_content.weekly_schedule.map((day) => (
                    <div key={day.day} className="rounded-xl border border-kaleo-terracotta/10 bg-kaleo-sand/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-kaleo-charcoal">{day.day}</p>
                          <p className="text-sm text-kaleo-charcoal/60">{day.focus}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-kaleo-charcoal/70">
                          {day.duration_minutes} min
                        </span>
                      </div>
                      <div className="mt-3 space-y-3">
                        {day.exercises.map((exercise) => (
                          <div key={exercise.name} className="rounded-lg bg-white p-3">
                            <p className="font-medium text-kaleo-charcoal">{exercise.name}</p>
                            <p className="text-sm text-kaleo-charcoal/60">
                              {exercise.sets ? `${exercise.sets} sets` : null}
                              {exercise.sets && exercise.reps ? ' | ' : ''}
                              {exercise.reps ?? ''}
                              {exercise.duration_minutes ? ` | ${exercise.duration_minutes} min` : ''}
                              {exercise.rest_seconds ? ` | ${exercise.rest_seconds}s rest` : ''}
                            </p>
                            {exercise.notes && (
                              <p className="mt-1 text-xs text-kaleo-charcoal/50">{exercise.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.plan_content.cooldown && (
              <div className="rounded-xl bg-green-50 p-4">
                <h3 className="font-medium text-kaleo-charcoal mb-2">Cool-down</h3>
                <p className="text-kaleo-charcoal/80 whitespace-pre-line">{result.plan_content.cooldown}</p>
              </div>
            )}

            {result.plan_content.tips?.length ? (
              <div>
                <h3 className="font-medium text-kaleo-charcoal mb-2">Safety Tips</h3>
                <ul className="space-y-2">
                  {result.plan_content.tips.map((tip) => (
                    <li key={tip} className="rounded-lg bg-kaleo-sand/60 px-4 py-3 text-sm text-kaleo-charcoal/80">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <button
            onClick={() => setResult(null)}
            className="mt-6 px-6 py-3 bg-kaleo-sand text-kaleo-charcoal rounded-lg hover:bg-kaleo-terracotta/10 transition-colors"
          >
            Create Another Plan
          </button>
        </div>
      )}
    </div>
  );
}
