import { createClient } from '@/lib/supabase/client'
import type { Wallet, CreateWalletInput } from '@/types/app.types'

export const walletsService = {
  async getAll(): Promise<Wallet[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Wallet> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(input: CreateWalletInput): Promise<Wallet> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('wallets')
      .insert({ ...input, user_id: user!.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, input: Partial<CreateWalletInput>): Promise<Wallet> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wallets')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async softDelete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('wallets')
      .update({ is_active: false })
      .eq('id', id)
    if (error) throw error
  },
}
