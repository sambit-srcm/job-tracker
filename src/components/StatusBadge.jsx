import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/constants'

// Renders a color-coded pill with a status dot for a given application status
export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Applied
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.pill
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {status}
    </span>
  )
}
