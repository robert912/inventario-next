-- Create equipos (equipment) table
CREATE TABLE IF NOT EXISTS public.equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  marca TEXT NOT NULL,
  numero_serie TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('activo', 'inactivo', 'en_reparacion', 'dado_de_baja')),
  forma_adquisicion TEXT NOT NULL CHECK (forma_adquisicion IN ('compra', 'donacion', 'comodato', 'leasing', 'otro')),
  responsable_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  numero_inventario TEXT NOT NULL UNIQUE,
  anio INTEGER NOT NULL CHECK (anio >= 1900 AND anio <= 2100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;

-- Policies for equipos

-- Everyone authenticated can view all equipos
CREATE POLICY "equipos_select_all" ON public.equipos 
  FOR SELECT TO authenticated
  USING (true);

-- Everyone authenticated can insert equipos
CREATE POLICY "equipos_insert_authenticated" ON public.equipos 
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Only admins can update equipos
CREATE POLICY "equipos_update_admin" ON public.equipos 
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete equipos
CREATE POLICY "equipos_delete_admin" ON public.equipos 
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at on equipos
DROP TRIGGER IF EXISTS update_equipos_updated_at ON public.equipos;
CREATE TRIGGER update_equipos_updated_at
  BEFORE UPDATE ON public.equipos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_equipos_nombre ON public.equipos(nombre);
CREATE INDEX IF NOT EXISTS idx_equipos_numero_inventario ON public.equipos(numero_inventario);
CREATE INDEX IF NOT EXISTS idx_equipos_estado ON public.equipos(estado);
CREATE INDEX IF NOT EXISTS idx_equipos_responsable ON public.equipos(responsable_id);
