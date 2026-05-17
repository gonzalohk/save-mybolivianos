# SaveMyBolivianos 🇧🇴

Aplicación de finanzas personales para Bolivia. PWA mobile-first con soporte multi-moneda (USD / BOB), gestión de cuentas, préstamos con interés y movimientos de fondos.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Estado global | Zustand v5 |
| Fetching / caché | TanStack Query v5 |
| Animaciones | Framer Motion v12 |
| Iconos | Lucide React |
| Deploy | Vercel (free tier) |

---

## Funcionalidades

### 🔐 Autenticación
- Registro e inicio de sesión con email/contraseña vía Supabase Auth.
- Cada usuario tiene un perfil aislado — los datos de un usuario nunca son visibles para otro (Row Level Security activado en todas las tablas).
- Protección de rutas mediante `proxy.ts`: redirige al login si no hay sesión activa.

### 💼 Cuentas (Wallets)
- Crear cuentas de distintos tipos: efectivo, banco, tarjeta, cooperativa, Binance, Wise, AirTM, caja fuerte, crypto.
- Cada cuenta tiene nombre, tipo, moneda (USD o BOB), color personalizado y saldo.
- **Agregar fondos**: registra un ingreso que suma al saldo.
- **Retirar fondos**: registra un gasto que resta al saldo.
- **Excluir del patrimonio total**: toggle por cuenta para no contarla en el balance del dashboard (útil para cuentas de ahorro separadas).
- **Alerta de saldo bajo**: define un umbral mínimo por cuenta; si el saldo baja de ese monto aparece una alerta en el dashboard.
- Eliminar cuenta (soft-delete: se desactiva sin borrar historial).

### 💸 Movimientos (Transactions)
- Historial de movimientos por cuenta ordenado por fecha descendente.
- Cada movimiento muestra tipo (ingreso/retiro), monto, descripción y tiempo relativo.
- **Eliminar movimiento**: revierte automáticamente el efecto sobre el saldo de la cuenta.

### 🤝 Préstamos (Loans)
- Dos tipos: **Me deben** (dinero prestado a alguien) y **Debo** (dinero recibido de alguien).
- Campos: contacto, monto, moneda, tasa de interés mensual, fecha límite, notas.
- **Interés simple mensual** calculado automáticamente según los meses transcurridos:
  ```
  Total = Capital × (1 + tasa/100 × meses)
  ```
- Progress ring visual que muestra el porcentaje pagado sobre el total con interés.
- **Registrar pago**: descuenta del monto pendiente; marca como "Completado" al saldar el total.
- **Eliminar pago**: revierte el monto y vuelve el estado a "Activo" si correspondía.
- Estados automáticos: Activo / Completado / Vencido.

### 📊 Dashboard
- Balance total en USD y su equivalente en BOB al tipo de cambio configurado.
- Desglose por moneda: total de cuentas en USD y en BOB.
- Tipo de cambio configurable (default: 6.97 BOB/USD).
- Resumen rápido: total prestado y total adeudado.
- Actividad reciente: últimas 10 transacciones con nombre de la cuenta asociada.
- **Centro de alertas** 🔔 con badge de conteo:
  - Préstamos vencidos (rojo)
  - Préstamos que vencen en ≤ 7 días (amarillo)
  - Cuentas con saldo bajo (amarillo)
  - Toca una alerta para ir directo a la entidad relacionada.

### ⚙️ Configuración
- Nombre y avatar del perfil.
- Tipo de cambio BOB/USD personalizable.
- **Modo privacidad**: oculta todos los montos con `••••` (toggle global).
- **PIN de acceso**: protección adicional al abrir la app.
- Cerrar sesión.

---

## Base de datos

El esquema completo está en `supabase/migrations/`. Ejecuta cada archivo en orden en el **SQL Editor** de tu proyecto de Supabase:

| Archivo | Contenido |
|---|---|
| `001_initial_schema.sql` | Tablas, RLS, triggers de insert (balance + pagos) |
| `002_add_exclude_from_total.sql` | Campo `exclude_from_total` en `wallets` |
| `003_add_low_balance_threshold.sql` | Campo `low_balance_threshold` en `wallets` |

---

## Correr el proyecto localmente

### Requisitos
- Node.js 20+ (recomendado via [nvm](https://github.com/nvm-sh/nvm))
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado

### 1. Clonar e instalar dependencias

```bash
nvm use 20
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Los valores están en tu proyecto de Supabase: **Settings → API**.

### 3. Aplicar migraciones en Supabase

En el SQL Editor de Supabase, ejecuta en orden:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_add_exclude_from_total.sql`
3. `supabase/migrations/003_add_low_balance_threshold.sql`

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload (Turbopack)
npm run build    # Build de producción
npm run start    # Servidor de producción (requiere build previo)
```

---

## Deploy en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com).
2. Agrega las variables de entorno en **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Vercel detecta Next.js automáticamente y hace el deploy. El plan gratuito es suficiente para uso personal.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Páginas de login y registro
│   ├── (app)/           # Páginas protegidas (dashboard, wallets, loans, settings)
│   └── globals.css      # Design system (Tailwind v4 custom theme)
├── components/
│   ├── dashboard/       # BalanceHeader, RecentActivity, AlertsPanel, QuickStats
│   ├── loans/           # LoanCard, AddLoanDrawer, RecordPaymentDrawer
│   ├── wallets/         # WalletCard, AddWalletDrawer
│   └── ui/              # Button, Card, Drawer, Badge, Skeleton, EmptyState...
├── hooks/               # useWallets, useLoans, useAlerts, useExchangeRate
├── services/            # walletsService, loansService, transactionsService
├── stores/              # authStore, uiStore (privacidad/PIN), exchangeRateStore
├── types/               # app.types.ts (todos los tipos TypeScript)
└── utils/               # formatCurrency, formatDate, loan-interest, cn
supabase/
└── migrations/          # SQL para aplicar en Supabase
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
