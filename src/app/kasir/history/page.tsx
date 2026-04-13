'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'
import { RiLoaderLine, RiFileListLine } from 'react-icons/ri'

export default function KasirHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('transactions')
      .select('*, transaction_items(*, products(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setTransactions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        <p className="text-gray-500 text-sm mt-0.5">Transaksi yang Anda buat</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <RiLoaderLine className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16">
          <RiFileListLine className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm font-semibold">{tx.invoice_code}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base">{formatRupiah(tx.total_price)}</p>
                  <span className={`text-xs ${tx.status === 'paid' ? 'badge-success' : 'badge-warning'} mt-1`}>
                    {tx.status === 'paid' ? 'Lunas' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1">
                {(tx.transaction_items as any[])?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-600">
                    <span>{item.products?.name} x{item.quantity}</span>
                    <span>{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                <span className="badge-neutral capitalize text-xs">{tx.payment_method}</span>
                {tx.payment_method === 'cash' && tx.change_amount > 0 && (
                  <span className="text-xs text-gray-500">Kembalian: {formatRupiah(tx.change_amount)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
