// src/app/api/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    // Validate
    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit mobile number required' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const fullPhone = `91${phone}`
    // TEST MODE - console mein OTP dikhega
console.log(`TEST OTP for ${phone}: ${otp}`)

    // Delete old OTPs for this phone
    await supabase
      .from('otp_logs')
      .delete()
      .eq('phone', fullPhone)

    // Save new OTP to DB
    const { error: dbError } = await supabase
      .from('otp_logs')
      .insert({
        phone: fullPhone,
        otp,
        expires_at: expiresAt,
        verified: false
      })

    if (dbError) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Send via MSG91
    const msg91Url = `https://control.msg91.com/api/v5/otp`
    const response = await fetch(msg91Url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': process.env.MSG91_AUTH_KEY!
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: fullPhone,
        authkey: process.env.MSG91_AUTH_KEY,
        otp: otp,
        sender: process.env.MSG91_SENDER_ID || 'ASSETF'
      })
    })

    const msg91Data = await response.json()

    if (msg91Data.type === 'error') {
      return NextResponse.json(
        { error: 'SMS sending failed. Try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to +91 ${phone}`
    })

  } catch (error) {
    console.error('Send OTP Error:', error)
    return NextResponse.json(
      { error: 'Server error. Try again.' },
      { status: 500 }
    )
  }
}
