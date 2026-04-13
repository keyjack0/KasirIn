'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, formatDate } from '@/lib/utils'

interface Transaction {
  id: string
  invoice_code: string
  total_price: number
  payment_method: string
  status: string
  created_at: string
  users: { name: string } | null
}

interface Stats {
  todayRevenue: number
  todayCount: number
  totalProducts: number
  lowStock: number
}

// Icon SVG langsung — tidak pakai react-icons sama sekali
function IconMoney() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15" />
    </svg>
  )
}

function IconCart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function IconBox() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    todayRevenue: 0,
    todayCount: 0,
    totalProducts: 0,
    lowStock: 0,
  })
  const [recentTx, setRecentTx] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [
        { data: todayTx },
        { data: allProducts },
        { data: recent },
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('total_price')
          .gte('created_at', today.toISOString())
          .eq('status', 'paid'),
        supabase
          .from('products')
          .select('id, stock'),
        supabase
          .from('transactions')
          .select('id, invoice_code, total_price, payment_method, status, created_at, users(name)')
          .order('created_at', { ascending: false })
          .limit(8),
      ])

      setStats({
        todayRevenue: todayTx?.reduce((s, t) => s + t.total_price, 0) || 0,
        todayCount: todayTx?.length || 0,
        totalProducts: allProducts?.length || 0,
        lowStock: allProducts?.filter((p) => p.stock <= 5).length || 0,
      })

      setRecentTx((recent as any) || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const statCards = [
    {
      label: 'Pendapatan Hari Ini',
      value: formatRupiah(stats.todayRevenue),
      icon: <IconMoney />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Transaksi Hari Ini',
      value: stats.todayCount.toString(),
      icon: <IconCart />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Produk',
      value: stats.totalProducts.toString(),
      icon: <IconBox />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Stok Menipis',
      value: stats.lowStock.toString(),
      icon: <IconAlert />,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Ringkasan aktivitas bisnis hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-24 bg-gray-100 animate-pulse rounded-md" />
            ) : (
              <p className="text-xl font-bold">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold">Transaksi Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Invoice', 'Kasir', 'Total', 'Metode', 'Status', 'Waktu'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-gray-500 px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentTx.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                recentTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium">
                      {tx.invoice_code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tx.users?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {formatRupiah(tx.total_price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-neutral capitalize text-xs">
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={tx.status === 'paid' ? 'badge-success' : 'badge-warning'}>
                        {tx.status === 'paid' ? 'Lunas' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}