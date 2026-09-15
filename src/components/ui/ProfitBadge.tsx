import { PROFITABILITY_META, type ProfitabilityLevel } from '../../utils/profitability'

export function ProfitBadge({ level }: { level: ProfitabilityLevel }) {
  const meta = PROFITABILITY_META[level]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  )
}
