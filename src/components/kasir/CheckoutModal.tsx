'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { generateInvoiceCode, formatRupiah } from '@/lib/utils'
import { PaymentMethod } from '@/types'
import toast from 'react-hot-toast'

// SVG Icons
function IconClose() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconLoader() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconPrint() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

const paymentMethods: { id: PaymentMethod; label: string; emoji: string }[] = [
  { id: 'cash', label: 'Tunai', emoji: '💵' },
  { id: 'qris', label: 'QRIS', emoji: '📱' },
  { id: 'transfer', label: 'Transfer', emoji: '🏦' },
  { id: 'ewallet', label: 'E-Wallet', emoji: '💳' },
]

interface CheckoutModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CheckoutModal({ onClose, onSuccess }: CheckoutModalProps) {
  const {
    items,
    paymentMethod,
    paidAmount,
    getTotalPrice,
    getChange,
    setPaymentMethod,
    setPaidAmount,
    clearCart,
  } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [invoiceCode, setInvoiceCode] = useState('')
  const supabase = createClient()
  const total = getTotalPrice()
  const change = getChange()

  const handleCashInput = (val: string) => {
    const num = parseInt(val.replace(/\D/g, '')) || 0
    setPaidAmount(num)
  }

  // Nominal cepat
  const quickAmounts = Array.from(
    new Set([
      total,
      Math.ceil(total / 10000) * 10000,
      Math.ceil(total / 50000) * 50000,
      Math.ceil(total / 100000) * 100000,
    ])
  ).slice(0, 4)

  const handleCheckout = async () => {
    if (paymentMethod === 'cash' && paidAmount < total) {
      toast.error('Uang yang dibayar kurang')
      return
    }
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Sesi habis, silakan login ulang')

      const invoice = generateInvoiceCode()
      setInvoiceCode(invoice)

      // Simpan transaksi
      const { data: tx, error: txErr } = await supabase
        .from('transactions')
        .insert({
          invoice_code: invoice,
          user_id: user.id,
          total_price: total,
          payment_method: paymentMethod,
          paid_amount: paymentMethod === 'cash' ? paidAmount : total,
          change_amount: paymentMethod === 'cash' ? change : 0,
          status: paymentMethod === 'cash' ? 'paid' : 'pending',
        })
        .select()
        .single()

      if (txErr) throw txErr

      // Simpan item transaksi
      const { error: itemsErr } = await supabase
        .from('transaction_items')
        .insert(
          items.map((item) => ({
            transaction_id: tx.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            subtotal: item.subtotal,
          }))
        )
      if (itemsErr) throw itemsErr

      // Kurangi stok
      for (const item of items) {
        await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id)
      }

      // Pembayaran digital via Midtrans
      if (paymentMethod !== 'cash') {
        const res = await window.fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: tx.id,
            amount: total,
            invoiceCode: invoice,
          }),
        })
        const { snap_token } = await res.json()
        if (snap_token && (window as any).snap) {
          ;(window as any).snap.pay(snap_token, {
            onSuccess: () => {
              setSuccess(true)
              clearCart()
              onSuccess()
            },
            onPending: () => toast('Menunggu konfirmasi pembayaran'),
            onError: () => toast.error('Pembayaran gagal'),
            onClose: () => {},
          })
          setLoading(false)
          return
        }
      }

      setSuccess(true)
      clearCart()
    } catch (err: any) {
      toast.error(err.message || 'Transaksi gagal')
    } finally {
      setLoading(false)
    }
  }

  // ── Tampilan Sukses ──
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <IconCheck />
          </div>
          <h2 className="text-xl font-bold mb-1">Transaksi Berhasil!</h2>
          <p className="text-gray-500 text-sm mb-1">
            Invoice:{' '}
            <span className="font-mono font-semibold text-black">
              {invoiceCode}
            </span>
          </p>
          <p className="text-2xl font-bold mt-4 mb-1">{formatRupiah(total)}</p>
          {paymentMethod === 'cash' && change > 0 && (
            <p className="text-sm text-gray-500">
              Kembalian:{' '}
              <span className="font-semibold text-black">
                {formatRupiah(change)}
              </span>
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <IconPrint /> Cetak Struk
            </button>
            <button onClick={onSuccess} className="btn-primary flex-1">
              Selesai
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form Checkout ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-base">Proses Pembayaran</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Ringkasan pesanan */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Ringkasan Pesanan
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">
                    {item.product.name}{' '}
                    <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Metode pembayaran */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Metode Pembayaran
            </p>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentMethod === method.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span>{method.emoji}</span>
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input uang tunai */}
          {paymentMethod === 'cash' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Uang Diterima
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={paidAmount > 0 ? paidAmount.toLocaleString('id-ID') : ''}
                onChange={(e) => handleCashInput(e.target.value)}
                className="input-field text-lg font-bold mb-3"
                placeholder="0"
              />
              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setPaidAmount(amount)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                      paidAmount === amount
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {formatRupiah(amount)}
                  </button>
                ))}
              </div>
              {paidAmount >= total && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl flex justify-between text-sm">
                  <span className="text-green-700">Kembalian</span>
                  <span className="font-bold text-green-700">
                    {formatRupiah(change)}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentMethod !== 'cash' && (
            <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 text-center">
              Klik <strong>Bayar</strong> untuk membuka halaman pembayaran
              digital via Midtrans
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 shrink-0">
          <button
            onClick={handleCheckout}
            disabled={
              loading || (paymentMethod === 'cash' && paidAmount < total)
            }
            className="btn-primary w-full h-12 text-base flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading && <IconLoader />}
            {loading ? 'Memproses...' : `Bayar ${formatRupiah(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}