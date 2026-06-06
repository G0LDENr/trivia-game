import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaTrophy, FaGamepad, FaChartLine, FaSave, FaTimes, FaStar, FaSignOutAlt, FaCog, FaChartBar, FaUserEdit } from 'react-icons/fa';
import { UserController } from '../../controllers/userController';
import '../../css/Perfil/perfil.css';

const Perfil = ({ isOpen, onClose, userData }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userData) {
      setUser(userData);
      setEditData({
        name: userData.name || '',
        email: userData.email || '',
      });
      setLoading(false);
    } else if (isOpen) {
      cargarPerfil();
    }
  }, [userData, isOpen]);

  const cargarPerfil = () => {
    try {
      const usuarioGuardado = localStorage.getItem('usuarioActual');
      if (!usuarioGuardado) {
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
  };

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
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div className={`perfil-overlay ${isOpen ? 'abierto' : ''}`} onClick={onClose}></div>
      
      {/* Menú lateral */}
      <div className={`perfil-menu-lateral ${isOpen ? 'abierto' : ''}`}>
        <div className="perfil-menu-header">
          <button className="perfil-menu-cerrar" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="perfil-avatar">
            <FaUser />
          </div>
          {!editing ? (
            <h3 className="perfil-nombre">{user?.name || 'Usuario'}</h3>
          ) : (
            <input
              type="text"
              name="name"
              className="perfil-input-nombre"
              value={editData.name}
              onChange={handleChange}
              placeholder="Tu nombre"
            />
          )}
          {/* Email debajo del nombre */}
          {!editing ? (
            <p className="perfil-email">{user?.email}</p>
          ) : (
            <input
              type="email"
              name="email"
              className="perfil-input-email"
              value={editData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
            />
          )}
        </div>

        {error && <div className="perfil-error">{error}</div>}
        {success && <div className="perfil-success">{success}</div>}

        <div className="perfil-contenedor-principal">
          {!editing ? (
            <div className="perfil-opciones">
              <div className="opcion-item" onClick={handleEdit}>
                <FaUserEdit className="opcion-icon" />
                <div className="opcion-info">
                  <span className="opcion-titulo">Editar perfil</span>
                  <span className="opcion-desc">Modificar nombre y email</span>
                </div>
              </div>
              
              <div className="opcion-item">
                <FaCog className="opcion-icon" />
                <div className="opcion-info">
                  <span className="opcion-titulo">Configuración</span>
                  <span className="opcion-desc">Ajustes de cuenta</span>
                </div>
              </div>
              
              <div className="opcion-item">
                <FaChartBar className="opcion-icon" />
                <div className="opcion-info">
                  <span className="opcion-titulo">Progreso</span>
                  <span className="opcion-desc">Ver evolución y logros</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="perfil-editar-opciones">
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
          
          <div className="perfil-spacer"></div>
          
          {/* Sección de estadísticas */}
          <div className="perfil-estadisticas">
            <h4><FaChartLine /> Estadísticas</h4>
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
                  <span className="stat-label">Partidas</span>
                </div>
              </div>
              <div className="stat-card">
                <FaTrophy className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-valor">{user?.partidas_ganadas || 0}</span>
                  <span className="stat-label">Ganadas</span>
                </div>
              </div>
            </div>
            {user?.partidas_jugadas > 0 && (
              <div className="stats-detalles">
                <div className="detalle-item">
                  <span>🏆 Porcentaje de victorias:</span>
                  <strong>{Math.round((user.partidas_ganadas / user.partidas_jugadas) * 100)}%</strong>
                </div>
              </div>
            )}
          </div>

          <div className="perfil-menu-footer">
            <button className="btn-cerrar-sesion" onClick={handleLogout}>
              <FaSignOutAlt /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;