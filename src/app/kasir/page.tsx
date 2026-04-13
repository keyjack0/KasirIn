'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { formatRupiah } from '@/lib/utils'
import CheckoutModal from '@/components/kasir/CheckoutModal'

// SVG Icons
function IconSearch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

function IconPlus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconMinus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconDelete() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function IconBox() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  )
}

function IconLoader() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getItemCount,
  } = useCartStore()

  const supabase = createClient()

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase
        .from('products')
        .select('*, categories(name)')
        .gt('stock', 0)
        .order('name'),
      supabase.from('categories').select('*').order('name'),
    ])
    setProducts(prods || [])
    setCategories(cats || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search)
    const matchCat = selectedCat ? p.category_id === selectedCat : true
    return matchSearch && matchCat
  })

  const getCartItem = (productId: string) =>
    items.find((i) => i.product.id === productId)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Kiri: Daftar Produk ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 bg-white border-b border-gray-100 space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Cari produk atau scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {/* Kategori tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setSelectedCat('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                !selectedCat
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCat(selectedCat === cat.id ? '' : cat.id)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCat === cat.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Produk */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <IconLoader />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-300 mb-3">
                <IconBox />
              </div>
              <p className="text-gray-500 font-medium">Tidak ada produk</p>
              <p className="text-gray-400 text-sm">
                Coba ubah pencarian atau filter kategori
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((product) => {
                const inCart = getCartItem(product.id)
                return (
                  <div
                    key={product.id}
                    onClick={() => addItem(product)}
                    className={`card p-3 cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${
                      inCart ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <div className="w-full aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                      <IconBox />
                    </div>
                    <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold">
                      {formatRupiah(product.price)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Stok: {product.stock}
                    </p>
                    {inCart && (
                      <div className="mt-2 bg-black text-white text-xs rounded-md px-2 py-1 text-center font-medium">
                        {inCart.quantity} di keranjang
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Kanan: Keranjang ── */}
      <div className="w-80 xl:w-96 bg-white border-l border-gray-100 flex flex-col shrink-0">
        {/* Header keranjang */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <IconCart />
              Keranjang
            </h2>
            {getItemCount() > 0 && (
              <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getItemCount()}
              </span>
            )}
          </div>
        </div>

        {/* Item keranjang */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="text-gray-200 mb-3">
                <IconCart />
              </div>
              <p className="text-gray-400 text-sm">Keranjang kosong</p>
              <p className="text-gray-300 text-xs mt-1">
                Pilih produk untuk memulai transaksi
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRupiah(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <IconMinus />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"
                    >
                      <IconPlus />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors ml-1"
                    >
                      <IconDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer keranjang */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-xl font-bold">
              {formatRupiah(getTotalPrice())}
            </span>
          </div>
          <button
            onClick={() => setCheckoutOpen(true)}
            disabled={items.length === 0}
            className="btn-primary w-full h-12 text-base disabled:opacity-40"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            setCheckoutOpen(false)
            loadProducts()
          }}
        />
      )}
    </div>
  )
}