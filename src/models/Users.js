import { supabase } from '../lib/supabase.js'
import bcrypt from 'bcryptjs'

export const UserModel = {
  // Obtener todos los usuarios
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, rol, puntaje_total, partidas_jugadas, partidas_ganadas, created_at')
    
    if (error) throw error
    return data
  },

  // Obtener usuario por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, rol, puntaje_total, partidas_jugadas, partidas_ganadas, created_at')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Obtener usuario por email
  async getByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()  // Cambia .single() por .maybeSingle()
    
    // maybeSingle() devuelve null si no encuentra, no lanza error
    if (error && error.code !== 'PGRST116') throw error
    return data  // Será null si el usuario no existe
    },

  // Crear usuario (CON BCRYPT - SIN supabase.auth)
  async create(userData) {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: crypto.randomUUID(), // Generar UUID manualmente
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        rol: userData.rol || 2,
        puntaje_total: 0,
        partidas_jugadas: 0,
        partidas_ganadas: 0
      }])
      .select('id, name, email, rol, puntaje_total, partidas_jugadas, partidas_ganadas, created_at')
    
    if (error) throw error
    return data[0]
  },

  // Autenticación (CON BCRYPT - SIN supabase.auth)
  async login(email, password) {
    const user = await this.getByEmail(email)
    
    if (!user) {  // Ahora user puede ser null
        throw new Error('Usuario no encontrado')
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
        throw new Error('Contraseña incorrecta')
    }
    
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
    },

  // Actualizar usuario
  async update(id, userData) {
    const updateData = {}
    
    if (userData.name) updateData.name = userData.name
    if (userData.phone !== undefined) updateData.phone = userData.phone
    if (userData.age !== undefined) updateData.age = userData.age
    if (userData.rol !== undefined) updateData.rol = userData.rol
    
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10)
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, rol, puntaje_total, partidas_jugadas, partidas_ganadas, created_at')
    
    if (error) throw error
    return data[0]
  },

  // Actualizar estadísticas
  async updateEstadisticas(id, puntaje, esVictoria) {
    const { data: user } = await supabase
      .from('users')
      .select('puntaje_total, partidas_jugadas, partidas_ganadas')
      .eq('id', id)
      .single()
    
    const updates = {
      puntaje_total: (user?.puntaje_total || 0) + puntaje,
      partidas_jugadas: (user?.partidas_jugadas || 0) + 1,
      partidas_ganadas: esVictoria ? (user?.partidas_ganadas || 0) + 1 : (user?.partidas_ganadas || 0)
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, puntaje_total, partidas_jugadas, partidas_ganadas')
    
    if (error) throw error
    return data[0]
  },

  // Eliminar usuario
  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Obtener ranking
  async getRanking(limit = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, puntaje_total, partidas_jugadas, partidas_ganadas')
      .eq('rol', 2)
      .order('puntaje_total', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Crear invitado
  async createInvitado(nombre) {
    const invitadoId = crypto.randomUUID()
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: invitadoId,
        name: nombre || `Invitado_${Date.now()}`,
        email: `invitado_${Date.now()}@temp.com`,
        password: await bcrypt.hash(Date.now().toString(), 10),
        rol: 3,
        puntaje_total: 0,
        partidas_jugadas: 0,
        partidas_ganadas: 0
      }])
      .select('id, name, email, rol, puntaje_total, partidas_jugadas, partidas_ganadas, created_at')
    
    if (error) throw error
    return data[0]
  }
}