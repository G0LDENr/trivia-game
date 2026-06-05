import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { UserController } from '../controllers/userController';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión actual
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const result = await UserController.getUserById(session.user.id, 2, session.user.id);
        if (result.success) {
          setUser(result.data);
          localStorage.setItem('usuarioActual', JSON.stringify(result.data));
        }
      }
      
      setLoading(false);
    };

    checkSession();

    // Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const result = await UserController.getUserById(session.user.id, 2, session.user.id);
        if (result.success) {
          setUser(result.data);
          localStorage.setItem('usuarioActual', JSON.stringify(result.data));
        }
      } else {
        setUser(null);
        localStorage.removeItem('usuarioActual');
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await UserController.logout();
    setUser(null);
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('modoJuego');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};