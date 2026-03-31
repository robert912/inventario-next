import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Users, CheckCircle, Wrench } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalEquipos: number
    totalUsuarios: number
    equiposActivos: number
    equiposEnReparacion: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEquipos}</div>
          <p className="text-xs text-muted-foreground">
            Equipos registrados en el sistema
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
          <p className="text-xs text-muted-foreground">
            Usuarios registrados
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Equipos Activos</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.equiposActivos}</div>
          <p className="text-xs text-muted-foreground">
            En funcionamiento
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Reparacion</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.equiposEnReparacion}</div>
          <p className="text-xs text-muted-foreground">
            Requieren atencion
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
