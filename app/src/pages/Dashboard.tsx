import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  ChevronRight,
  Heart,
  Leaf,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { DashboardSummary, Notification, Recommendation } from '../types';

const integerFormatter = new Intl.NumberFormat('en-US');

const formatInteger = (value?: number) => integerFormatter.format(value ?? 0);
const formatPercent = (value?: number) => `${Math.round(value ?? 0)}%`;
const formatOneDecimal = (value?: number) => `${(value ?? 0).toFixed(1)}`;

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryData, recsData, notifsData] = await Promise.all([
        apiClient.getDashboardSummary(),
        apiClient.getRecommendations(undefined, 'pending'),
        apiClient.getNotifications(true),
      ]);
      setSummary(summaryData);
      setRecommendations(recsData.slice(0, 3));
      setNotifications(notifsData.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="impact-panel flex h-[32rem] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-kaleo-terracotta/20 border-t-kaleo-terracotta" />
      </div>
    );
  }

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'Operator';
  const overviewCards = [
    {
      label: 'Pending recommendations',
      value: formatInteger(summary?.pending_recommendations),
      detail: 'The next recommended action ready for review.',
      accent: '#C56A43',
    },
    {
      label: 'Unread notifications',
      value: formatInteger(summary?.unread_notifications),
      detail: 'Updates from the modules you are actively using.',
      accent: '#7597A4',
    },
    {
      label: 'Average score',
      value: formatPercent(summary?.average_test_score),
      detail: 'How your study work is translating into performance.',
      accent: '#5B76F5',
    },
    {
      label: 'CO2 saved',
      value: `${formatOneDecimal(summary?.co2_saved_kg)} kg`,
      detail: 'Measured progress from small actions that add up.',
      accent: '#5F8A63',
    },
  ];

  const modules = [
    {
      id: 'education',
      title: 'Education',
      description: 'Study materials become drills, notes, and interview preparation.',
      path: '/education',
      icon: BookOpen,
      accent: '#5B76F5',
      glow: 'rgba(91, 118, 245, 0.16)',
      stats: [
        { label: 'Materials', value: formatInteger(summary?.total_study_materials) },
        { label: 'Mock tests', value: formatInteger(summary?.total_mock_tests_taken) },
        { label: 'Weak topics', value: formatInteger(summary?.weak_topics_count) },
      ],
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      description: 'Goals become routines that fit real schedules and energy levels.',
      path: '/healthcare',
      icon: Heart,
      accent: '#5F8A63',
      glow: 'rgba(95, 138, 99, 0.18)',
      stats: [
        { label: 'Workout plans', value: formatInteger(summary?.active_workout_plans) },
        { label: 'Nutrition plans', value: formatInteger(summary?.active_nutrition_plans) },
        { label: 'Status', value: 'Live' },
      ],
    },
    {
      id: 'sustainability',
      title: 'Sustainability',
      description: 'Small eco actions become visible progress instead of guilt.',
      path: '/sustainability',
      icon: Leaf,
      accent: '#C9993E',
      glow: 'rgba(201, 153, 62, 0.18)',
      stats: [
        { label: 'Actions this week', value: formatInteger(summary?.sustainability_actions_this_week) },
        { label: 'CO2 saved', value: `${formatOneDecimal(summary?.co2_saved_kg)} kg` },
        { label: 'Mode', value: 'Actionable' },
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Clear, inclusive text that is easier to read, translate, and use.',
      path: '/accessibility',
      icon: Sparkles,
      accent: '#7597A4',
      glow: 'rgba(117, 151, 164, 0.18)',
      stats: [
        { label: 'Tools', value: '4' },
        { label: 'Languages', value: '12+' },
        { label: 'Mode', value: 'Ready' },
      ],
    },
  ];

  const quickActions = [
    { label: 'Add study material', path: '/education/materials', icon: BookOpen, accent: '#5B76F5' },
    { label: 'Create workout plan', path: '/healthcare/workout', icon: Heart, accent: '#5F8A63' },
    { label: 'Log eco action', path: '/sustainability/tracker', icon: Leaf, accent: '#C9993E' },
    { label: 'Simplify text', path: '/accessibility/simplify', icon: Sparkles, accent: '#7597A4' },
  ];

  const impactDetails = [
    {
      label: 'Study materials',
      value: formatInteger(summary?.total_study_materials),
      description: 'Notes and readings ready to become drills or review material.',
    },
    {
      label: 'Workout plans',
      value: formatInteger(summary?.active_workout_plans),
      description: 'Routines built to fit realistic schedules and energy.',
    },
    {
      label: 'Sustainability actions',
      value: formatInteger(summary?.sustainability_actions_this_week),
      description: 'Small habits that add up to measurable momentum.',
    },
    {
      label: 'Pending queue',
      value: formatInteger(summary?.pending_recommendations),
      description: 'Recommendations waiting to turn into action.',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="impact-panel surface-grid overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr] xl:items-end">
          <div>
            <p className="section-kicker">Mission Control</p>
            <h1 className="mt-4 text-headline font-serif text-kaleo-charcoal">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-kaleo-charcoal/70">
            This dashboard highlights the next best step across learning, wellness, sustainability, and accessibility so your work stays organized.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/recommendations" className="impact-button">
                View recommendations
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/notifications" className="impact-button-secondary">
                Open notifications
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {overviewCards.map((card) => (
              <div key={card.label} className="signal-card">
                <p className="data-label" style={{ color: card.accent }}>
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-kaleo-charcoal/60">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        {modules.map((module) => (
          <Link
            key={module.id}
            to={module.path}
            className="impact-panel surface-grid card-hover relative overflow-hidden p-6"
          >
            <div
              className="pointer-events-none absolute right-5 top-5 h-24 w-24 rounded-full blur-2xl"
              style={{ backgroundColor: module.glow }}
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-kaleo-charcoal/10 bg-white/80"
                  style={{ color: module.accent }}
                >
                  <module.icon className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-kaleo-charcoal/30" />
              </div>
              <h2 className="mt-6 text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
                {module.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-kaleo-charcoal/60">{module.description}</p>

              <div className="mt-6 grid gap-3">
                {module.stats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.2rem] border border-kaleo-charcoal/10 bg-white/70 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kaleo-charcoal/40">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.28fr_0.92fr]">
        <div className="space-y-6">
          <div className="impact-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Recommended Next</p>
                <h2 className="mt-2 text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
                  Your queue
                </h2>
              </div>
              <Link to="/recommendations" className="status-pill">
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => {
                  const priorityTone =
                    rec.priority === 'high'
                      ? '#C56A43'
                      : rec.priority === 'medium'
                        ? '#C9993E'
                        : '#5F8A63';

                  return (
                    <div key={rec.id} className="rounded-[1.5rem] border border-kaleo-charcoal/10 bg-white/75 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="impact-chip" style={{ color: priorityTone }}>
                              {rec.priority} priority
                            </span>
                            <span className="text-xs font-medium uppercase tracking-[0.18em] text-kaleo-charcoal/40">
                              {rec.module}
                            </span>
                          </div>
                          <h3 className="mt-4 text-2xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
                            {rec.title}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-kaleo-charcoal/60">{rec.description}</p>
                          {rec.reason ? (
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-kaleo-charcoal/40">
                              Reason: {rec.reason}
                            </p>
                          ) : null}
                        </div>
                        {rec.action_link ? (
                          <Link to={rec.action_link} className="status-pill shrink-0">
                            Open
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[1.6rem] border border-kaleo-charcoal/10 bg-white/70 px-5 py-10 text-center text-kaleo-charcoal/60">
                No pending recommendations. As you use the modules, the queue will fill with the next best step.
                </div>
              )}
            </div>
          </div>

          <div className="impact-panel p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kaleo-charcoal text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="section-kicker">Quick Actions</p>
                <h2 className="text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">Continue where you left off</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="card-hover rounded-[1.5rem] border border-kaleo-charcoal/10 bg-white/70 p-5 transition"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-kaleo-charcoal/10 bg-white/80"
                    style={{ color: action.accent }}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-medium text-kaleo-charcoal">{action.label}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-kaleo-charcoal/50">
                  Open tool
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="impact-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kaleo-charcoal text-white">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="section-kicker">Notifications</p>
                  <h2 className="text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">Recent alerts</h2>
                </div>
              </div>
              <Link to="/notifications" className="status-pill">
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="rounded-[1.4rem] border border-kaleo-charcoal/10 bg-white/70 px-4 py-4">
                    <p className="text-sm font-semibold text-kaleo-charcoal">{notification.title}</p>
                    <p className="mt-2 text-sm leading-6 text-kaleo-charcoal/60">{notification.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-kaleo-charcoal/10 bg-white/70 px-5 py-8 text-center text-kaleo-charcoal/60">
                  No new notifications. Your activity feed is clear for now.
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-kaleo-charcoal px-6 py-7 text-white shadow-[0_30px_70px_-38px_rgba(16,24,39,0.76)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Impact Snapshot</p>
                <h2 className="text-3xl font-serif tracking-[-0.04em] text-white">System overview</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {impactDetails.map((detail) => (
                <div key={detail.label} className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{detail.label}</p>
                      <p className="mt-2 text-sm leading-6 text-white/70">{detail.description}</p>
                    </div>
                    <p className="text-2xl font-serif tracking-[-0.04em] text-white">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-kaleo-gold" />
                <p className="text-sm text-white/70">
                  Keep the queue moving. The platform works best when recommendations, quick actions, and notifications stay connected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
