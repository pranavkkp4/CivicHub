import { cn } from '../../lib/utils';

interface ImpactMarkProps {
  theme?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
}

export default function ImpactMark({
  theme = 'dark',
  compact = false,
  className,
}: ImpactMarkProps) {
  const isLight = theme === 'light';

  return (
    <span className={cn('inline-flex items-center gap-3', compact && 'gap-2.5', className)}>
      <span
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-[1.15rem] border',
          compact ? 'h-10 w-10' : 'h-11 w-11',
          isLight
            ? 'border-white/20 bg-white/10 shadow-[0_20px_40px_-24px_rgba(255,255,255,0.55)]'
            : 'border-black/10 bg-white/80 shadow-[0_24px_50px_-30px_rgba(16,24,39,0.45)]',
        )}
      >
        <span
          className={cn(
            'absolute inset-[0.42rem] rounded-full border',
            isLight ? 'border-white/20' : 'border-kaleo-charcoal/10',
          )}
        />
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            isLight ? 'bg-white shadow-[0_0_18px_rgba(255,255,255,0.55)]' : 'bg-kaleo-charcoal',
          )}
        />
      </span>
      <span className={cn('leading-none', isLight ? 'text-white' : 'text-kaleo-charcoal')}>
        <span className={cn('block font-serif tracking-[-0.05em]', compact ? 'text-xl' : 'text-2xl')}>
          Impact OS
        </span>
        {!compact ? (
          <span className={cn('mt-1 block text-[0.62rem] uppercase tracking-[0.26em]', isLight ? 'text-white/60' : 'text-kaleo-charcoal/50')}>
            Operating System For Impact
          </span>
        ) : null}
      </span>
    </span>
  );
}
