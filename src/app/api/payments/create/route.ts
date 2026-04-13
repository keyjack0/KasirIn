import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const { transactionId, amount, invoiceCode } = await request.json()

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const authString = Buffer.from(`${serverKey}:`).toString('base64')

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: invoiceCode,
          gross_amount: amount,
        },
        credit_card: { secure: true },
      }),
    })

    const data = await response.json()

    if (!data.token) throw new Error('Gagal membuat token pembayaran')

    // Save payment record
    await supabaseAdmin.from('payments').insert({
      transaction_id: transactionId,
      method: 'midtrans',
      amount,
      status: 'pending',
      midtrans_order_id: invoiceCode,
      snap_token: data.token,
    })

    return NextResponse.json({ snap_token: data.token, redirect_url: data.redirect_url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
