import { createClient } from '@supabase/supabase-js'

// Variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validación
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Faltan variables de entorno de Supabase.\n' +
    'Crea un archivo .env en la raíz con:\n' +
    'REACT_APP_SUPABASE_URL=tu_url\n' +
    'REACT_APP_SUPABASE_ANON_KEY=tu_key'
  )
}

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token'
  }
})

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error al obtener usuario:', error)
    return null
  }
  return user
}

// Función para cerrar sesión
export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error al cerrar sesión:', error)
    return false
  }
  return true
}