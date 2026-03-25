import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            )
          } catch {
            // Aman untuk diabaikan di route handler
          }
        },
      },
    }
  )

  // 1. Sign out dari Supabase
  await supabase.auth.signOut()

  // 2. Redirect ke login dengan instruksi menghapus cache
  const url = new URL('/login', request.url)
  const response = NextResponse.redirect(url, { status: 302 })
  
  // Opsional: Paksa hapus cookie secara manual jika middleware gagal
  // response.cookies.delete('sb-rcf...-auth-token') 

  return response
}