import { supabase } from '../lib/supabaseClient'
import type { Ingredient, IngredientType } from '../types/domain'

export interface IngredientFormValues {
  name: string
  type: IngredientType
  purchasedQuantity: number
  unit: string
  purchasedPrice: number
}

export async function listIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase.from('ingredients').select('*').order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createIngredient(userId: string, values: IngredientFormValues): Promise<void> {
  const { error } = await supabase.from('ingredients').insert({
    user_id: userId,
    name: values.name,
    type: values.type,
    purchased_quantity: values.purchasedQuantity,
    unit: values.unit,
    purchased_price: values.purchasedPrice,
  })
  if (error) throw error
}

export async function updateIngredient(id: string, values: IngredientFormValues): Promise<void> {
  const { error } = await supabase
    .from('ingredients')
    .update({
      name: values.name,
      type: values.type,
      purchased_quantity: values.purchasedQuantity,
      unit: values.unit,
      purchased_price: values.purchasedPrice,
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteIngredient(id: string): Promise<void> {
  const { error } = await supabase.from('ingredients').delete().eq('id', id)
  if (error) throw error
}
