import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Accessibility,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Compass,
  Heart,
  Leaf,
  LineChart,
  ShieldCheck,
} from 'lucide-react';
import CivicHubMark from '../components/layout/CivicHubMark';

const heroStats = [
  { label: 'Domain agents', value: '04', detail: 'Education, health, sustainability, accessibility' },
  { label: 'Structured tools', value: '12+', detail: 'Plans, drills, summaries, recommendations' },
  { label: 'Shared system', value: '01', detail: 'One profile, one queue, one measurable graph' },
];

const domainCards = [
  {
    title: 'Education',
    kicker: 'Adaptive learning loops',
    description:
      'Turn notes, topics, and interviews into flashcards, mock tests, and focused review paths instead of one-off AI answers.',
    path: '/education',
    icon: BookOpen,
    accent: '#5B76F5',
    glow: 'rgba(91, 118, 245, 0.16)',
    highlights: ['Flashcards and mock tests', 'Weak-topic tracking', 'Interview practice'],
  },
  {
    title: 'Healthcare',
    kicker: 'Personal wellness systems',
    description:
      'Build daily routines that feel realistic: workouts, nutrition plans, and symptom guidance with context-aware suggestions.',
    path: '/healthcare',
    icon: Heart,
    accent: '#5F8A63',
    glow: 'rgba(95, 138, 99, 0.18)',
    highlights: ['Workout planning', 'Nutrition support', 'Wellness history'],
  },
  {
    title: 'Sustainability',
    kicker: 'Actionable climate habits',
    description:
      'Track the small decisions that add up, then convert them into challenges, coaching, and visible environmental momentum.',
    path: '/sustainability',
    icon: Leaf,
    accent: '#C9993E',
    glow: 'rgba(201, 153, 62, 0.18)',
    highlights: ['Eco action logging', 'Impact summaries', 'Challenges and games'],
  },
  {
    title: 'Accessibility',
    kicker: 'Readable by default',
    description:
      'Simplify, translate, and summarize text so information becomes usable for more people without creating extra workflow friction.',
    path: '/accessibility',
    icon: Accessibility,
    accent: '#7597A4',
    glow: 'rgba(117, 151, 164, 0.18)',
    highlights: ['Plain-language rewrites', 'Translation support', 'Quick summaries'],
  },
];

const workflowSteps = [
  {
    title: 'Read the real context',
    description:
      'Civic Hub takes in source material, goals, and constraints instead of forcing users to rewrite their situation for each tool.',
    icon: Compass,
    accent: '#C56A43',
  },
  {
    title: 'Generate structured outputs',
    description:
      'Responses become flashcards, plans, recommendations, and transformed text that fit the domain instead of generic prose.',
    icon: Brain,
    accent: '#5B76F5',
  },
  {
    title: 'Keep momentum visible',
    description:
      'Recommendations, notifications, and dashboard metrics keep the system useful after the first interaction.',
    icon: LineChart,
    accent: '#5F8A63',
  },
];

const operatorSignals = [
  {
    label: 'Signal Routing',
    title: 'A shared queue for next-best actions',
    description:
      'Recommendations move between modules so study gaps, health routines, sustainability habits, and readability tasks do not live in separate silos.',
  },
  {
    label: 'Structured Trust',
    title: 'Purpose-built outputs instead of novelty chat',
    description:
      'Each domain is shaped around repeatable artifacts that can be reviewed, reused, and improved over time.',
  },
  {
    label: 'Human Scale',
    title: 'Built for the everyday pace of change',
    description:
      'The interface stays warm and readable because social impact work should feel calm, not overwhelming or over-instrumented.',
  },
];

const footerLinks = [
  { label: 'Sign In', path: '/login' },
  { label: 'Create Account', path: '/register' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Recommendations', path: '/recommendations' },
];

export default function LandingPage() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy > *', {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
      });

      gsap.from('.hero-panel', {
        y: 30,
        scale: 0.96,
        opacity: 0,
        duration: 1,
        delay: 0.18,
        ease: 'power3.out',
      });

      gsap.utils.toArray<HTMLElement>('.orbit-node').forEach((node, index) => {
        gsap.from(node, {
          scale: 0.76,
          opacity: 0,
          duration: 0.55,
          delay: 0.28 + index * 0.08,
          ease: 'back.out(1.6)',
        });
      });

      gsap.utils.toArray<HTMLElement>('.section-reveal').forEach((section) => {
        gsap.from(section, {
          y: 56,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="page-shell relative overflow-hidden bg-transparent text-kaleo-charcoal">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[56rem] bg-[radial-gradient(circle_at_top,rgba(197,106,67,0.26),transparent_48%)]" />

      <section id="overview" className="relative px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="hero-copy relative z-10">
            <span className="impact-chip">Civic Atlas For AI-Native Action</span>
            <h1 className="mt-6 max-w-4xl text-display font-serif text-kaleo-charcoal">
              AI that turns intent into structured, trackable impact.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-kaleo-charcoal/70 sm:text-xl">
              Civic Hub is a unified operating layer for education, wellness, sustainability, and accessibility. It organizes domain agents into one calm system people can actually return to.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="impact-button">
                Launch Civic Hub
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="impact-button-secondary">
                Explore the live app
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="signal-card">
                  <p className="data-label">{stat.label}</p>
                  <p className="data-value">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-kaleo-charcoal/60">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel impact-panel surface-grid relative overflow-hidden p-5 sm:p-6">
            <div className="orbital-map p-5 sm:p-6">
              <div className="pointer-events-none absolute left-[12%] top-[12%] h-16 w-16 rounded-full border border-kaleo-charcoal/10 animate-float-slow" />
              <div className="pointer-events-none absolute bottom-[14%] right-[18%] h-24 w-24 rounded-full border border-kaleo-charcoal/10 animate-float-delayed" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-kaleo-charcoal/8" />

              <div className="absolute left-1/2 top-1/2 z-10 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-kaleo-charcoal/10 bg-white/90 text-center shadow-[0_24px_46px_-28px_rgba(16,24,39,0.45)] backdrop-blur-xl">
                <span className="section-kicker">Core System</span>
                <span className="mt-2 font-serif text-3xl tracking-[-0.05em]">Civic Hub</span>
                <span className="mt-1 text-sm text-kaleo-charcoal/60">One profile, shared progress</span>
              </div>

              <div className="orbit-node" style={{ left: '16%', top: '20%', transform: 'translate(-10%, -8%)' }}>
                <span className="orbit-title" style={{ color: '#5B76F5' }}>
                  Education
                </span>
                <span className="orbit-body">Study materials become drills, notes, and interview prep.</span>
              </div>
              <div className="orbit-node" style={{ right: '8%', top: '20%' }}>
                <span className="orbit-title" style={{ color: '#5F8A63' }}>
                  Wellness
                </span>
                <span className="orbit-body">Goals turn into routines people can realistically follow.</span>
              </div>
              <div className="orbit-node" style={{ left: '10%', bottom: '14%' }}>
                <span className="orbit-title" style={{ color: '#C9993E' }}>
                  Sustainability
                </span>
                <span className="orbit-body">Small eco actions become visible momentum instead of guilt.</span>
              </div>
              <div className="orbit-node" style={{ right: '10%', bottom: '12%' }}>
                <span className="orbit-title" style={{ color: '#7597A4' }}>
                  Accessibility
                </span>
                <span className="orbit-body">Content stays readable, translatable, and easier to act on.</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="signal-card">
                <p className="data-label">Outputs</p>
                <p className="mt-2 text-2xl font-serif tracking-[-0.04em] text-kaleo-charcoal">Plans + drills</p>
                <p className="mt-2 text-sm text-kaleo-charcoal/60">Artifacts you can revisit, not disposable answers.</p>
              </div>
              <div className="signal-card">
                <p className="data-label">Behavior</p>
                <p className="mt-2 text-2xl font-serif tracking-[-0.04em] text-kaleo-charcoal">Calm by design</p>
                <p className="mt-2 text-sm text-kaleo-charcoal/60">Warm materials, clear hierarchy, measured motion.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="domains" className="section-reveal px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="section-kicker">Four Pillars, One Interface</p>
            <h2 className="mt-4 text-headline font-serif text-kaleo-charcoal">
              Modules designed like working systems, not feature checklists.
            </h2>
            <p className="mt-5 text-lg leading-8 text-kaleo-charcoal/70">
              Each domain has its own tone, but everything shares the same information architecture so the product feels coherent from first visit to daily use.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {domainCards.map((card) => (
              <Link
                key={card.title}
                to={card.path}
                className="impact-panel surface-grid module-card card-hover relative overflow-hidden p-7 sm:p-8"
              >
                <div
                  className="pointer-events-none absolute right-6 top-6 h-24 w-24 rounded-full blur-2xl"
                  style={{ backgroundColor: card.glow }}
                />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="section-kicker" style={{ color: `${card.accent}` }}>
                        {card.kicker}
                      </p>
                      <h3 className="mt-3 text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
                        {card.title}
                      </h3>
                    </div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-kaleo-charcoal/10 bg-white/80"
                      style={{ color: card.accent }}
                    >
                      <card.icon className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="mt-5 max-w-xl text-base leading-7 text-kaleo-charcoal/70">
                    {card.description}
                  </p>

                  <ul className="mt-8 space-y-3 text-sm text-kaleo-charcoal/70">
                    {card.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: card.accent }}
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="impact-chip">Enter module</span>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-kaleo-charcoal">
                      Open
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="section-reveal px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="impact-panel surface-grid overflow-hidden p-7 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="section-kicker">From Prompt To Progress</p>
                <h2 className="mt-4 text-headline font-serif text-kaleo-charcoal">
                  A workflow designed for follow-through.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-kaleo-charcoal/70">
                  The product is organized like a civic operating system: intake, structured generation, and visible momentum. That is the design thesis running through the entire repo.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="signal-card">
                    <p className="data-label">Recommendation queue</p>
                    <p className="mt-2 text-2xl font-serif tracking-[-0.04em] text-kaleo-charcoal">Cross-module</p>
                    <p className="mt-2 text-sm leading-6 text-kaleo-charcoal/60">
                      The dashboard can surface what matters next instead of forcing users to reopen each domain manually.
                    </p>
                  </div>
                  <div className="signal-card">
                    <p className="data-label">Interaction style</p>
                    <p className="mt-2 text-2xl font-serif tracking-[-0.04em] text-kaleo-charcoal">Measured motion</p>
                    <p className="mt-2 text-sm leading-6 text-kaleo-charcoal/60">
                      Animations are reserved for orientation and emphasis, not visual noise.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="signal-card card-hover flex gap-4 p-5 sm:p-6">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-kaleo-charcoal/10 bg-white/80"
                      style={{ color: step.accent }}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kaleo-charcoal/40">
                        Step {index + 1}
                      </p>
                      <h3 className="mt-2 text-2xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-kaleo-charcoal/60">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-reveal px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="section-kicker">Design Principles</p>
            <h2 className="mt-4 text-headline font-serif text-kaleo-charcoal">
              The visual system supports trust, warmth, and legibility.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {operatorSignals.map((signal) => (
              <div key={signal.title} className="impact-panel card-hover p-7">
                <p className="section-kicker">{signal.label}</p>
                <h3 className="mt-4 text-3xl font-serif tracking-[-0.04em] text-kaleo-charcoal">
                  {signal.title}
                </h3>
                <div className="my-6 soft-divider" />
                <p className="text-base leading-7 text-kaleo-charcoal/70">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-reveal px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.25rem] bg-kaleo-charcoal px-7 py-8 text-white shadow-[0_32px_70px_-40px_rgba(16,24,39,0.72)] sm:px-10 sm:py-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <div>
                <CivicHubMark theme="light" />
                <h2 className="mt-8 max-w-3xl text-headline font-serif text-white">
                  Build a calmer, sharper frontend for social-good workflows.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  The repo now has a stronger narrative, clearer surface hierarchy, and a shared aesthetic language that can extend across the remaining module pages.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-kaleo-charcoal transition hover:-translate-y-0.5"
                  >
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-10 soft-divider opacity-40" />
            <div className="mt-6 flex flex-col gap-2 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
              <span>Civic Hub repositions AI as operational infrastructure for people, not just content generation.</span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Purpose-built for structured follow-through
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
