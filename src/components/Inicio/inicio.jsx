import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUsers, FaUserCircle } from "react-icons/fa";
import Perfil from '../Perfil/perfil';
import "../../css/Inicio/inicio.css";
import logo from "../../img/Logo.png";
import copaLogo from "../../img/Copa.png";
import estadisticasLogo from "../../img/estadisticas.png";

const Inicio = () => {
  const navigate = useNavigate();
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    const usuario = localStorage.getItem('usuarioActual');
    if (usuario) {
      setUsuarioActual(JSON.parse(usuario));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleJugarClick = () => {
    navigate('/juego');
  };

  const handleJugoSoloClick = () => {
    navigate('/juego-solo');
  };

  const handleMultijugadorClick = () => {
    // Por ahora mostrar alerta, luego se conecta con el multijugador
    alert('Próximamente disponible');
  };

  const handlePerfilClick = () => {
    setMenuPerfilAbierto(true);
  };

  const handleCerrarMenu = () => {
    setMenuPerfilAbierto(false);
  };

  const handleEstadisticasClick = () => {
    navigate('/estadisticas');
  };

  return (
    <div className="inicio-container">
      {/* Menú de perfil desplegable (es el mismo Perfil.jsx) */}
      <Perfil 
        isOpen={menuPerfilAbierto} 
        onClose={handleCerrarMenu} 
        userData={usuarioActual}
      />

      {/* Botón Perfil - IZQUIERDA */}
      <div className="boton-perfil" onClick={handlePerfilClick} style={{ cursor: 'pointer' }}>
        <div className="circulo-boton">
          <FaUserCircle className="icono-boton" />
        </div>
        <span className="texto-boton">Perfil</span>
      </div>

      {/* Resto del contenido */}
      <div className="logo-superior">
        <img src={logo} alt="Logo" />
      </div>

      <h1 className="inicio-title">TRIVIA</h1>

      <p className="inicio-description">
        Pon a prueba tus conocimientos y diviértete
      </p>

      <div className="cuadro-grande" onClick={handleJugarClick} style={{ cursor: 'pointer' }}>
        <div className="copa-izquierda">
          <div className="circulo-blanco">
            <img src={copaLogo} alt="Copa" className="copa-imagen" />
          </div>
        </div>
        <div className="texto-derecha">
          <h2 className="jugar-grande">JUGAR</h2>
          <p className="comenzar-partida">Comenzar una partida</p>
        </div>
      </div>

      <div className="modos-juego-container">
        <div className="modo-cuadro modo-solo-cuadro" onClick={handleJugoSoloClick} style={{ cursor: 'pointer' }}>
          <div className="icono-cuadro">
            <FaUser className="icono-grande" />
          </div>
          <h3 className="modo-titulo">JUEGO SOLO</h3>
          <p className="modo-descripcion">Desafía tus propios límites</p>
        </div>

        <div className="modo-cuadro modo-multi-cuadro" onClick={handleMultijugadorClick} style={{ cursor: 'pointer' }}>
          <div className="icono-cuadro">
            <FaUsers className="icono-grande" />
          </div>
          <h3 className="modo-titulo">MULTIJUGADOR</h3>
          <p className="modo-descripcion">Juega con amigos o con otros jugadores</p>
        </div>
      </div>

      <div className="cuadro-estadisticas" onClick={handleEstadisticasClick} style={{ cursor: 'pointer' }}>
        <div className="circulo-estadisticas">
          <img src={estadisticasLogo} alt="Estadísticas" className="estadisticas-imagen" />
        </div>
        <div className="texto-estadisticas">
          <h3>Estadísticas</h3>
          <p>Revisa tu progreso</p>
        </div>
      </div>
    </div>
  );
};

export default Inicio;