"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const supabase = createClient()
      // Wait for session to be set by Supabase
      let tries = 0
      let session = null
      while (tries < 10) {
        const { data } = await supabase.auth.getSession()
        session = data.session
        if (session) break
        await new Promise((r) => setTimeout(r, 300))
        tries++
      }
      // If session is set, redirect to next param or dashboard
      const next = searchParams.get("next") || "/dashboard"
      if (session) {
        router.replace(next)
      } else {
        // fallback: force reload to try to get session
        window.location.href = next
      }
    }
    checkSessionAndRedirect()
  }, [router, searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p className="text-lg font-medium">Finishing sign in...</p>
    </div>
  )
}
