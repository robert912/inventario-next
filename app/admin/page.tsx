import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { UsersTable } from "@/components/admin/users-table"
import { StatsCards } from "@/components/admin/stats-cards"
import type { Profile, Equipo } from "@/lib/types"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: equipos } = await supabase
    .from("equipos")
    .select("*")

  const stats = {
    totalEquipos: equipos?.length || 0,
    totalUsuarios: users?.length || 0,
    equiposActivos: equipos?.filter((e: Equipo) => e.estado === "activo").length || 0,
    equiposEnReparacion: equipos?.filter((e: Equipo) => e.estado === "en_reparacion").length || 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile as Profile} />
      <main className="container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administracion</h1>
          <p className="text-muted-foreground">
            Gestiona usuarios y supervisa el inventario
          </p>
        </div>
        
        <StatsCards stats={stats} />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Gestion de Usuarios</h2>
          <UsersTable users={(users as Profile[]) || []} currentUserId={user.id} />
        </div>
      </main>
    </div>
  )
}
