import type { LucideIcon } from 'lucide-react';

import { cn } from '../../lib/utils';

interface WorkspaceFilterChipProps {
  label: string;
  count?: number;
  icon?: LucideIcon;
  active?: boolean;
  onClick: () => void;
}

export default function WorkspaceFilterChip({
  label,
  count,
  icon: Icon,
  active = false,
  onClick,
}: WorkspaceFilterChipProps) {
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={cn(
        'workspace-filter-chip group inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium transition duration-300 ease-out',
        active
          ? 'border-[rgba(139,92,246,0.34)] bg-[linear-gradient(135deg,rgba(139,92,246,0.28),rgba(255,107,107,0.22))] text-kaleo-cream shadow-[0_16px_30px_-20px_rgba(139,92,246,0.85)]'
          : 'border-white/10 bg-white/[0.04] text-kaleo-charcoal/72 hover:border-[rgba(139,92,246,0.2)] hover:bg-white/[0.08] hover:text-kaleo-charcoal',
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full border transition duration-300 ease-out',
            active
              ? 'border-white/12 bg-white/12 text-kaleo-cream'
              : 'border-white/8 bg-white/[0.04] text-kaleo-charcoal/55 group-hover:text-kaleo-charcoal/75',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      ) : null}
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em]',
            active ? 'bg-white/12 text-kaleo-cream/90' : 'bg-white/[0.06] text-kaleo-charcoal/48',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
