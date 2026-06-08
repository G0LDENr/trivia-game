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
  },

  // NUEVO: Actualizar perfil completo (nombre, email y contraseña)
  async updateProfileComplete(userId, userData) {
    if (!userId) {
      return { success: false, error: 'ID de usuario no proporcionado' }
    }

    if (!userData.name || !userData.email) {
      return { success: false, error: 'Nombre y email son requeridos' }
    }

    try {
      // Obtener el usuario actual para verificar email
      const currentUser = await UserModel.getById(userId)
      
      // Verificar si el email ya existe (si está cambiando el email)
      if (userData.email !== currentUser.email) {
        const existingUser = await UserModel.getByEmail(userData.email)
        if (existingUser && existingUser.id !== userId) {
          return { success: false, error: 'El email ya está registrado por otro usuario' }
        }
      }

      // Preparar datos para actualizar
      const updateData = {
        name: userData.name,
        email: userData.email
      }

      // Si se proporciona contraseña nueva, verificarla
      if (userData.newPassword) {
        // Verificar la contraseña actual
        const isValidPassword = await UserModel.verifyPassword(currentUser.email, userData.currentPassword)
        
        if (!isValidPassword) {
          return { success: false, error: 'Contraseña actual incorrecta' }
        }

        // Agregar nueva contraseña (mínimo 6 caracteres)
        if (userData.newPassword.length < 6) {
          return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' }
        }
        
        updateData.password = userData.newPassword
      }

      // Actualizar usuario
      const updatedUser = await UserModel.update(userId, updateData)
      
      return { success: true, data: updatedUser }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      return { success: false, error: error.message }
    }
  },

  // Actualizar solo nombre y email (sin contraseña)
  async updateProfile(userId, userData) {
    if (!userId) {
      return { success: false, error: 'ID de usuario no proporcionado' }
    }

    if (!userData.name || !userData.email) {
      return { success: false, error: 'Nombre y email son requeridos' }
    }

    try {
      // Obtener el usuario actual para verificar email
      const currentUser = await UserModel.getById(userId)
      
      // Verificar si el email ya existe (si está cambiando el email)
      if (userData.email !== currentUser.email) {
        const existingUser = await UserModel.getByEmail(userData.email)
        if (existingUser && existingUser.id !== userId) {
          return { success: false, error: 'El email ya está registrado por otro usuario' }
        }
      }

      // Actualizar usuario
      const updatedUser = await UserModel.update(userId, {
        name: userData.name,
        email: userData.email
      })
      
      return { success: true, data: updatedUser }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      return { success: false, error: error.message }
    }
  },

  // Actualizar estadísticas del modo solo
  async updateEstadisticasSolo(userId, puntaje) {
    if (!userId) {
      return { success: false, error: 'ID de usuario no proporcionado' }
    }

    if (typeof puntaje !== 'number' || puntaje < 0) {
      return { success: false, error: 'Puntaje inválido' }
    }

    try {
      const updatedUser = await UserModel.updateEstadisticasSolo(userId, puntaje)
      return { success: true, data: updatedUser }
    } catch (error) {
      console.error('Error al actualizar estadísticas del modo solo:', error)
      return { success: false, error: error.message }
    }
  },

  // Obtener estadísticas del modo solo
  async getEstadisticasSolo(userId) {
    if (!userId) {
      return { success: false, error: 'ID de usuario no proporcionado' }
    }

    try {
      const estadisticas = await UserModel.getEstadisticasSolo(userId)
      return { success: true, data: estadisticas }
    } catch (error) {
      console.error('Error al obtener estadísticas del modo solo:', error)
      return { success: false, error: error.message }
    }
  }
}