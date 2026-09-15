import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import type { Product } from '../../types/domain'
import type { ProductFormValues } from '../../data/products'

interface ProductFormModalProps {
  product: Product | null
  onClose: () => void
  onSubmit: (values: ProductFormValues) => Promise<void>
}

export function ProductFormModal({ product, onClose, onSubmit }: ProductFormModalProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [salePrice, setSalePrice] = useState(product ? String(product.sale_price) : '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Ingresa un nombre para el producto.')
      return
    }
    const priceNum = Number(salePrice)
    if (!(priceNum >= 0)) {
      setError('El precio de venta no puede ser negativo.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), salePrice: priceNum })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={product ? 'Editar producto' : 'Nuevo producto'}
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
          placeholder="Ej: Hamburguesa Clásica"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          label="Descripción (opcional)"
          placeholder="Ej: Pan, carne, queso y salsa especial"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Precio de venta"
          type="number"
          step="any"
          min="0"
          placeholder="Ej: 15000"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          required
        />
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </form>
    </Modal>
  )
}
