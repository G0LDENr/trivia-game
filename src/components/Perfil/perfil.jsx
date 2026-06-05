import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaTrophy, FaGamepad, FaChartLine, FaEdit, FaSave, FaTimes, FaArrowLeft, FaCalendarAlt, FaStar } from 'react-icons/fa';
import { UserController } from '../../controllers/userController';
import '../../css/Perfil/perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cargarPerfil = useCallback(() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuarioActual');
      
      if (!usuarioGuardado) {
        navigate('/login');
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);
      setUser(usuario);
      setEditData({
        name: usuario.name || '',
        email: usuario.email || '',
      });
      
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      setError('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setError('');
  };

  const handleSave = async () => {
    if (!editData.name || !editData.email) {
      setError('Nombre y email son requeridos');
      return;
    }

    if (editData.email && !editData.email.includes('@')) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    try {
      const result = await UserController.updateProfile(
        user.id,
        {
          name: editData.name,
          email: editData.email,
        },
        user.id,
        user.rol || 2
      );

      if (result.success) {
        const updatedUser = { ...user, ...result.data };
        setUser(updatedUser);
        localStorage.setItem('usuarioActual', JSON.stringify(updatedUser));
        setEditing(false);
        setSuccess('Perfil actualizado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al actualizar');
      }
    } catch (err) {
      setError('Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('modoJuego');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="perfil-loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="perfil-loading">
        <p>No se encontró información del usuario</p>
        <button onClick={() => navigate('/login')}>Ir a Login</button>
      </div>
    );
  }

  const getRolNombre = (rol) => {
    switch(rol) {
      case 0: return 'Super Administrador';
      case 1: return 'Administrador';
      case 2: return 'Jugador';
      case 3: return 'Invitado';
      default: return 'Usuario';
    }
  };

  const getRolClase = (rol) => {
    switch(rol) {
      case 0: return 'rol-super-admin';
      case 1: return 'rol-admin';
      case 2: return 'rol-jugador';
      case 3: return 'rol-invitado';
      default: return 'rol-usuario';
    }
  };

  return (
    <div className="perfil-container">
      <button className="btn-volver" onClick={() => navigate('/inicio')}>
        <FaArrowLeft className="icono-volver" />
        <span>Volver</span>
      </button>

      <div className="perfil-card">
        <div className="perfil-header">
          <div className="perfil-avatar">
            <FaUser />
          </div>
          <h1 className="perfil-nombre">{user?.name || 'Usuario'}</h1>
          <span className={`perfil-rol ${getRolClase(user?.rol)}`}>
            {getRolNombre(user?.rol)}
          </span>
        </div>

        {error && <div className="perfil-error">{error}</div>}
        {success && <div className="perfil-success">{success}</div>}

        <div className="perfil-body">
          {!editing ? (
            <div className="perfil-info">
              <div className="info-grupo">
                <label>Correo electrónico</label>
                <p><FaEnvelope className="info-icon" /> {user?.email}</p>
              </div>

              <div className="info-grupo">
                <label>Miembro desde</label>
                <p><FaCalendarAlt className="info-icon" /> {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}</p>
              </div>

              <button className="btn-editar" onClick={handleEdit}>
                <FaEdit /> Editar perfil
              </button>
            </div>
          ) : (
            <div className="perfil-editar">
              <div className="input-grupo">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="input-grupo">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </div>

              <div className="perfil-buttons">
                <button className="btn-guardar" onClick={handleSave} disabled={loading}>
                  <FaSave /> {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button className="btn-cancelar" onClick={handleCancel}>
                  <FaTimes /> Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sección de estadísticas */}
        <div className="perfil-estadisticas">
          <h3><FaChartLine /> Estadísticas de juego</h3>
          
          <div className="stats-grid">
            <div className="stat-card">
              <FaStar className="stat-icon" />
              <div className="stat-info">
                <span className="stat-valor">{user?.puntaje_total || 0}</span>
                <span className="stat-label">Puntaje total</span>
              </div>
            </div>
            
            <div className="stat-card">
              <FaGamepad className="stat-icon" />
              <div className="stat-info">
                <span className="stat-valor">{user?.partidas_jugadas || 0}</span>
                <span className="stat-label">Partidas jugadas</span>
              </div>
            </div>
            
            <div className="stat-card">
              <FaTrophy className="stat-icon" />
              <div className="stat-info">
                <span className="stat-valor">{user?.partidas_ganadas || 0}</span>
                <span className="stat-label">Partidas ganadas</span>
              </div>
            </div>
          </div>

          {/* Porcentaje de victorias */}
          {user?.partidas_jugadas > 0 && (
            <div className="stats-detalles">
              <div className="detalle-item">
                <span>🏆 Porcentaje de victorias:</span>
                <strong>{Math.round((user.partidas_ganadas / user.partidas_jugadas) * 100)}%</strong>
              </div>
            </div>
          )}
        </div>

        <div className="perfil-footer">
          <button className="btn-cerrar-sesion" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Perfil;