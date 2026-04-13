import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (hash !== signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const isPaid = transaction_status === 'capture' || transaction_status === 'settlement'
    const isFraud = fraud_status === 'deny'

    if (isPaid && !isFraud) {
      // Update transaction status
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'paid' })
        .eq('invoice_code', order_id)

      // Update payment status
      await supabaseAdmin
        .from('payments')
        .update({ status: 'paid' })
        .eq('midtrans_order_id', order_id)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
