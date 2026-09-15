import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listIngredients } from '../../data/ingredients'
import {
  addRecipeItem,
  deleteProduct,
  getProduct,
  listRecipeItems,
  removeRecipeItem,
  updateProduct,
  updateRecipeItemQuantity,
} from '../../data/products'
import type { ProductFormValues } from '../../data/products'
import type { Ingredient, Product, RecipeItemWithIngredient } from '../../types/domain'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Select } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { ProfitBadge } from '../../components/ui/ProfitBadge'
import { formatCurrency, formatCurrencyPrecise, formatPercent } from '../../utils/format'
import { computeProfitability } from '../../utils/profitability'
import { ProductFormModal } from './ProductFormModal'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [recipeItems, setRecipeItems] = useState<RecipeItemWithIngredient[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [selectedIngredientId, setSelectedIngredientId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [addingItem, setAddingItem] = useState(false)

  async function refresh() {
    if (!id) return
    setLoading(true)
    try {
      const [productData, recipeData, ingredientsData] = await Promise.all([
        getProduct(id),
        listRecipeItems(id),
        listIngredients(),
      ])
      setProduct(productData)
      setRecipeItems(recipeData)
      setIngredients(ingredientsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el producto.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const availableIngredients = ingredients.filter(
    (ingredient) => !recipeItems.some((item) => item.ingredient_id === ingredient.id),
  )

  const totalCost = recipeItems.reduce(
    (sum, item) => sum + item.quantity * (item.ingredient?.cost_per_unit ?? 0),
    0,
  )
  const profitability = product ? computeProfitability(product.sale_price, totalCost) : null

  async function handleAddIngredient(e: FormEvent) {
    e.preventDefault()
    if (!user || !id || !selectedIngredientId) return
    const quantityNum = Number(quantity)
    if (!(quantityNum > 0)) {
      setError('La cantidad debe ser mayor a 0.')
      return
    }
    setAddingItem(true)
    setError(null)
    try {
      await addRecipeItem(user.id, id, selectedIngredientId, quantityNum)
      setSelectedIngredientId('')
      setQuantity('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el ingrediente.')
    } finally {
      setAddingItem(false)
    }
  }

  async function handleQuantityChange(itemId: string, value: string) {
    const quantityNum = Number(value)
    if (!(quantityNum > 0)) return
    setRecipeItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: quantityNum } : item)))
    try {
      await updateRecipeItemQuantity(itemId, quantityNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la cantidad.')
      await refresh()
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      await removeRecipeItem(itemId)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar el ingrediente.')
    }
  }

  async function handleEditProduct(values: ProductFormValues) {
    if (!id) return
    await updateProduct(id, values)
    await refresh()
  }

  async function handleDeleteProduct() {
    if (!id) return
    setConfirmDelete(false)
    await deleteProduct(id)
    navigate('/productos', { replace: true })
  }

  if (loading) return <Spinner />
  if (!product) {
    return (
      <div>
        <p className="text-sm text-slate-600">Producto no encontrado.</p>
        <Link to="/productos" className="text-sm font-medium text-brand-700 hover:underline">
          Volver a productos
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/productos" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Volver a productos
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
          {product.description && <p className="mt-1 text-sm text-slate-500">{product.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Editar producto
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Eliminar
          </Button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      {profitability && (
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Rentabilidad</h2>
            <ProfitBadge level={profitability.level} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Precio de venta" value={formatCurrency(product.sale_price)} />
            <Stat label="Costo total" value={formatCurrency(totalCost)} />
            <Stat
              label="Ganancia por unidad"
              value={formatCurrency(profitability.profit)}
              accent={profitability.profit >= 0 ? 'text-green-700' : 'text-red-600'}
            />
            <Stat label="Margen" value={formatPercent(profitability.marginPercent)} />
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="text-base font-semibold text-slate-900">Receta e insumos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Agrega los ingredientes y materiales que usa este producto y cuánto consume de cada uno.
        </p>

        {recipeItems.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 font-medium">Ingrediente</th>
                  <th className="py-2 font-medium">Cantidad usada</th>
                  <th className="py-2 font-medium">Costo</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recipeItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5">
                      <p className="font-medium text-slate-900">{item.ingredient?.name}</p>
                      <p className="text-xs capitalize text-slate-400">{item.ingredient?.type}</p>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          defaultValue={item.quantity}
                          onBlur={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                        />
                        <span className="text-slate-500">{item.ingredient?.unit}</span>
                      </div>
                    </td>
                    <td className="py-2.5 font-medium text-slate-900">
                      {formatCurrencyPrecise(item.quantity * (item.ingredient?.cost_per_unit ?? 0))}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {availableIngredients.length > 0 ? (
          <form onSubmit={handleAddIngredient} className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
            <div className="min-w-[180px] flex-1">
              <Select
                label="Ingrediente o material"
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
              >
                <option value="">Selecciona...</option>
                {availableIngredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} ({formatCurrencyPrecise(ingredient.cost_per_unit)}/{ingredient.unit})
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-32">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Cantidad</label>
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>
            <Button type="submit" loading={addingItem} disabled={!selectedIngredientId}>
              Agregar
            </Button>
          </form>
        ) : ingredients.length === 0 ? (
          <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
            Aún no tienes ingredientes registrados.{' '}
            <Link to="/ingredientes" className="font-medium text-brand-700 hover:underline">
              Crea uno primero
            </Link>
            .
          </p>
        ) : (
          <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
            Ya agregaste todos tus ingredientes disponibles a esta receta.
          </p>
        )}
      </Card>

      {editOpen && (
        <ProductFormModal product={product} onClose={() => setEditOpen(false)} onSubmit={handleEditProduct} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteProduct}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ?? 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
