import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { EquiposTable } from "@/components/dashboard/equipos-table"
import { AddEquipoDialog } from "@/components/dashboard/add-equipo-dialog"
import type { Equipo, Profile } from "@/lib/types"

// TEMPORARY: Dev bypass mode - REMOVE IN PRODUCTION
const DEV_BYPASS = true

// Valid UUID for dev mode
const DEV_USER_ID = "00000000-0000-0000-0000-000000000000"

const devProfile: Profile = {
  id: DEV_USER_ID,
  email: "dev@example.com",
  full_name: "Usuario de Desarrollo",
  avatar_url: null,
  role: "admin",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Use dev profile if no user and DEV_BYPASS is enabled
  const isDevMode = DEV_BYPASS && !user
  
  if (!user && !DEV_BYPASS) {
    redirect("/")
  }

  let profile: Profile | null = null
  
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  } else if (isDevMode) {
    profile = devProfile
  }

  const { data: equipos } = await supabase
    .from("equipos")
    .select("*")
    .order("created_at", { ascending: false })

  const userId = user?.id || "dev-user-id"

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile as Profile} isDevMode={isDevMode} />
      <main className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventario de Equipos</h1>
            <p className="text-muted-foreground">
              Gestiona todos los equipos del departamento
            </p>
          </div>
          <AddEquipoDialog userId={userId} />
        </div>
        <EquiposTable 
          equipos={(equipos as Equipo[]) || []} 
          isAdmin={profile?.role === "admin"} 
        />
      </main>
    </div>
  )
}
