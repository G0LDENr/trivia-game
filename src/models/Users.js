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

  // Obtener usuario por ID (incluyendo password para verificación)
  async getById(id, includePassword = false) {
    let query = supabase
      .from('users')
      .select('id, name, email, rol, puntaje_total, partidas_jugadas, partidas_ganadas, created_at')
    
    if (includePassword) {
      query = supabase
        .from('users')
        .select('*')
    }
    
    const { data, error } = await query.eq('id', id).single()
    
    if (error) throw error
    return data
  },

  // Obtener usuario por email
  async getByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()
    
    // maybeSingle() devuelve null si no encuentra, no lanza error
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Crear usuario (CON BCRYPT - SIN supabase.auth)
  async create(userData) {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: crypto.randomUUID(),
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
    
    if (!user) {
        throw new Error('Usuario no encontrado')
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
        throw new Error('Contraseña incorrecta')
    }
    
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },

  // NUEVO: Verificar contraseña actual
  async verifyPassword(email, password) {
    const user = await this.getByEmail(email)
    
    if (!user) {
      return false
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    return isValidPassword
  },

  // Actualizar usuario (actualizado para manejar más campos)
  async update(id, userData) {
    const updateData = {}
    
    if (userData.name !== undefined) updateData.name = userData.name
    if (userData.email !== undefined) updateData.email = userData.email
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
  },

  // Actualizar estadísticas del modo solo
  async updateEstadisticasSolo(id, puntaje) {
    try {
      // Obtener el usuario actual
      const { data: user, error: getUserError } = await supabase
        .from('users')
        .select('puntaje_total, partidas_jugadas, partidas_solo, puntaje_solo, mejor_puntaje_solo')
        .eq('id', id)
        .single()
      
      if (getUserError) throw getUserError
      
      // Calcular nuevos valores
      const nuevoPuntajeTotal = (user?.puntaje_total || 0) + puntaje
      const nuevasPartidasJugadas = (user?.partidas_jugadas || 0) + 1
      const nuevasPartidasSolo = (user?.partidas_solo || 0) + 1
      const nuevoPuntajeSolo = (user?.puntaje_solo || 0) + puntaje
      
      // Actualizar mejor puntaje si es mayor
      let nuevoMejorPuntajeSolo = user?.mejor_puntaje_solo || 0
      if (puntaje > nuevoMejorPuntajeSolo) {
        nuevoMejorPuntajeSolo = puntaje
      }
      
      const updates = {
        puntaje_total: nuevoPuntajeTotal,
        partidas_jugadas: nuevasPartidasJugadas,
        partidas_solo: nuevasPartidasSolo,
        puntaje_solo: nuevoPuntajeSolo,
        mejor_puntaje_solo: nuevoMejorPuntajeSolo
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select('id, name, email, rol, puntaje_total, partidas_jugadas, partidas_ganadas, partidas_solo, puntaje_solo, mejor_puntaje_solo, created_at')
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error al actualizar estadísticas del modo solo:', error)
      throw error
    }
  },

  // Obtener estadísticas del modo solo
  async getEstadisticasSolo(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('partidas_solo, puntaje_solo, mejor_puntaje_solo')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al obtener estadísticas del modo solo:', error)
      throw error
    }
  }
}