import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { FAB } from '@/components/layout/fab'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <main className="flex-1 max-w-[430px] w-full mx-auto content-area">
        {children}
      </main>
      <div className="max-w-[430px] w-full mx-auto">
        <BottomNav />
        <FAB />
      </div>
    </div>
  )
}
