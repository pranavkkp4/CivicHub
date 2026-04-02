import { useState } from 'react';
import { Apple, Loader2, Check } from 'lucide-react';
import apiClient from '../../api/client';

interface NutritionMealItem {
  name: string;
  portion: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

interface NutritionMeal {
  meal_type: string;
  items: NutritionMealItem[];
  total_calories?: number;
  prep_time_minutes?: number;
}

interface DailyMealPlan {
  day: string;
  meals: NutritionMeal[];
  daily_totals?: Record<string, number>;
}

interface ShoppingListItem {
  category: string;
  items: string[];
}

interface NutritionPlanContent {
  description: string;
  daily_plans: DailyMealPlan[];
  guidelines?: string[];
  hydration_tips?: string;
}

interface NutritionPlanResult {
  title: string;
  goal: string;
  plan_content: NutritionPlanContent;
  shopping_list?: ShoppingListItem[];
  macro_targets?: Record<string, number>;
}

export default function NutritionPlanner() {
  const [formData, setFormData] = useState({
    goal: 'maintenance',
    diet_type: '',
    allergies: [] as string[],
    meals_per_day: 3,
    cooking_time_available: 'moderate',
    calorie_target: undefined as number | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<NutritionPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goals = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'health', label: 'General Health' },
  ];

  const dietTypes = [
    { value: '', label: 'No Preference' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await apiClient.createNutritionPlan(formData);
      setResult(data as NutritionPlanResult);
    } catch (error) {
      console.error('Error creating nutrition plan:', error);
      setError('We could not generate a nutrition plan right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
          <Apple className="w-8 h-8 mr-3 text-green-500" />
          Nutrition Planner
        </h1>
        <p className="text-kaleo-charcoal/60 mt-1">
          Meals should fit your life, your schedule, and the way you actually eat.
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
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
              >
                {goals.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Diet type</label>
              <select
                value={formData.diet_type}
                onChange={(e) => setFormData({ ...formData, diet_type: e.target.value })}
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
              >
                {dietTypes.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Meals per day</label>
              <input
                type="number"
                min={2}
                max={6}
                value={formData.meals_per_day}
                onChange={(e) => setFormData({ ...formData, meals_per_day: Number.parseInt(e.target.value, 10) || 2 })}
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kaleo-charcoal mb-2">Calorie target (optional)</label>
              <input
                type="number"
                placeholder="e.g., 2000"
                value={formData.calorie_target ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calorie_target: e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                  })
                }
                className="w-full px-4 py-3 bg-kaleo-sand border border-kaleo-terracotta/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Apple className="w-5 h-5" />
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
              <h2 className="font-serif text-2xl text-kaleo-charcoal">Your nutrition plan is ready</h2>
              <p className="text-kaleo-charcoal/60">{result.title}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-kaleo-charcoal mb-2">Plan overview</h3>
              <p className="whitespace-pre-line text-kaleo-charcoal/80">{result.plan_content.description}</p>
            </div>

            {result.macro_targets && Object.keys(result.macro_targets).length > 0 && (
              <div className="rounded-xl bg-green-50 p-4">
                <h3 className="font-medium text-kaleo-charcoal mb-3">Macro targets</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(result.macro_targets).map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-kaleo-charcoal/50">{key.replace('_', ' ')}</p>
                      <p className="mt-1 text-sm font-medium text-kaleo-charcoal">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.plan_content.daily_plans?.length > 0 && (
              <div>
                <h3 className="font-medium text-kaleo-charcoal mb-3">7-day meal plan</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.plan_content.daily_plans.map((dayPlan) => (
                    <div key={dayPlan.day} className="rounded-xl border border-kaleo-terracotta/10 bg-kaleo-sand/40 p-4">
                      <p className="font-medium text-kaleo-charcoal">{dayPlan.day}</p>
                      <div className="mt-3 space-y-3">
                        {dayPlan.meals.map((meal) => (
                          <div key={meal.meal_type} className="rounded-lg bg-white p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-kaleo-charcoal capitalize">{meal.meal_type}</p>
                              {meal.total_calories ? (
                                <span className="text-xs text-kaleo-charcoal/60">{meal.total_calories} cal</span>
                              ) : null}
                            </div>
                            <ul className="mt-2 space-y-1 text-sm text-kaleo-charcoal/70">
                              {meal.items.map((item) => (
                                <li key={`${meal.meal_type}-${item.name}`}>
                                  {item.name} - {item.portion}
                                  {item.calories ? ` (${item.calories} cal)` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.shopping_list?.length ? (
              <div>
                <h3 className="font-medium text-kaleo-charcoal mb-3">Simple Shopping List</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.shopping_list.map((section) => (
                    <div key={section.category} className="rounded-xl bg-kaleo-sand/60 p-4">
                      <p className="font-medium text-kaleo-charcoal">{section.category}</p>
                      <ul className="mt-2 space-y-1 text-sm text-kaleo-charcoal/70">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {result.plan_content.guidelines?.length ? (
              <div>
                <h3 className="font-medium text-kaleo-charcoal mb-2">Helpful Guidelines</h3>
                <ul className="space-y-2">
                  {result.plan_content.guidelines.map((guideline) => (
                    <li key={guideline} className="rounded-lg bg-green-50 px-4 py-3 text-sm text-kaleo-charcoal/80">
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.plan_content.hydration_tips && (
              <div className="rounded-xl bg-blue-50 p-4">
                <h3 className="font-medium text-kaleo-charcoal mb-2">Hydration Reminder</h3>
                <p className="text-kaleo-charcoal/80 whitespace-pre-line">{result.plan_content.hydration_tips}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setResult(null);
              setError(null);
            }}
            className="mt-6 px-6 py-3 bg-kaleo-sand text-kaleo-charcoal rounded-lg hover:bg-kaleo-terracotta/10 transition-colors"
          >
            Create Another Plan
          </button>
        </div>
      )}
    </div>
  );
}
