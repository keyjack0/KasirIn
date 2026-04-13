'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'

export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .order('name')

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }, [categoryId])

  useEffect(() => { fetch() }, [fetch])

  return { products, loading, refetch: fetch }
}
