import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { UserController } from '../../controllers/userController';
import "../../css/Login/login.css";
import logo from "../../img/Logo.png";

const Registro = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    
    if (!nombre || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await UserController.register({
        name: nombre,
        email: email,
        password: password
      });
      
      if (result.success) {
        localStorage.setItem('usuarioActual', JSON.stringify(result.data));
        localStorage.setItem('modoJuego', 'registrado');
        navigate('/inicio');
      } else {
        setError(result.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error al registrarse: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button className="btn-volver" onClick={() => navigate('/')}>
        <FaArrowLeft className="icono-volver" />
      </button>

      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>

      <h1 className="login-title">REGISTRARSE</h1>

      <form className="login-form" onSubmit={handleRegistro}>
        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            className="input-field"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={mostrarPassword ? "text" : "password"}
            className="input-field"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button 
            type="button"
            className="btn-mostrar-password"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            disabled={loading}
          >
            {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={mostrarConfirmPassword ? "text" : "password"}
            className="input-field"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <button 
            type="button"
            className="btn-mostrar-password"
            onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
            disabled={loading}
          >
            {mostrarConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && <div className="error-mensaje">{error}</div>}

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? 'REGISTRANDO...' : 'REGISTRARSE'}
        </button>

        <div className="registro-link">
          <p>¿Ya tienes cuenta? <span onClick={() => navigate('/login')}>Inicia sesión aquí</span></p>
        </div>
      </form>
    </div>
  );
};

export default Registro;