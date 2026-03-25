import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Di Next.js terbaru, cookies() harus di-await
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ini sering terjadi jika di-set dari Server Component, 
              // Middleware akan menangani sinkronisasinya
            }
          },
        },
      }
    )

    // Tukar kode menjadi session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Jika ada error dari Supabase (misal kode kadaluwarsa)
    console.error("Supabase Auth Error:", error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`)
  }

  // Jika tidak ada kode di URL
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}