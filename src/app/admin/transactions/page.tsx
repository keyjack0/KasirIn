'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'
import { RiLoaderLine, RiFileListLine, RiSearchLine } from 'react-icons/ri'

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*, users(name)')
      .order('created_at', { ascending: false })
      .limit(100)
    setTransactions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = transactions.filter((t) => {
    const matchSearch = t.invoice_code.toLowerCase().includes(search.toLowerCase()) ||
      (t.users as any)?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter ? t.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const totalRevenue = filtered.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.total_price, 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transaksi</h1>
        <p className="text-gray-500 text-sm mt-0.5">Total pendapatan: {formatRupiah(totalRevenue)}</p>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari invoice atau kasir..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40">
          <option value="">Semua Status</option>
          <option value="paid">Lunas</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Invoice</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Kasir</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Total</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Metode</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <RiLoaderLine className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <RiFileListLine className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">Tidak ada transaksi ditemukan</p>
                </td></tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium">{tx.invoice_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{(tx.users as any)?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatRupiah(tx.total_price)}</td>
                    <td className="px-4 py-3"><span className="badge-neutral capitalize text-xs">{tx.payment_method}</span></td>
                    <td className="px-4 py-3">
                      <span className={tx.status === 'paid' ? 'badge-success' : 'badge-warning'}>
                        {tx.status === 'paid' ? 'Lunas' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.created_at)}</td>
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
