import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createProduct, deleteProduct, listProductProfitability } from '../../data/products'
import type { ProductFormValues } from '../../data/products'
import type { ProductProfitability } from '../../types/domain'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { ProfitBadge } from '../../components/ui/ProfitBadge'
import { formatCurrency, formatPercent } from '../../utils/format'
import { computeProfitability } from '../../utils/profitability'
import { ProductFormModal } from './ProductFormModal'

export function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<ProductProfitability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      setProducts(await listProductProfitability())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate(values: ProductFormValues) {
    if (!user) return
    await createProduct(user.id, values)
    await refresh()
  }

  async function handleDelete(id: string) {
    setConfirmTarget(null)
    setDeletingId(id)
    try {
      await deleteProduct(id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el producto.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crea tus productos y arma la receta para conocer su costo real y rentabilidad.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Nuevo</Button>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <EmptyState
            title="Aún no tienes productos"
            description="Crea tu primer producto (por ejemplo, Hamburguesa Clásica) y luego agrégale su receta de ingredientes."
            action={<Button onClick={() => setModalOpen(true)}>Crear producto</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const { level, profit, marginPercent } = computeProfitability(
                product.sale_price ?? 0,
                product.total_cost ?? 0,
              )
              return (
                <Card key={product.product_id} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                    <ProfitBadge level={level} />
                  </div>
                  <dl className="grid grid-cols-2 gap-y-1 text-sm">
                    <dt className="text-slate-500">Precio de venta</dt>
                    <dd className="text-right font-medium text-slate-900">{formatCurrency(product.sale_price)}</dd>
                    <dt className="text-slate-500">Costo total</dt>
                    <dd className="text-right font-medium text-slate-900">{formatCurrency(product.total_cost)}</dd>
                    <dt className="text-slate-500">Ganancia</dt>
                    <dd className={`text-right font-medium ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </dd>
                    <dt className="text-slate-500">Margen</dt>
                    <dd className="text-right font-medium text-slate-900">{formatPercent(marginPercent)}</dd>
                  </dl>
                  <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3">
                    <Link
                      to={`/productos/${product.product_id}`}
                      className="text-sm font-semibold text-brand-700 hover:underline"
                    >
                      Ver receta y editar →
                    </Link>
                    <button
                      onClick={() =>
                        product.product_id && setConfirmTarget({ id: product.product_id, name: product.name ?? '' })
                      }
                      disabled={deletingId === product.product_id}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductFormModal product={null} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${confirmTarget.name}"? Se eliminará también su receta.`}
          onConfirm={() => handleDelete(confirmTarget.id)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  )
}
