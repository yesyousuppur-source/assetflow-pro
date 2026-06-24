// src/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Auto generate unique employee code
async function generateEmpCode(role: string): Promise<string> {
  const prefix = role === 'driver' ? 'DRV' : role === 'admin' ? 'ADM' : 'EMP'

  const { data } = await supabase
    .from('users')
    .select('emp_code')
    .like('emp_code', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(1)

  let nextNum = 1
  if (data && data.length > 0) {
    const lastCode = data[0].emp_code as string
    const lastNum = parseInt(lastCode.replace(prefix, ''))
    if (!isNaN(lastNum)) nextNum = lastNum + 1
  }

  return `${prefix}${String(nextNum).padStart(3, '0')}`
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, department, designation, role, photo_url } = await req.json()

    // Validate
    if (!name || !phone || !department || !designation) {
      return NextResponse.json(
        { error: 'Saari details required hain' },
        { status: 400 }
      )
    }

    const fullPhone = `91${phone}`

    // Check if already registered
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', fullPhone)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Is number se already account ban chuka hai' },
        { status: 400 }
      )
    }

    // Generate unique emp code
    const emp_code = await generateEmpCode(role || 'employee')

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        phone: fullPhone,
        emp_code,
        department,
        designation,
        role: role || 'employee',
        photo_url: photo_url || null,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Registration failed. Try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        emp_code: newUser.emp_code,
        department: newUser.department,
        designation: newUser.designation,
        role: newUser.role
      }
    })

  } catch (error) {
    console.error('Register Error:', error)
    return NextResponse.json(
      { error: 'Server error. Try again.' },
      { status: 500 }
    )
  }
}
