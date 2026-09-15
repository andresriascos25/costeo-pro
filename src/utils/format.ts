const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const preciseCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(value ?? 0)
}

export function formatCurrencyPrecise(value: number | null | undefined): string {
  return preciseCurrencyFormatter.format(value ?? 0)
}

export function formatPercent(value: number | null | undefined): string {
  return `${(value ?? 0).toFixed(1)}%`
}

export function formatQuantity(value: number | null | undefined): string {
  const n = value ?? 0
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}
