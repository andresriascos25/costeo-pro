import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { UNIT_OPTIONS, type Ingredient, type IngredientType } from '../../types/domain'
import type { IngredientFormValues } from '../../data/ingredients'
import { formatCurrencyPrecise } from '../../utils/format'

interface IngredientFormModalProps {
  ingredient: Ingredient | null
  onClose: () => void
  onSubmit: (values: IngredientFormValues) => Promise<void>
}

export function IngredientFormModal({ ingredient, onClose, onSubmit }: IngredientFormModalProps) {
  const [name, setName] = useState(ingredient?.name ?? '')
  const [type, setType] = useState<IngredientType>((ingredient?.type as IngredientType) ?? 'ingrediente')
  const [purchasedQuantity, setPurchasedQuantity] = useState(
    ingredient ? String(ingredient.purchased_quantity) : '',
  )
  const [unit, setUnit] = useState(ingredient?.unit ?? UNIT_OPTIONS[0].value)
  const [purchasedPrice, setPurchasedPrice] = useState(ingredient ? String(ingredient.purchased_price) : '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const quantityNum = Number(purchasedQuantity)
  const priceNum = Number(purchasedPrice)
  const costPerUnit = quantityNum > 0 ? priceNum / quantityNum : 0

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Ingresa un nombre.')
      return
    }
    if (!(quantityNum > 0)) {
      setError('La cantidad comprada debe ser mayor a 0.')
      return
    }
    if (!(priceNum >= 0)) {
      setError('El precio pagado no puede ser negativo.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        type,
        purchasedQuantity: quantityNum,
        unit,
        purchasedPrice: priceNum,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el ingrediente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Guardar
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Nombre"
          placeholder="Ej: Carne, Pan, Caja para hamburguesa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
          {(['ingrediente', 'material'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-colors ${
                type === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {option === 'ingrediente' ? 'Insumo / ingrediente' : 'Material (empaque, etc.)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cantidad comprada"
            type="number"
            step="any"
            min="0"
            placeholder="Ej: 5"
            value={purchasedQuantity}
            onChange={(e) => setPurchasedQuantity(e.target.value)}
            required
          />
          <Select label="Unidad de medida" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {UNIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Precio pagado (total)"
          type="number"
          step="any"
          min="0"
          placeholder="Ej: 25000"
          value={purchasedPrice}
          onChange={(e) => setPurchasedPrice(e.target.value)}
          required
        />

        {quantityNum > 0 && priceNum >= 0 && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            Costo por {unit}: <strong>{formatCurrencyPrecise(costPerUnit)}</strong>
          </p>
        )}

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </form>
    </Modal>
  )
}
