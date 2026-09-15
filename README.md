# Costeo Pro

PWA para que emprendedores calculen el costo real de sus productos, conozcan su margen de ganancia y sepan si son rentables. Construida inicialmente para **M9 Fast Food**, con una arquitectura multi-negocio: cada usuario (cuenta) ve únicamente sus propios ingredientes, productos y recetas.

## Stack

- React 19 + TypeScript + Vite
- Supabase (Auth + Postgres + Row Level Security)
- Tailwind CSS v4
- React Router
- PWA instalable (`vite-plugin-pwa`)

## Funcionalidad

- Registro / inicio de sesión / recuperación de contraseña (Supabase Auth).
- Perfil de usuario: nombre, nombre del negocio, correo.
- **Ingredientes y materiales**: registras cantidad comprada, unidad y precio pagado; el costo por unidad se calcula solo.
- **Productos**: nombre, descripción, precio de venta, y una receta con los ingredientes/materiales que usa y cuánto consume de cada uno.
- **Rentabilidad**: costo total, ganancia por unidad y margen %, con indicador 🟢 Rentable / 🟡 Margen bajo / 🔴 No rentable.
- **Dashboard**: total de productos, producto más y menos rentable, ganancia estimada total y resumen general.
- Si editas el precio de un ingrediente, todos los productos que lo usan recalculan su costo y margen automáticamente (sin acción manual).

## Desarrollo local

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env` y completa con las credenciales de tu proyecto de Supabase:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
```

## Base de datos

El esquema (tablas `profiles`, `ingredients`, `products`, `recipe_items`, la vista `product_profitability` y las políticas de Row Level Security) vive en [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). Aplícalo con el CLI de Supabase o pégalo en el SQL Editor del panel de Supabase.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — type-check + build de producción
- `npm run preview` — sirve el build de producción localmente
- `npm run lint` — oxlint
