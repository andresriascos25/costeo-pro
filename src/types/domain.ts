import type { Tables, TablesInsert, TablesUpdate } from './database'

export type Profile = Tables<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type IngredientType = 'ingrediente' | 'material'

export type Ingredient = Tables<'ingredients'>
export type IngredientInsert = TablesInsert<'ingredients'>
export type IngredientUpdate = TablesUpdate<'ingredients'>

export type Product = Tables<'products'>
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>

export type RecipeItem = Tables<'recipe_items'>
export type RecipeItemInsert = TablesInsert<'recipe_items'>
export type RecipeItemUpdate = TablesUpdate<'recipe_items'>

export type ProductProfitability = Tables<'product_profitability'>

export type RecipeItemWithIngredient = RecipeItem & {
  ingredient: Ingredient
}

export const UNIT_OPTIONS = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'paquete', label: 'Paquete' },
] as const
