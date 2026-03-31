"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import type { EquipoInsert } from "@/lib/types"

interface AddEquipoDialogProps {
  userId: string
}

export function AddEquipoDialog({ userId }: AddEquipoDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const equipo: EquipoInsert = {
      nombre: formData.get("nombre") as string,
      marca: formData.get("marca") as string,
      numero_serie: formData.get("numero_serie") as string,
      ubicacion: formData.get("ubicacion") as string,
      estado: formData.get("estado") as EquipoInsert["estado"],
      forma_adquisicion: formData.get("forma_adquisicion") as EquipoInsert["forma_adquisicion"],
      responsable: formData.get("responsable") as string,
      numero_inventario: formData.get("numero_inventario") as string,
      anio: parseInt(formData.get("anio") as string),
      created_by: userId,
    }

    const supabase = createClient()
    const { error: insertError } = await supabase.from("equipos").insert(equipo)

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Equipo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Equipo</DialogTitle>
          <DialogDescription>
            Completa la informacion del equipo para agregarlo al inventario.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Equipo</Label>
              <Input id="nombre" name="nombre" placeholder="Ej: Laptop Dell" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input id="marca" name="marca" placeholder="Ej: Dell, HP, Lenovo" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_serie">Numero de Serie</Label>
              <Input id="numero_serie" name="numero_serie" placeholder="Ej: SN123456789" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_inventario">Numero de Inventario</Label>
              <Input id="numero_inventario" name="numero_inventario" placeholder="Ej: INV-2024-001" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicacion</Label>
              <Input id="ubicacion" name="ubicacion" placeholder="Ej: Oficina 201, Laboratorio A" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input id="responsable" name="responsable" placeholder="Nombre del responsable" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select name="estado" defaultValue="activo" required>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="en_reparacion">En reparacion</SelectItem>
                  <SelectItem value="dado_de_baja">Dado de baja</SelectItem>
                  <SelectItem value="en_prestamo">En prestamo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="forma_adquisicion">Forma de Adquisicion</Label>
              <Select name="forma_adquisicion" defaultValue="compra" required>
                <SelectTrigger id="forma_adquisicion">
                  <SelectValue placeholder="Selecciona la forma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="donacion">Donacion</SelectItem>
                  <SelectItem value="prestamo">Prestamo</SelectItem>
                  <SelectItem value="comodato">Comodato</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="anio">Ano de Adquisicion</Label>
              <Input
                id="anio"
                name="anio"
                type="number"
                min="1900"
                max="2100"
                defaultValue={new Date().getFullYear()}
                required
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agregar Equipo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
