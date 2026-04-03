import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import CivicHubMark from './CivicHubMark';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  highlights: Array<{
    label: string;
    detail: string;
  }>;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  highlights,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="page-shell relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(197,106,67,0.24),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(117,151,164,0.24),transparent_65%)] blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="impact-panel surface-grid relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute -left-10 top-16 h-48 w-48 rounded-full border border-kaleo-charcoal/8" />
            <div className="pointer-events-none absolute right-10 top-10 h-24 w-24 rounded-full border border-kaleo-charcoal/10" />
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-kaleo-charcoal/10 bg-white/70 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-kaleo-charcoal/60 transition hover:border-kaleo-charcoal/20 hover:text-kaleo-charcoal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back Home
            </Link>

            <div className="mt-8">
              <CivicHubMark />
            </div>

            <div className="mt-12 max-w-xl">
              <p className="section-kicker">{eyebrow}</p>
              <h1 className="mt-4 font-serif text-[clamp(3rem,6vw,4.9rem)] leading-[0.92] tracking-[-0.05em] text-kaleo-charcoal">
                {title}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-kaleo-charcoal/70 sm:text-lg">
                {description}
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {highlights.map((highlight, index) => (
                <div
                  key={highlight.label}
                  className="rounded-[1.6rem] border border-kaleo-charcoal/10 bg-white/75 px-4 py-4 shadow-[0_20px_44px_-32px_rgba(16,24,39,0.48)] backdrop-blur-md"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-kaleo-charcoal/40">
                    {highlight.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-kaleo-charcoal/70">{highlight.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-kaleo-charcoal/10 bg-white/70 px-4 py-2 text-sm text-kaleo-charcoal/70">
              Structured outputs, domain memory, measurable follow-through
              <ArrowUpRight className="h-4 w-4 text-kaleo-clay" />
            </div>
          </section>

          <section className="impact-panel relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),transparent)]" />
            <div className="relative z-10">
              {children}
              <div className="mt-8 border-t border-kaleo-charcoal/10 pt-6 text-sm text-kaleo-charcoal/60">
                {footer}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
