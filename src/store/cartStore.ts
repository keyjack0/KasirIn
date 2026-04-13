import { create } from 'zustand'
import { CartItem, Product, PaymentMethod } from '@/types'

interface CartStore {
  items: CartItem[]
  paymentMethod: PaymentMethod
  paidAmount: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setPaymentMethod: (method: PaymentMethod) => void
  setPaidAmount: (amount: number) => void
  getTotalPrice: () => number
  getChange: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  paymentMethod: 'cash',
  paidAmount: 0,

  addItem: (product: Product) => {
    const { items } = get()
    const existing = items.find(item => item.product.id === product.id)

    if (existing) {
      if (existing.quantity >= product.stock) return
      set({
        items: items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.product.price }
            : item
        ),
      })
    } else {
      set({
        items: [...items, { product, quantity: 1, subtotal: product.price }],
      })
    }
  },

  removeItem: (productId: string) => {
    set({ items: get().items.filter(item => item.product.id !== productId) })
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map(item =>
        item.product.id === productId
          ? { ...item, quantity, subtotal: quantity * item.product.price }
          : item
      ),
    })
  },

  clearCart: () => set({ items: [], paidAmount: 0, paymentMethod: 'cash' }),

  setPaymentMethod: (method: PaymentMethod) => set({ paymentMethod: method }),

  setPaidAmount: (amount: number) => set({ paidAmount: amount }),

  getTotalPrice: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),

  getChange: () => {
    const total = get().getTotalPrice()
    const paid = get().paidAmount
    return Math.max(0, paid - total)
  },

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}))
