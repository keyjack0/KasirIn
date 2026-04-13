// import { redirect } from 'next/navigation'
// import { createClient } from '@/lib/supabase/server'
// import Sidebar from '@/components/shared/Sidebar'

// export default async function AdminLayout({ children }: { children: React.ReactNode }) {
//   const supabase = createClient()
//   const { data: { user } } = await supabase.auth.getUser()

//   if (!user) redirect('/login')

//   const { data: profile } = await supabase
//     .from('users')
//     .select('name, role')
//     .eq('id', user.id)
//     .single()

//   if (profile?.role !== 'admin') redirect('/kasir')

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar role="admin" userName={profile?.name || user.email || 'Admin'} />
//       <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
//         <div className="p-4 lg:p-6 animate-fade-in">
//           {children}
//         </div>
//       </main>
//     </div>
//   )
// }

// untuk memastikan layout bisa diakses tanpa harus menunggu data user (yang mungkin menyebabkan flash of unauthenticated content)
// import Sidebar from '@/components/shared/Sidebar'

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar role="admin" userName="Admin" />
//       <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
//         <div className="p-4 lg:p-6 animate-fade-in">{children}</div>
//       </main>
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/shared/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userName, setUserName] = useState('Admin')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.replace('/kasir')
        return
      }

      setUserName(profile.name || 'Admin')
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="admin" userName={userName} />
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  )
}