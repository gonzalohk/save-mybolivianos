-- Agrega la columna para excluir cuentas del cálculo de patrimonio total.
-- Por defecto FALSE → todas las cuentas existentes se incluyen en el patrimonio.
ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS exclude_from_total BOOLEAN NOT NULL DEFAULT FALSE;
