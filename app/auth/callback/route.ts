import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email?.endsWith("@usach.cl")) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${siteUrl}/auth/error`)
      }

      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth/error`)
}
