import { UserModel } from '../models/Users.js'

export const UserController = {
  // Login
  async login(email, password) {
    if (!email || !password) {
      return { success: false, error: 'Email y contraseña son requeridos' }
    }

    try {
      const user = await UserModel.login(email, password)
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Registro
  async register(userData) {
    if (!userData.name || !userData.email || !userData.password) {
      return { success: false, error: 'Nombre, email y contraseña son requeridos' }
    }
    
    if (userData.password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    try {
      const existingUser = await UserModel.getByEmail(userData.email)
      if (existingUser) {
        return { success: false, error: 'El email ya está registrado' }
      }
      
      const newUser = await UserModel.create({
        name: userData.name,
        email: userData.email,
        password: userData.password
      })
      
      return { success: true, data: newUser }
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message }
    }
  },

  // Cerrar sesión
  async logout() {
    // Solo limpiar localStorage
    localStorage.removeItem('usuarioActual');
    return { success: true }
  },

  // Modo invitado
  async invitado(nombre) {
    try {
      const user = await UserModel.createInvitado(nombre)
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obtener ranking
  async getRanking(limit = 10) {
    try {
      const ranking = await UserModel.getRanking(limit)
      return { success: true, data: ranking }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Actualizar estadísticas
  async updateEstadisticas(userId, puntaje, esVictoria) {
    try {
      const updatedUser = await UserModel.updateEstadisticas(userId, puntaje, esVictoria)
      return { success: true, data: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}