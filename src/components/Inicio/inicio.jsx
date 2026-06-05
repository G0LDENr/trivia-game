import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUsers, FaUserCircle, FaCog } from "react-icons/fa";
import "../../css/Inicio/inicio.css";
import logo from "../../img/Logo.png";
import copaLogo from "../../img/Copa.png";
import estadisticasLogo from "../../img/estadisticas.png";

const Inicio = () => {
  const navigate = useNavigate();

  const handleJugarClick = () => {
    navigate('/juego');
  };

  const handlePerfilClick = () => {
    navigate('/perfil');
  };

  const handleConfiguracionClick = () => {
    navigate('/configuracion');
  };

  return (
    <div className="inicio-container">
      {/* Botón Perfil - IZQUIERDA */}
      <div className="boton-perfil" onClick={handlePerfilClick} style={{ cursor: 'pointer' }}>
        <div className="circulo-boton">
          <FaUserCircle className="icono-boton" />
        </div>
        <span className="texto-boton">Perfil</span>
      </div>

      {/* Botón Configuración - DERECHA */}
      <div className="boton-configuracion" onClick={handleConfiguracionClick} style={{ cursor: 'pointer' }}>
        <div className="circulo-boton">
          <FaCog className="icono-boton" />
        </div>
        <span className="texto-boton">Configuración</span>
      </div>

      {/* Logo superior */}
      <div className="logo-superior">
        <img src={logo} alt="Logo" />
      </div>

      {/* Resto del contenido igual... */}
      <h1 className="inicio-title">TRIVIA</h1>

      <p className="inicio-description">
        Pon a prueba tus conocimientos y diviértete
      </p>

      {/* Cuadro JUGAR */}
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
        <div className="modo-cuadro modo-solo-cuadro">
          <div className="icono-cuadro">
            <FaUser className="icono-grande" />
          </div>
          <h3 className="modo-titulo">JUEGO SOLO</h3>
          <p className="modo-descripcion">Desafía tus propios límites</p>
        </div>

        <div className="modo-cuadro modo-multi-cuadro">
          <div className="icono-cuadro">
            <FaUsers className="icono-grande" />
          </div>
          <h3 className="modo-titulo">MULTIJUGADOR</h3>
          <p className="modo-descripcion">Juega con amigos o con otros jugadores</p>
        </div>
      </div>

      <div className="cuadro-estadisticas">
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