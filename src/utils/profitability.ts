export type ProfitabilityLevel = 'rentable' | 'bajo' | 'no-rentable'

export interface ProfitabilitySummary {
  totalCost: number
  profit: number
  marginPercent: number
  level: ProfitabilityLevel
}

// Thresholds: >=30% margin is healthy, 10-30% is tight, below 10% (or a loss) is not viable.
const HEALTHY_MARGIN = 30
const LOW_MARGIN = 10

export function getProfitabilityLevel(marginPercent: number, profit: number): ProfitabilityLevel {
  if (profit <= 0) return 'no-rentable'
  if (marginPercent >= HEALTHY_MARGIN) return 'rentable'
  if (marginPercent >= LOW_MARGIN) return 'bajo'
  return 'no-rentable'
}

export function computeProfitability(salePrice: number, totalCost: number): ProfitabilitySummary {
  const profit = salePrice - totalCost
  const marginPercent = salePrice > 0 ? (profit / salePrice) * 100 : 0
  return {
    totalCost,
    profit,
    marginPercent,
    level: getProfitabilityLevel(marginPercent, profit),
  }
}

export const PROFITABILITY_META: Record<
  ProfitabilityLevel,
  { label: string; emoji: string; className: string }
> = {
  rentable: {
    label: 'Rentable',
    emoji: '🟢',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  bajo: {
    label: 'Margen bajo',
    emoji: '🟡',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  'no-rentable': {
    label: 'No rentable',
    emoji: '🔴',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
}
