import React, { useState } from 'react';
import { FaLock, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { UserController } from '../../controllers/userController';
import '../../css/Perfil/edit-perfil.css';

const EditarPerfil = ({ isOpen, onClose, userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        setError('Ingrese su contraseña actual');
        return false;
      }
      if (formData.newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      if (showPasswordFields) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const result = await UserController.updateProfileComplete(userData.id, updateData);

      if (result.success) {
        setSuccess('Perfil actualizado');
        const updatedUser = { ...userData, ...result.data };
        localStorage.setItem('usuarioActual', JSON.stringify(updatedUser));
        if (onUpdate) onUpdate(updatedUser);
        
        setTimeout(() => onClose(), 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordFields(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="editar-perfil-overlay" onClick={handleCancel}>
      <div className="editar-perfil-modal" onClick={(e) => e.stopPropagation()}>
        <div className="editar-perfil-header">
          <h2>Editar Perfil</h2>
          <button className="btn-cerrar-modal" onClick={handleCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editar-perfil-form">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <button
            type="button"
            className="btn-toggle-password"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
          >
            <FaLock /> {showPasswordFields ? 'Cancelar' : 'Cambiar contraseña'}
          </button>

          {showPasswordFields && (
            <div className="password-fields">
              <div className="form-group">
                <label>Contraseña actual</label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Contraseña actual"
                  />
                  <button type="button" className="toggle-password-btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Nueva contraseña</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" className="toggle-password-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar contraseña</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmar contraseña"
                  />
                  <button type="button" className="toggle-password-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-buttons">
            <button type="button" className="btn-cancelar-form" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar-form" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;