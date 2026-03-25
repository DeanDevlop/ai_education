'use client'
import { useEffect } from 'react'

export default function Tracker() {
  useEffect(() => {
    // Fungsi ini akan berjalan 1x saat user masuk ke dashboard
    const syncUser = async () => {
      try {
        await fetch('/api/user/sync', { 
          method: 'POST',
          // Next.js secara otomatis mengirimkan cookie auth
        })
      } catch (error) {
        console.error("Failed to sync user activity:", error)
      }
    }

    syncUser()
  }, [])

  return null // Komponen ini tidak perlu menampilkan apa-apa di UI
}
