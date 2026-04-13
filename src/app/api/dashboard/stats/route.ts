import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  const [
    { data: todayTx },
    { data: allProducts },
    { data: weekTx },
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('total_price')
      .gte('created_at', todayStr)
      .eq('status', 'paid'),
    supabase.from('products').select('id, stock, name'),
    supabase
      .from('transactions')
      .select('total_price, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'paid'),
  ])

  const todayRevenue = todayTx?.reduce((s: number, t: any) => s + t.total_price, 0) || 0
  const todayCount = todayTx?.length || 0
  const totalProducts = allProducts?.length || 0
  const lowStock = allProducts?.filter((p: any) => p.stock <= 5) || []
  const weekRevenue = weekTx?.reduce((s: number, t: any) => s + t.total_price, 0) || 0

  return NextResponse.json({
    todayRevenue,
    todayCount,
    totalProducts,
    lowStockCount: lowStock.length,
    lowStockProducts: lowStock,
    weekRevenue,
  })
}
