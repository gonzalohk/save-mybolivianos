export type Currency = 'USD' | 'BOB'
export type LoanType = 'lent' | 'borrowed'
export type LoanStatus = 'active' | 'completed' | 'overdue'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type WalletType =
  | 'cash'
  | 'bank'
  | 'card'
  | 'cooperative'
  | 'binance'
  | 'wise'
  | 'airtm'
  | 'safe'
  | 'crypto'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  default_currency: Currency
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  name: string
  type: WalletType
  currency: Currency
  balance: number
  color: string
  icon: string
  is_active: boolean
  /** Si es true, esta cuenta se excluye del cálculo de patrimonio total */
  exclude_from_total: boolean
  /** Umbral de saldo mínimo. Si el balance baja de este valor se genera una alerta. null = desactivado */
  low_balance_threshold?: number | null
  created_at: string
  updated_at: string
}

export type CreateWalletInput = Omit<Wallet, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string | null
  category_id: string | null
  amount: number
  currency: Currency
  type: TransactionType
  description: string | null
  date: string
  created_at: string
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'user_id' | 'created_at'>

/** Transaction con el nombre y color de la cuenta, resultado del JOIN con wallets */
export interface TransactionWithWallet extends Transaction {
  wallets: { name: string; color: string } | null
}

/** Tipos de alerta que puede generar la app */
export type AlertType = 'loan_overdue' | 'loan_due_soon' | 'low_balance'

/**
 * AppAlert — Alerta calculada en el cliente a partir de los datos ya cargados.
 * No requiere tabla en la DB; se deriva de loans y wallets en cada render.
 */
export interface AppAlert {
  /** ID único para usar como key en listas (ej: 'loan_overdue_<uuid>') */
  id: string
  type: AlertType
  /** error = crítico/rojo · warning = amarillo · info = azul */
  severity: 'error' | 'warning' | 'info'
  title: string
  description: string
  /** UUID de la entidad relacionada (wallet.id o loan.id) */
  entityId: string
  entityType: 'wallet' | 'loan'
}

export interface Loan {
  id: string
  user_id: string
  wallet_id: string | null
  contact_name: string
  contact_avatar: string | null
  amount: number
  currency: Currency
  paid_amount: number
  interest_rate: number
  type: LoanType
  status: LoanStatus
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CreateLoanInput = Omit<Loan, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface LoanPayment {
  id: string
  loan_id: string
  amount: number
  currency: Currency
  payment_date: string
  notes: string | null
  created_at: string
}

export type CreatePaymentInput = {
  loan_id: string
  amount: number
  currency: Currency
  payment_date: string
  notes?: string
}

export interface ExchangeRate {
  id: string
  user_id: string
  from_currency: string
  to_currency: string
  rate: number
  updated_at: string
}

export interface WalletTypeConfig {
  type: WalletType
  label: string
  icon: string
}

export const WALLET_TYPES: WalletTypeConfig[] = [
  { type: 'cash', label: 'Efectivo', icon: '💵' },
  { type: 'bank', label: 'Banco', icon: '🏦' },
  { type: 'card', label: 'Tarjeta', icon: '💳' },
  { type: 'cooperative', label: 'Cooperativa', icon: '🤝' },
  { type: 'binance', label: 'Binance', icon: '₿' },
  { type: 'wise', label: 'Wise', icon: '🌍' },
  { type: 'airtm', label: 'Airtm', icon: '💱' },
  { type: 'safe', label: 'Caja fuerte', icon: '🔒' },
  { type: 'crypto', label: 'Crypto', icon: '🪙' },
]

export const WALLET_COLORS = [
  '#6C63FF',
  '#00D4AA',
  '#FF4D4D',
  '#FFB347',
  '#4FACFE',
  '#F5C518',
  '#FF6B9D',
  '#845EC2',
]
