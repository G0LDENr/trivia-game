-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  age INTEGER CHECK (age >= 18 AND age <= 120),
  rol INTEGER DEFAULT 2 CHECK (rol IN (0, 1, 2, 3)),
  puntaje_total INTEGER DEFAULT 0,
  partidas_jugadas INTEGER DEFAULT 0,
  partidas_ganadas INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_rol ON public.users(rol);
CREATE INDEX IF NOT EXISTS idx_users_puntaje ON public.users(puntaje_total DESC);

-- Comentarios
COMMENT ON TABLE public.users IS 'Tabla de usuarios del juego';
COMMENT ON COLUMN public.users.rol IS '0: SuperAdmin, 1: Admin, 2: Usuario, 3: Invitado';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();