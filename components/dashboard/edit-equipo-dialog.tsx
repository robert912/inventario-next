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
import { Loader2 } from "lucide-react"
import type { Equipo, EquipoUpdate } from "@/lib/types"

interface EditEquipoDialogProps {
  equipo: Equipo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEquipoDialog({ equipo, open, onOpenChange }: EditEquipoDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const updates: EquipoUpdate = {
      nombre: formData.get("nombre") as string,
      marca: formData.get("marca") as string,
      numero_serie: formData.get("numero_serie") as string,
      ubicacion: formData.get("ubicacion") as string,
      estado: formData.get("estado") as Equipo["estado"],
      forma_adquisicion: formData.get("forma_adquisicion") as Equipo["forma_adquisicion"],
      responsable: formData.get("responsable") as string,
      numero_inventario: formData.get("numero_inventario") as string,
      anio: parseInt(formData.get("anio") as string),
    }

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("equipos")
      .update(updates)
      .eq("id", equipo.id)

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Equipo</DialogTitle>
          <DialogDescription>
            Modifica la informacion del equipo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre del Equipo</Label>
              <Input 
                id="edit-nombre" 
                name="nombre" 
                defaultValue={equipo.nombre}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-marca">Marca</Label>
              <Input 
                id="edit-marca" 
                name="marca" 
                defaultValue={equipo.marca}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-numero_serie">Numero de Serie</Label>
              <Input 
                id="edit-numero_serie" 
                name="numero_serie" 
                defaultValue={equipo.numero_serie}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-numero_inventario">Numero de Inventario</Label>
              <Input 
                id="edit-numero_inventario" 
                name="numero_inventario" 
                defaultValue={equipo.numero_inventario}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ubicacion">Ubicacion</Label>
              <Input 
                id="edit-ubicacion" 
                name="ubicacion" 
                defaultValue={equipo.ubicacion}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-responsable">Responsable</Label>
              <Input 
                id="edit-responsable" 
                name="responsable" 
                defaultValue={equipo.responsable}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <Select name="estado" defaultValue={equipo.estado} required>
                <SelectTrigger id="edit-estado">
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
              <Label htmlFor="edit-forma_adquisicion">Forma de Adquisicion</Label>
              <Select name="forma_adquisicion" defaultValue={equipo.forma_adquisicion} required>
                <SelectTrigger id="edit-forma_adquisicion">
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
              <Label htmlFor="edit-anio">Año de Adquisicion</Label>
              <Input
                id="edit-anio"
                name="anio"
                type="number"
                min="1900"
                max="2100"
                defaultValue={equipo.anio}
                required
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
