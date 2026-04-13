import { Transaction } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'

interface ReceiptProps {
  transaction: Transaction
}

export default function Receipt({ transaction }: ReceiptProps) {
  return (
    <div className="hidden print:block font-mono text-xs w-72 mx-auto p-4">
      <div className="text-center mb-4">
        <h1 className="text-base font-bold">KasirIn</h1>
        <p>Struk Pembayaran</p>
        <p className="mt-1 text-gray-500">{formatDate(transaction.created_at)}</p>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="space-y-0.5 mb-2">
        <div className="flex justify-between">
          <span>Invoice</span>
          <span className="font-bold">{transaction.invoice_code}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir</span>
          <span>{(transaction.users as any)?.name || '-'}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="space-y-0.5 mb-2">
        {(transaction.transaction_items as any[])?.map((item: any) => (
          <div key={item.id}>
            <div className="flex justify-between">
              <span className="flex-1">{item.products?.name}</span>
              <span>{formatRupiah(item.subtotal)}</span>
            </div>
            <div className="text-gray-500 pl-2">
              {item.quantity} x {formatRupiah(item.price)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatRupiah(transaction.total_price)}</span>
        </div>
        <div className="flex justify-between">
          <span>Metode</span>
          <span className="capitalize">{transaction.payment_method}</span>
        </div>
        {transaction.payment_method === 'cash' && (
          <>
            <div className="flex justify-between">
              <span>Bayar</span>
              <span>{formatRupiah(transaction.paid_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kembali</span>
              <span>{formatRupiah(transaction.change_amount)}</span>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-3" />

      <div className="text-center text-gray-500">
        <p>Terima kasih telah berbelanja!</p>
        <p>Powered by KasirIn</p>
      </div>
    </div>
  )
}
