import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { UserController } from '../../controllers/userController';
import "../../css/Login/login.css";
import logo from "../../img/Logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await UserController.login(email, password);
      
      if (result.success) {
        console.log('Datos del usuario al login:', result.data);
        localStorage.setItem('usuarioActual', JSON.stringify(result.data));
        localStorage.setItem('modoJuego', 'registrado');
        navigate('/inicio');
      } else {
        setError(result.error || 'Correo o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message);
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

      <h1 className="login-title">INICIAR SESIÓN</h1>

      <form className="login-form" onSubmit={handleLogin}>
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

        {error && <div className="error-mensaje">{error}</div>}

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
        </button>

        <div className="registro-link">
          <p>¿No tienes cuenta? <span onClick={() => navigate('/registro')}>Regístrate aquí</span></p>
        </div>
      </form>
    </div>
  );
};

export default Login;