import { cn } from '@/lib/utils';

type Status = 'safe' | 'warning' | 'trigger' | 'pending' | 'active' | 'expired';

const STYLES: Record<Status, string> = {
  safe: 'bg-[rgba(34,211,238,0.1)] text-oracle-safe',
  warning: 'bg-[rgba(251,191,36,0.1)] text-oracle-warning',
  trigger: 'bg-[rgba(248,113,113,0.1)] text-oracle-trigger',
  pending: 'bg-[rgba(110,231,183,0.06)] text-nimbus-300',
  active: 'bg-[rgba(16,185,129,0.12)] text-nimbus-400',
  expired: 'bg-[rgba(236,253,245,0.06)] text-nimbus-300/60',
};

const LABEL: Record<Status, string> = {
  safe: 'SAFE',
  warning: 'WARNING',
  trigger: 'TRIGGER',
  pending: 'PENDING',
  active: 'ACTIVE',
  expired: 'EXPIRED',
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
        STYLES[status],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {LABEL[status]}
    </span>
  );
}
