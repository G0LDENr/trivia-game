import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserCircle, FaUser, FaEnvelope, FaChevronRight, FaLock, FaEye, FaEyeSlash, FaMoon, FaSun, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import "../../css/Inicio/inicio.css";
import "../../css/Juego/juego.css";
import "../../css/Configuracion/configuracion.css";

const Configuracion = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [configuraciones, setConfiguraciones] = useState({
    tema: 'claro',
    sonido: true
  });

  useEffect(() => {
    const usuarioActual = localStorage.getItem('usuarioActual');
    if (usuarioActual) {
      const userData = JSON.parse(usuarioActual);
      setUser(userData);
      setEditName(userData.name || '');
      setEditEmail(userData.email || '');
    }
    
    const configGuardada = localStorage.getItem('configuraciones');
    if (configGuardada) {
      setConfiguraciones(JSON.parse(configGuardada));
    }
  }, []);

  const handleCambioTema = () => {
    const nuevoTema = configuraciones.tema === 'claro' ? 'oscuro' : 'claro';
    setConfiguraciones(prev => ({ ...prev, tema: nuevoTema }));
    localStorage.setItem('configuraciones', JSON.stringify({ ...configuraciones, tema: nuevoTema }));
    
    if (nuevoTema === 'oscuro') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const handleCambioSonido = () => {
    const nuevoSonido = !configuraciones.sonido;
    setConfiguraciones(prev => ({ ...prev, sonido: nuevoSonido }));
    localStorage.setItem('configuraciones', JSON.stringify({ ...configuraciones, sonido: nuevoSonido }));
  };

  const handleGuardarNombre = () => {
    if (editName.trim()) {
      const updatedUser = { ...user, name: editName };
      setUser(updatedUser);
      localStorage.setItem('usuarioActual', JSON.stringify(updatedUser));
      setModalAbierto('info');
    }
  };

  const handleGuardarEmail = () => {
    if (editEmail.trim()) {
      const updatedUser = { ...user, email: editEmail };
      setUser(updatedUser);
      localStorage.setItem('usuarioActual', JSON.stringify(updatedUser));
      setModalAbierto('info');
    }
  };

  const handleGuardarPassword = () => {
    setMensajeError('');
    
    if (!currentPassword) {
      setMensajeError('Ingresa tu contraseña actual');
      return;
    }
    
    if (!newPassword) {
      setMensajeError('Ingresa una nueva contraseña');
      return;
    }
    
    if (newPassword.length < 6) {
      setMensajeError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMensajeError('Las contraseñas nuevas no coinciden');
      return;
    }
    
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      const userData = JSON.parse(usuarioGuardado);
      if (currentPassword === 'admin123' || currentPassword === userData.password) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setModalAbierto(null);
        alert('Contraseña actualizada correctamente');
      } else {
        setMensajeError('Contraseña actual incorrecta');
      }
    } else {
      setMensajeError('Error al verificar la contraseña');
    }
  };

  // Modal de información de cuenta
  const ModalInfoCuenta = () => (
    <div className="modal-overlay" onClick={() => setModalAbierto(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <FaUserCircle className="modal-header-icono" />
          <h3>Información de cuenta</h3>
          <button className="modal-cerrar" onClick={() => setModalAbierto(null)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-campo" onClick={() => { setModalAbierto('editarNombre'); }}>
            <div className="modal-campo-info">
              <FaUser className="modal-campo-icono" />
              <div>
                <span className="modal-campo-label">Nombre</span>
                <span className="modal-campo-valor">{user?.name || 'Usuario'}</span>
              </div>
            </div>
            <FaChevronRight className="modal-campo-flecha" />
          </div>
          
          <div className="modal-campo" onClick={() => { setModalAbierto('editarEmail'); }}>
            <div className="modal-campo-info">
              <FaEnvelope className="modal-campo-icono" />
              <div>
                <span className="modal-campo-label">Correo electrónico</span>
                <span className="modal-campo-valor">{user?.email || 'usuario@ejemplo.com'}</span>
              </div>
            </div>
            <FaChevronRight className="modal-campo-flecha" />
          </div>
        </div>
      </div>
    </div>
  );

  // Modal para editar nombre
  const ModalEditarNombre = () => (
    <div className="modal-overlay" onClick={() => setModalAbierto('info')}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar nombre</h3>
          <button className="modal-cerrar" onClick={() => setModalAbierto('info')}>✕</button>
        </div>
        <div className="modal-body">
          <label>Nombre</label>
          <input 
            type="text" 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Tu nombre"
            autoFocus
          />
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancelar" onClick={() => setModalAbierto('info')}>Cancelar</button>
          <button className="modal-btn-guardar" onClick={handleGuardarNombre}>Guardar</button>
        </div>
      </div>
    </div>
  );

  // Modal para editar correo
  const ModalEditarEmail = () => (
    <div className="modal-overlay" onClick={() => setModalAbierto('info')}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar correo electrónico</h3>
          <button className="modal-cerrar" onClick={() => setModalAbierto('info')}>✕</button>
        </div>
        <div className="modal-body">
          <label>Correo electrónico</label>
          <input 
            type="email" 
            value={editEmail} 
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="tu@email.com"
            autoFocus
          />
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancelar" onClick={() => setModalAbierto('info')}>Cancelar</button>
          <button className="modal-btn-guardar" onClick={handleGuardarEmail}>Guardar</button>
        </div>
      </div>
    </div>
  );

  // Modal para cambiar contraseña
  const ModalEditarPassword = () => (
    <div className="modal-overlay" onClick={() => setModalAbierto(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cambiar contraseña</h3>
          <button className="modal-cerrar" onClick={() => setModalAbierto(null)}>✕</button>
        </div>
        <div className="modal-body">
          {mensajeError && <div className="modal-error">{mensajeError}</div>}
          
          <label>Contraseña actual</label>
          <div className="modal-password-input">
            <input 
              type={showCurrentPassword ? "text" : "password"} 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          <label>Nueva contraseña</label>
          <div className="modal-password-input">
            <input 
              type={showNewPassword ? "text" : "password"} 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          <label>Confirmar nueva contraseña</label>
          <div className="modal-password-input">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancelar" onClick={() => setModalAbierto(null)}>Cancelar</button>
          <button className="modal-btn-guardar" onClick={handleGuardarPassword}>Guardar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="configuracion-container">
      <div className="boton-regreso" onClick={() => navigate('/inicio')}>
        <FaArrowLeft className="icono-flecha" />
      </div>

      <h1 className="configuracion-titulo">CONFIGURACIÓN</h1>
      <p className="configuracion-subtitulo">personaliza tu experiencia</p>

      <div className="configuracion-contenido">
        {/* Sección CUENTA */}
        <div className="config-seccion-titulo">CUENTA</div>
        
        <div className="config-card">
          <div className="config-card-header" onClick={() => setModalAbierto('info')}>
            <FaUserCircle className="config-card-icono" />
            <div className="config-card-header-info">
              <h3 className="config-card-titulo">Información de cuenta</h3>
              <p className="config-card-subtitulo">Edita tu nombre, correo</p>
            </div>
            <FaChevronRight className="config-card-flecha" />
          </div>

          <div className="config-divisor"></div>

          <div className="config-card-header" onClick={() => setModalAbierto('editarPassword')}>
            <FaLock className="config-card-icono" />
            <div className="config-card-header-info">
              <h3 className="config-card-titulo">Cambio de contraseña</h3>
              <p className="config-card-subtitulo">Actualiza tu contraseña</p>
            </div>
            <FaChevronRight className="config-card-flecha" />
          </div>
        </div>
        <br></br>
        {/* Sección PREFERENCIAS */}
        <div className="config-seccion-titulo">PREFERENCIAS</div>
        
        <div className="config-card">
          {/* Tema */}
          <div className="config-card-header" onClick={handleCambioTema}>
            {configuraciones.tema === 'claro' ? <FaSun className="config-card-icono" /> : <FaMoon className="config-card-icono" />}
            <div className="config-card-header-info">
              <h3 className="config-card-titulo">Tema de la aplicación</h3>
              <p className="config-card-subtitulo">{configuraciones.tema === 'claro' ? 'Modo claro' : 'Modo oscuro'}</p>
            </div>
            <div className="config-toggle-switch">
              <div className={`toggle-switch ${configuraciones.tema === 'oscuro' ? 'active' : ''}`}>
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>

          <div className="config-divisor"></div>

          {/* Sonido */}
          <div className="config-card-header" onClick={handleCambioSonido}>
            {configuraciones.sonido ? <FaVolumeUp className="config-card-icono" /> : <FaVolumeMute className="config-card-icono" />}
            <div className="config-card-header-info">
              <h3 className="config-card-titulo">Sonido</h3>
              <p className="config-card-subtitulo">{configuraciones.sonido ? 'Activado' : 'Desactivado'}</p>
            </div>
            <div className="config-toggle-switch">
              <div className={`toggle-switch ${configuraciones.sonido ? 'active' : ''}`}>
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {modalAbierto === 'info' && <ModalInfoCuenta />}
      {modalAbierto === 'editarNombre' && <ModalEditarNombre />}
      {modalAbierto === 'editarEmail' && <ModalEditarEmail />}
      {modalAbierto === 'editarPassword' && <ModalEditarPassword />}
    </div>
  );
};

export default Configuracion;