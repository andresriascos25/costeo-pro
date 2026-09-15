import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  createIngredient,
  deleteIngredient,
  listIngredients,
  updateIngredient,
  type IngredientFormValues,
} from '../../data/ingredients'
import type { Ingredient } from '../../types/domain'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatCurrencyPrecise, formatQuantity } from '../../utils/format'
import { IngredientFormModal } from './IngredientFormModal'

export function IngredientsPage() {
  const { user } = useAuth()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Ingredient | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      setIngredients(await listIngredients())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los ingredientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(ingredient: Ingredient) {
    setEditing(ingredient)
    setModalOpen(true)
  }

  async function handleSave(values: IngredientFormValues) {
    if (editing) {
      await updateIngredient(editing.id, values)
    } else if (user) {
      await createIngredient(user.id, values)
    }
    await refresh()
  }

  async function handleDelete(ingredient: Ingredient) {
    setConfirmTarget(null)
    setDeletingId(ingredient.id)
    try {
      await deleteIngredient(ingredient.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el ingrediente.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ingredientes y materiales</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registra lo que compras y calculamos el costo por unidad automáticamente.
          </p>
        </div>
        <Button onClick={openCreate}>+ Nuevo</Button>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : ingredients.length === 0 ? (
          <EmptyState
            title="Aún no tienes ingredientes"
            description="Agrega tu primer ingrediente o material (carne, pan, cajas, servilletas...) para empezar a costear tus productos."
            action={<Button onClick={openCreate}>Agregar ingrediente</Button>}
          />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Comprado</th>
                  <th className="px-4 py-3 font-medium">Precio pagado</th>
                  <th className="px-4 py-3 font-medium">Costo por unidad</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{ingredient.name}</td>
                    <td className="px-4 py-3 capitalize text-slate-500">{ingredient.type}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatQuantity(ingredient.purchased_quantity)} {ingredient.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(ingredient.purchased_price)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCurrencyPrecise(ingredient.cost_per_unit)} / {ingredient.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(ingredient)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmTarget(ingredient)}
                          disabled={deletingId === ingredient.id}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {modalOpen && (
        <IngredientFormModal
          ingredient={editing}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSave}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Eliminar ingrediente"
          message={`¿Eliminar "${confirmTarget.name}"? Esto afectará el costo de los productos que lo usen.`}
          onConfirm={() => handleDelete(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  )
}
