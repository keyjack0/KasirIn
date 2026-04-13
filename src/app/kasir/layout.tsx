'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/shared/Sidebar'

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userName, setUserName] = useState('Kasir')
  const [role, setRole] = useState<'admin' | 'kasir'>('kasir')
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', user.id)
        .single()

      if (!profile) {
        router.replace('/login')
        return
      }

      setUserName(profile.name || 'Kasir')
      setRole(profile.role as 'admin' | 'kasir')
      setReady(true)
    }

    getUser()
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 animate-spin text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="text-sm text-gray-400">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} />
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  )
}