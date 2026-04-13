export type UserRole = 'admin' | 'kasir'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  barcode?: string
  category_id: string
  created_at: string
  categories?: Category
}

export type TransactionStatus = 'pending' | 'paid' | 'cancelled'
export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'ewallet'

export interface Transaction {
  id: string
  invoice_code: string
  user_id: string
  total_price: number
  payment_method: PaymentMethod
  paid_amount: number
  change_amount: number
  status: TransactionStatus
  created_at: string
  users?: User
  transaction_items?: TransactionItem[]
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  price: number
  subtotal: number
  products?: Product
}

export interface Payment {
  id: string
  transaction_id: string
  method: PaymentMethod
  amount: number
  status: string
  midtrans_order_id?: string
  snap_token?: string
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export interface DashboardStats {
  todayRevenue: number
  todayTransactions: number
  totalProducts: number
  lowStockProducts: number
}
