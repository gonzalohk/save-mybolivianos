-- Agrega la columna para el umbral de alerta de saldo bajo por cuenta.
-- NULL significa que la alerta está desactivada para esa cuenta.
ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS low_balance_threshold NUMERIC(15, 2) DEFAULT NULL;
