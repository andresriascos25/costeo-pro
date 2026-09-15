import { supabase } from '../lib/supabaseClient'
import type { Product, ProductProfitability, RecipeItemWithIngredient } from '../types/domain'

export interface ProductFormValues {
  name: string
  description: string
  salePrice: number
}

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function listProductProfitability(): Promise<ProductProfitability[]> {
  const { data, error } = await supabase.from('product_profitability').select('*')
  if (error) throw error
  return data ?? []
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createProduct(userId: string, values: ProductFormValues): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      name: values.name,
      description: values.description,
      sale_price: values.salePrice,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      name: values.name,
      description: values.description,
      sale_price: values.salePrice,
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function listRecipeItems(productId: string): Promise<RecipeItemWithIngredient[]> {
  const { data, error } = await supabase
    .from('recipe_items')
    .select('*, ingredient:ingredients(*)')
    .eq('product_id', productId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as RecipeItemWithIngredient[]
}

export async function addRecipeItem(
  userId: string,
  productId: string,
  ingredientId: string,
  quantity: number,
): Promise<void> {
  const { error } = await supabase.from('recipe_items').insert({
    user_id: userId,
    product_id: productId,
    ingredient_id: ingredientId,
    quantity,
  })
  if (error) throw error
}

export async function updateRecipeItemQuantity(id: string, quantity: number): Promise<void> {
  const { error } = await supabase.from('recipe_items').update({ quantity }).eq('id', id)
  if (error) throw error
}

export async function removeRecipeItem(id: string): Promise<void> {
  const { error } = await supabase.from('recipe_items').delete().eq('id', id)
  if (error) throw error
}
