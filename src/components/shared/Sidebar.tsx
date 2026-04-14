'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useState } from 'react'
import {
  RiShoppingBagLine,
  RiDashboardLine,
  RiShoppingCartLine,
  RiArchiveLine,
  RiAppsLine,
  RiFileTextLine,
  RiGroupLine,
  RiLogoutCircleLine,
  RiMenuLine,
  RiCloseLine,
} from 'react-icons/ri'

type UserRole = 'admin' | 'kasir'

interface NavItem {
  label: string
  href: string
  iconName: string
}

interface SidebarProps {
  role: UserRole
  userName: string
}

const iconMap: Record<string, React.ElementType> = {
  dashboard: RiDashboardLine,
  cart: RiShoppingCartLine,
  archive: RiArchiveLine,
  apps: RiAppsLine,
  file: RiFileTextLine,
  group: RiGroupLine,
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'dashboard' },
  { label: 'Transaksi', href: '/admin/transactions', iconName: 'file' },
  { label: 'Produk', href: '/admin/products', iconName: 'archive' },
  { label: 'Kategori', href: '/admin/categories', iconName: 'apps' },
  { label: 'Pengguna', href: '/admin/users', iconName: 'group' },
]

const kasirNav: NavItem[] = [
  { label: 'Kasir', href: '/kasir', iconName: 'cart' },
  { label: 'Riwayat', href: '/kasir/history', iconName: 'file' },
]

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const navItems = role === 'admin' ? adminNav : kasirNav

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Berhasil keluar')
    router.push('/login')
  }

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href
        const Icon = iconMap[item.iconName]
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-black'
            }`}
          >
            {Icon && <Icon className="text-base w-4 h-4" />}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const UserInfo = () => (
    <div className="p-3 border-t border-gray-100">
      <div className="flex items-center gap-3 px-3 py-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{userName}</p>
          <p className="text-xs text-gray-400 capitalize">{role}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition-all"
      >
        <RiLogoutCircleLine className="w-4 h-4" />
        Keluar
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <RiShoppingBagLine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base">KasirIn</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {mobileOpen
            ? <RiCloseLine className="w-5 h-5" />
            : <RiMenuLine className="w-5 h-5" />
          }
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-14 left-0 bottom-0 z-20 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavLinks />
        <UserInfo />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed left-0 top-0 bottom-0 z-20">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
              <RiShoppingBagLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none">KasirIn</span>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{role}</p>
            </div>
          </div>
        </div>
        <NavLinks />
        <UserInfo />
      </aside>
    </>
  )
}