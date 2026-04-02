"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import { Search, Download, Pencil, Trash2, AlertTriangle, ShieldAlert, Info} from "lucide-react"
import { EditEquipoDialog } from "./edit-equipo-dialog"
import { DeleteEquipoDialog } from "./delete-equipo-dialog"
import type { Equipo } from "@/lib/types"

interface EquiposTableProps {
  equipos: Equipo[]
  isAdmin: boolean
}

const estadoColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  en_reparacion: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  dado_de_baja: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  en_prestamo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
}

const estadoLabels: Record<string, string> = {
  activo: "Activo",
  en_reparacion: "En reparacion",
  dado_de_baja: "Dado de baja",
  en_prestamo: "En prestamo",
}

const formaAdquisicionLabels: Record<string, string> = {
  compra: "Compra",
  donacion: "Donacion",
  prestamo: "Prestamo",
  comodato: "Comodato",
  otro: "Otro",
}

export function EquiposTable({ equipos, isAdmin }: EquiposTableProps) {
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [ubicacionFilter, setUbicacionFilter] = useState<string>("todas")
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null)
  const [deletingEquipo, setDeletingEquipo] = useState<Equipo | null>(null)

  const currentYear = new Date().getFullYear()

  // Lógica de Alertas por Antigüedad (SOLO SI ESTÁ ACTIVO)
  const getAlertaAntiguedad = (anio: number, estado: string) => {
    if (estado !== "activo") return null; // No mostrar alerta si no está activo

    const antiguedad = currentYear - anio
    if (antiguedad >= 9) return { nivel: 'critico',icon: <ShieldAlert className="h-3 w-3" />,label: `${antiguedad} años`, tooltip: "Equipo en estado crítico. Reemplazo urgente recomendado.", color: "text-red-700 bg-red-50 border-red-200" }
    if (antiguedad >= 7) return { nivel: 'advertencia', icon: <AlertTriangle className="h-3 w-3" />, label: `${antiguedad} años`, tooltip: "Equipo con alto riesgo de fallas. Planificar reemplazo.", color: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border text-orange-700 bg-orange-50 border-orange-200" }
    if (antiguedad >= 5) return { nivel: 'aviso', icon: <Info className="h-3 w-3" />, label: `${antiguedad} años`, tooltip: "Equipo cercano al fin de vida útil. Revisión recomendada.", color: "text-yellow-700 bg-yellow-50 border-yellow-200" }
    return null
  }

  // Contador: Solo cuenta equipos activos con 5+ años
  const vidaUtilRiesgoCount = equipos.filter(
    e => e.estado === "activo" && (currentYear - e.anio) >= 5
  ).length

  const ubicaciones = useMemo(() => {
    const unique = [...new Set(equipos.map((e) => e.ubicacion))]
    return unique.sort()
  }, [equipos])

  const filteredEquipos = useMemo(() => {
    return equipos.filter((equipo) => {
      const matchesSearch =
        search === "" ||
        equipo.nombre.toLowerCase().includes(search.toLowerCase()) ||
        equipo.marca.toLowerCase().includes(search.toLowerCase()) ||
        equipo.numero_serie.toLowerCase().includes(search.toLowerCase()) ||
        equipo.responsable.toLowerCase().includes(search.toLowerCase()) ||
        equipo.numero_inventario.toLowerCase().includes(search.toLowerCase())

      const matchesEstado = estadoFilter === "todos" || equipo.estado === estadoFilter
      const matchesUbicacion = ubicacionFilter === "todas" || equipo.ubicacion === ubicacionFilter

      return matchesSearch && matchesEstado && matchesUbicacion
    })
  }, [equipos, search, estadoFilter, ubicacionFilter])

  function downloadCSV() {
    const headers = [
      "Nombre",
      "Marca",
      "Numero de Serie",
      "Ubicacion",
      "Estado",
      "Forma de Adquisicion",
      "Responsable",
      "Numero de Inventario",
      "Año de Adquisicion",
      "Antiguedad (años)",
    ]

    const rows = filteredEquipos.map((e) => [
      e.nombre,
      e.marca,
      e.numero_serie,
      e.ubicacion,
      estadoLabels[e.estado],
      formaAdquisicionLabels[e.forma_adquisicion],
      e.responsable,
      e.numero_inventario,
      e.anio.toString(),
      (currentYear - e.anio).toString(),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `inventario_equipos_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">
              {filteredEquipos.length} equipo{filteredEquipos.length !== 1 ? "s" : ""} encontrado{filteredEquipos.length !== 1 ? "s" : ""}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              Vida útil en riesgo: <span className="text-orange-600 dark:text-orange-400">{vidaUtilRiesgoCount} equipos activos (5+ años)</span>
            </p>
          </div>
          <Button onClick={downloadCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, marca, serie, responsable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="en_reparacion">En reparacion</SelectItem>
              <SelectItem value="dado_de_baja">Dado de baja</SelectItem>
              <SelectItem value="en_prestamo">En prestamo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ubicacionFilter} onValueChange={setUbicacionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ubicacion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las ubicaciones</SelectItem>
              {ubicaciones.map((ubicacion) => (
                <SelectItem key={ubicacion} value={ubicacion}>
                  {ubicacion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="hidden md:table-cell">No. Serie</TableHead>
                <TableHead className="hidden lg:table-cell">Ubicacion</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Responsable</TableHead>
                <TableHead className="hidden md:table-cell">No. Inventario</TableHead>
                <TableHead>Año Adq.</TableHead>
                {isAdmin && <TableHead className="w-[100px]">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 9 : 8} className="h-24 text-center">
                    No se encontraron equipos
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipos.map((equipo) => {
                  const alerta = getAlertaAntiguedad(equipo.anio, equipo.estado);
                  return (
                    <TableRow key={equipo.id}>
                      <TableCell className="font-medium">{equipo.nombre}</TableCell>
                      <TableCell>{equipo.marca}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">
                        {equipo.numero_serie}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{equipo.ubicacion}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={estadoColors[equipo.estado]}>
                          {estadoLabels[equipo.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{equipo.responsable}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">
                        {equipo.numero_inventario}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-medium">{equipo.anio}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {alerta && (
                                <Badge className={`${alerta.color} text-[10px] px-1.5 py-0`}>
                                  {alerta.icon}{alerta.label}
                                </Badge>
                              )}
                            </TooltipTrigger>
                            {alerta && (
                              <TooltipContent side="top">
                                <span className="text-xs font-medium">
                                  {alerta.tooltip}
                                </span>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingEquipo(equipo)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingEquipo(equipo)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {editingEquipo && (
        <EditEquipoDialog
          equipo={editingEquipo}
          open={!!editingEquipo}
          onOpenChange={(open) => !open && setEditingEquipo(null)}
        />
      )}

      {deletingEquipo && (
        <DeleteEquipoDialog
          equipo={deletingEquipo}
          open={!!deletingEquipo}
          onOpenChange={(open) => !open && setDeletingEquipo(null)}
        />
      )}
    </Card>
  )
}