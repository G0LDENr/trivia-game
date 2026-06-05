import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import "../css/Home/home.css";
import logo from "../img/Logo.png";

const Home = () => {
  const navigate = useNavigate();

  const handleInvitadoClick = () => {
    // Jugar como invitado sin registro
    localStorage.setItem('modoJuego', 'invitado');
    localStorage.setItem('usuarioActual', JSON.stringify({ nombre: 'Invitado', tipo: 'invitado' }));
    navigate('/inicio');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegistroClick = () => {
    navigate('/registro');
  };

  return (
    <div className="trivia-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>

      <h1 className="trivia-title">TRIVIA</h1>

      <p className="trivia-message">
        Pon a prueba tus conocimientos y diviértete
      </p>

      <div className="botones-container">
        <button className="play-button" onClick={handleInvitadoClick}>
          <FaPlay className="play-icon" />
          JUGAR COMO INVITADO
        </button>

        <button className="login-button" onClick={handleLoginClick}>
          <FaSignInAlt className="login-icon" />
          INICIAR SESIÓN
        </button>

        <button className="registro-button" onClick={handleRegistroClick}>
          <FaUserPlus className="registro-icon" />
          REGISTRARSE
        </button>
      </div>
    </div>
  );
};

export default Home;