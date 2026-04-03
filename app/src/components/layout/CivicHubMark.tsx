import { cn } from '../../lib/utils';

interface CivicHubMarkProps {
  theme?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
}

export default function CivicHubMark({
  theme = 'dark',
  compact = false,
  className,
}: CivicHubMarkProps) {
  const isLight = theme === 'light';

  return (
    <span className={cn('inline-flex items-center gap-3', compact && 'gap-2.5', className)}>
      <span
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-[1.15rem] border',
          compact ? 'h-10 w-10' : 'h-11 w-11',
          isLight
            ? 'border-white/20 bg-white/10 shadow-[0_20px_40px_-24px_rgba(255,255,255,0.55)]'
            : 'border-kaleo-border bg-[rgba(22,24,33,0.92)] shadow-[0_24px_50px_-30px_rgba(0,0,0,0.6)]',
        )}
      >
        <span
          className={cn(
            'absolute inset-[0.42rem] rounded-full border',
            isLight ? 'border-white/20' : 'border-kaleo-primary/25',
          )}
        />
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            isLight ? 'bg-white shadow-[0_0_18px_rgba(255,255,255,0.55)]' : 'bg-kaleo-primary shadow-[0_0_16px_rgba(139,92,246,0.72)]',
          )}
        />
      </span>
      <span className={cn('leading-none', isLight ? 'text-white' : 'text-kaleo-primary')}>
        <span className={cn('block font-serif tracking-[-0.05em]', compact ? 'text-xl' : 'text-2xl')}>
          Civic Hub
        </span>
        {!compact ? (
          <span className={cn('mt-1 block text-[0.62rem] uppercase tracking-[0.26em]', isLight ? 'text-white/60' : 'text-kaleo-muted')}>
            AI Workspace For Civic Action
          </span>
        ) : null}
      </span>
    </span>
  );
}
