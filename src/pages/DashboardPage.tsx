import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listProductProfitability } from '../data/products'
import type { ProductProfitability } from '../types/domain'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { ProfitBadge } from '../components/ui/ProfitBadge'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatPercent } from '../utils/format'
import { computeProfitability, type ProfitabilityLevel } from '../utils/profitability'

interface EnrichedProduct extends ProductProfitability {
  level: ProfitabilityLevel
  profit: number
  marginPercent: number
}

export function DashboardPage() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<EnrichedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listProductProfitability()
      .then((rows) => {
        setProducts(
          rows.map((row) => {
            const { level, profit, marginPercent } = computeProfitability(row.sale_price ?? 0, row.total_cost ?? 0)
            return { ...row, level, profit, marginPercent }
          }),
        )
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el panel.'))
      .finally(() => setLoading(false))
  }, [])

  const summary = useMemo(() => {
    if (products.length === 0) return null
    const sorted = [...products].sort((a, b) => b.marginPercent - a.marginPercent)
    const counts = { rentable: 0, bajo: 0, 'no-rentable': 0 } as Record<ProfitabilityLevel, number>
    for (const p of products) counts[p.level]++
    return {
      total: products.length,
      mostProfitable: sorted[0],
      leastProfitable: sorted[sorted.length - 1],
      totalEstimatedProfit: products.reduce((sum, p) => sum + p.profit, 0),
      counts,
    }
  }, [products])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Hola{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {profile?.business_name ? `Resumen de rentabilidad de ${profile.business_name}` : 'Resumen de rentabilidad'}
      </p>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      {!summary ? (
        <div className="mt-6">
          <EmptyState
            title="Todavía no hay nada que mostrar"
            description="Crea tus ingredientes y al menos un producto con su receta para ver aquí tu rentabilidad."
            action={
              <Link to="/productos">
                <Button>Crear mi primer producto</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Productos creados</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ganancia estimada total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(summary.totalEstimatedProfit)}
              </p>
              <p className="text-xs text-slate-400">suma de ganancia por unidad de cada producto</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Rentables</p>
              <p className="mt-2 text-2xl font-semibold text-green-700">🟢 {summary.counts.rentable}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Necesitan atención</p>
              <p className="mt-2 text-2xl font-semibold text-amber-700">
                🟡 {summary.counts.bajo} &nbsp; 🔴 {summary.counts['no-rentable']}
              </p>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProductHighlight
              title="Producto más rentable"
              product={summary.mostProfitable}
            />
            <ProductHighlight
              title="Producto menos rentable"
              product={summary.leastProfitable}
            />
          </div>

          <Card className="mt-6 overflow-x-auto p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Resumen general</h2>
            </div>
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Producto</th>
                  <th className="px-5 py-2.5 font-medium">Precio</th>
                  <th className="px-5 py-2.5 font-medium">Costo</th>
                  <th className="px-5 py-2.5 font-medium">Margen</th>
                  <th className="px-5 py-2.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.product_id}>
                    <td className="px-5 py-2.5 font-medium text-slate-900">
                      <Link to={`/productos/${product.product_id}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-slate-600">{formatCurrency(product.sale_price)}</td>
                    <td className="px-5 py-2.5 text-slate-600">{formatCurrency(product.total_cost)}</td>
                    <td className="px-5 py-2.5 text-slate-600">{formatPercent(product.marginPercent)}</td>
                    <td className="px-5 py-2.5">
                      <ProfitBadge level={product.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}

function ProductHighlight({ title, product }: { title: string; product: EnrichedProduct }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
      <div className="mt-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
        <ProfitBadge level={product.level} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Ganancia {formatCurrency(product.profit)} · Margen {formatPercent(product.marginPercent)}
      </p>
    </Card>
  )
}
