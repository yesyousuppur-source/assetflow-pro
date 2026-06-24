// src/app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone aur OTP dono required hain' },
        { status: 400 }
      )
    }

    const fullPhone = `91${phone}`

    // Get latest OTP
    const { data: otpData, error: otpError } = await supabase
      .from('otp_logs')
      .select('*')
      .eq('phone', fullPhone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: 'OTP nahi mila. Dubara bhejein.' },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date() > new Date(otpData.expires_at)) {
      return NextResponse.json(
        { error: 'OTP expire ho gaya. Dubara bhejein.' },
        { status: 400 }
      )
    }

    // Check match
    if (otpData.otp !== otp) {
      return NextResponse.json(
        { error: 'Galat OTP. Dobara try karein.' },
        { status: 400 }
      )
    }

    // Mark verified
    await supabase
      .from('otp_logs')
      .update({ verified: true })
      .eq('id', otpData.id)

    // Check user exists
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', fullPhone)
      .single()

    if (!user) {
      return NextResponse.json({
        success: true,
        isNewUser: true,
        phone: fullPhone,
        message: 'OTP verified. Please register.'
      })
    }

    return NextResponse.json({
      success: true,
      isNewUser: false,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        emp_code: user.emp_code,
        department: user.department,
        designation: user.designation,
        role: user.role,
        photo_url: user.photo_url
      }
    })

  } catch (error) {
    console.error('Verify OTP Error:', error)
    return NextResponse.json(
      { error: 'Server error. Try again.' },
      { status: 500 }
    )
  }
}
