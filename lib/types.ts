export type UserRole = 'user' | 'admin'

export type EstadoEquipo = 'activo' | 'en_reparacion' | 'dado_de_baja' | 'en_prestamo'

export type FormaAdquisicion = 'compra' | 'donacion' | 'prestamo' | 'comodato' | 'otro'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Equipo {
  id: string
  nombre: string
  marca: string
  numero_serie: string
  ubicacion: string
  estado: EstadoEquipo
  forma_adquisicion: FormaAdquisicion
  responsable: string
  numero_inventario: string
  anio: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface EquipoInsert {
  nombre: string
  marca: string
  numero_serie: string
  ubicacion: string
  estado: EstadoEquipo
  forma_adquisicion: FormaAdquisicion
  responsable: string
  numero_inventario: string
  anio: number
  created_by: string
}

export interface EquipoUpdate {
  nombre?: string
  marca?: string
  numero_serie?: string
  ubicacion?: string
  estado?: EstadoEquipo
  forma_adquisicion?: FormaAdquisicion
  responsable?: string
  numero_inventario?: string
  anio?: number
}
