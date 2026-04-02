"use client"

import { useState, useMemo, useEffect } from "react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Search, 
  FileSpreadsheet, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { EditEquipoDialog } from "./edit-equipo-dialog"
import { DeleteEquipoDialog } from "./delete-equipo-dialog"
import type { Equipo } from "@/lib/types"

// Librerías para Excel (Asegúrate de instalarlas: npm install exceljs file-saver)
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

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

export function EquiposTable({ equipos, isAdmin }: EquiposTableProps) {
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [ubicacionFilter, setUbicacionFilter] = useState<string>("todas")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null)
  const [deletingEquipo, setDeletingEquipo] = useState<Equipo | null>(null)

  const currentYear = new Date().getFullYear()

  useEffect(() => { setCurrentPage(1) }, [search, estadoFilter, ubicacionFilter])

  const getAlertaAntiguedad = (anio: number, estado: string) => {
    if (estado !== "activo") return null
    const antiguedad = currentYear - anio
    if (antiguedad >= 9) return { icon: <ShieldAlert className="h-3 w-3" />, label: `${antiguedad} años`, tooltip: "Crítico", color: "text-red-700 bg-red-50 border-red-200" }
    if (antiguedad >= 7) return { icon: <AlertTriangle className="h-3 w-3" />, label: `${antiguedad} años`, tooltip: "Advertencia", color: "text-orange-700 bg-orange-50 border-orange-200" }
    if (antiguedad >= 5) return { icon: <Info className="h-3 w-3" />, label: `${antiguedad} años`, tooltip: "Revisión", color: "text-yellow-700 bg-yellow-50 border-yellow-200" }
    return null
  }

  const filteredEquipos = useMemo(() => {
    return equipos.filter((equipo) => {
      const matchesSearch = search === "" ||
        [equipo.nombre, equipo.marca, equipo.numero_serie, equipo.responsable, equipo.numero_inventario]
        .some(v => v.toLowerCase().includes(search.toLowerCase()))
      const matchesEstado = estadoFilter === "todos" || equipo.estado === estadoFilter
      const matchesUbicacion = ubicacionFilter === "todas" || equipo.ubicacion === ubicacionFilter
      return matchesSearch && matchesEstado && matchesUbicacion
    })
  }, [equipos, search, estadoFilter, ubicacionFilter])

  const totalPages = Math.ceil(filteredEquipos.length / itemsPerPage)
  const paginatedEquipos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEquipos.slice(start, start + itemsPerPage)
  }, [filteredEquipos, currentPage, itemsPerPage])

  // --- FUNCIÓN PARA DESCARGAR EXCEL CON DISEÑO ---
  async function downloadExcel() {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Inventario de Equipos')

    // 1. Definir Columnas y Anchos
    worksheet.columns = [
      { header: 'NOMBRE', key: 'nombre', width: 25 },
      { header: 'MARCA', key: 'marca', width: 15 },
      { header: 'Nº SERIE', key: 'serie', width: 20 },
      { header: 'UBICACIÓN', key: 'ubicacion', width: 20 },
      { header: 'ESTADO', key: 'estado', width: 15 },
      { header: 'RESPONSABLE', key: 'responsable', width: 20 },
      { header: 'ADQUISICIÓN', key: 'forma_adquisicion', width: 18 },
      { header: 'Nº INVENTARIO', key: 'inventario', width: 20 },
      { header: 'AÑO ADQ.', key: 'anio', width: 12 },
      { header: 'ANTIGÜEDAD', key: 'antiguedad', width: 15 },
    ]

    // 2. Estilo al Encabezado (Fila 1)
    const headerRow = worksheet.getRow(1)
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } } // Color Gris Oscuro
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    // 3. Agregar Datos
    filteredEquipos.forEach(e => {
      const antiguedad = currentYear - e.anio
      const row = worksheet.addRow({
        nombre: e.nombre,
        marca: e.marca,
        serie: e.numero_serie,
        ubicacion: e.ubicacion,
        estado: estadoLabels[e.estado],
        responsable: e.responsable,
        forma_adquisicion: e.forma_adquisicion,
        inventario: e.numero_inventario,
        anio: e.anio,
        antiguedad: `${antiguedad} años`
      })

      // 4. Formato Condicional en el Excel (Color según antigüedad)
      const antiguedadCell = row.getCell('antiguedad')
      if (antiguedad >= 9) {
        antiguedadCell.font = { color: { argb: 'FFFF0000' }, bold: true } // Rojo
      } else if (antiguedad >= 5) {
        antiguedadCell.font = { color: { argb: 'FFFF8C00' }, bold: true } // Naranja
      }
    })

    // 5. Generar archivo y descargar
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `Inventario_Equipos_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">{filteredEquipos.length} equipos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Vida útil en riesgo: <span className="text-orange-600 font-bold">{equipos.filter(e => e.estado === "activo" && (currentYear - e.anio) >= 5).length} activos</span>
              </p>
            </div>
            <Button onClick={downloadExcel} variant="outline" className="gap-2 border-green-600 text-green-700 hover:bg-green-50">
              <FileSpreadsheet className="h-4 w-4" /> Exportar a Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.keys(estadoLabels).map(k => <SelectItem key={k} value={k}>{estadoLabels[k]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla Visual */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="hidden md:table-cell">No. Serie</TableHead>
                  <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Responsable</TableHead>
                  <TableHead className="hidden md:table-cell">Inventario</TableHead>
                  <TableHead>Año Adq.</TableHead>
                  {isAdmin && <TableHead className="w-[100px]">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEquipos.map((equipo) => {
                  const alerta = getAlertaAntiguedad(equipo.anio, equipo.estado)
                  return (
                    <TableRow key={equipo.id}>
                      <TableCell className="font-medium">{equipo.nombre}</TableCell>
                      <TableCell>{equipo.marca}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">{equipo.numero_serie}</TableCell>
                      <TableCell className="hidden lg:table-cell">{equipo.ubicacion}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={estadoColors[equipo.estado]}>{estadoLabels[equipo.estado]}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{equipo.responsable}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">{equipo.numero_inventario}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-medium">{equipo.anio}</span>
                          {alerta && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className={`${alerta.color} text-[10px] px-1.5 py-0 cursor-help`}>{alerta.icon} {alerta.label}</Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p className="text-xs">{alerta.tooltip}</p></TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setEditingEquipo(equipo)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingEquipo(equipo)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between px-2 py-4 border-t">
            <div className="text-sm text-muted-foreground">Página {currentPage} de {totalPages || 1}</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}><ChevronsRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>

        {editingEquipo && <EditEquipoDialog equipo={editingEquipo} open={!!editingEquipo} onOpenChange={(o) => !o && setEditingEquipo(null)} />}
        {deletingEquipo && <DeleteEquipoDialog equipo={deletingEquipo} open={!!deletingEquipo} onOpenChange={(o) => !o && setDeletingEquipo(null)} />}
      </Card>
    </TooltipProvider>
  )
}