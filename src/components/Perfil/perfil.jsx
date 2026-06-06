import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaTrophy, FaGamepad, FaChartLine, FaTimes, FaStar, FaSignOutAlt, FaCog, FaChartBar, FaUserEdit } from 'react-icons/fa';
import EditarPerfil from './editPerfil';
import '../../css/Perfil/perfil.css';

const Perfil = ({ isOpen, onClose, userData }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editarPerfilAbierto, setEditarPerfilAbierto] = useState(false);

  useEffect(() => {
    if (userData) {
      setUser(userData);
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
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      setError('Error al cargar los datos del perfil');
    }
  };

  const handleAbrirEditarPerfil = () => {
    setEditarPerfilAbierto(true);
    setError('');
    setSuccess('');
  };

  const handleCerrarEditarPerfil = () => {
    setEditarPerfilAbierto(false);
  };

  const handleActualizarUsuario = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('usuarioActual', JSON.stringify(updatedUser));
    setSuccess('Perfil actualizado correctamente');
    setTimeout(() => setSuccess(''), 3000);
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
      <div className={`perfil-overlay ${isOpen ? 'abierto' : ''}`} onClick={onClose}></div>
      
      <div className={`perfil-menu-lateral ${isOpen ? 'abierto' : ''}`}>
        <div className="perfil-menu-header">
          <button className="perfil-menu-cerrar" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="perfil-avatar">
            <FaUser />
          </div>
          <h3 className="perfil-nombre">{user?.name || 'Usuario'}</h3>
          <p className="perfil-email">{user?.email}</p>
        </div>

        {error && <div className="perfil-error">{error}</div>}
        {success && <div className="perfil-success">{success}</div>}

        <div className="perfil-contenedor-principal">
          <div className="perfil-opciones">
            <div className="opcion-item" onClick={handleAbrirEditarPerfil}>
              <FaUserEdit className="opcion-icon" />
              <div className="opcion-info">
                <span className="opcion-titulo">Editar perfil</span>
                <span className="opcion-desc">Modificar tus datos</span>
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
          
          <div className="perfil-spacer"></div>
          
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
                  <span>Victoria</span>
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

      <EditarPerfil
        isOpen={editarPerfilAbierto}
        onClose={handleCerrarEditarPerfil}
        userData={user}
        onUpdate={handleActualizarUsuario}
      />
    </>
  );
};

export default Perfil;