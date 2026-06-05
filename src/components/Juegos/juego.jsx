import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaArrowRight, FaArrowLeft, FaCog, FaCheck, FaTimes, FaTrophy } from "react-icons/fa";
import "../../css/Inicio/inicio.css";
import "../../css/Juego/juego.css";
import logo from "../../img/Logo.png";

const Juego = () => {
  const navigate = useNavigate();
  
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [respuestasUsuario, setRespuestasUsuario] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  
  const preguntas = [
    {
      texto: "¿Cuál es la capital de Japón?",
      respuestas: ["Seúl", "Pekín", "Tokio", "Bangkok"],
      correcta: 2,
      pista: "Es una ciudad conocida por su tecnología y cultura pop"
    },
    {
      texto: "¿Quién pintó la Mona Lisa?",
      respuestas: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"],
      correcta: 2,
      pista: "Fue un polímata del Renacimiento"
    },
    {
      texto: "¿Cuál es el planeta más grande del sistema solar?",
      respuestas: ["Marte", "Júpiter", "Saturno", "Neptuno"],
      correcta: 1,
      pista: "Es conocido por su Gran Mancha Roja"
    },
    {
      texto: "¿En qué año llegó el hombre a la Luna?",
      respuestas: ["1967", "1968", "1969", "1970"],
      correcta: 2,
      pista: "El Apolo 11 fue la misión"
    },
    {
      texto: "¿Quién escribió 'Cien años de soledad'?",
      respuestas: ["Mario Vargas Llosa", "Julio Cortázar", "Gabriel García Márquez", "Pablo Neruda"],
      correcta: 2,
      pista: "Fue un autor colombiano, premio Nobel"
    },
    {
      texto: "¿Cuál es el océano más grande del mundo?",
      respuestas: ["Atlántico", "Índico", "Ártico", "Pacífico"],
      correcta: 3,
      pista: "Cubre aproximadamente el 30% de la superficie terrestre"
    },
    {
      texto: "¿Qué país tiene la población más grande del mundo?",
      respuestas: ["India", "Estados Unidos", "Indonesia", "China"],
      correcta: 0,
      pista: "Superó a China en 2023"
    }
  ];

  const preguntasRestantes = preguntas.length - preguntaActual - 1;
  const progreso = ((preguntaActual + 1) / preguntas.length) * 100;

  const handleRespuestaClick = (indice) => {
    if (respuestaSeleccionada !== null) return;
    
    setRespuestaSeleccionada(indice);
    
    const esCorrecta = (indice === preguntas[preguntaActual].correcta);
    setRespuestasUsuario([...respuestasUsuario, {
      pregunta: preguntas[preguntaActual].texto,
      respuestaSeleccionada: indice,
      respuestaCorrecta: preguntas[preguntaActual].correcta,
      esCorrecta: esCorrecta,
      respuestaTexto: preguntas[preguntaActual].respuestas[indice],
      respuestaCorrectaTexto: preguntas[preguntaActual].respuestas[preguntas[preguntaActual].correcta]
    }]);
  };

  const handleSiguiente = () => {
    if (respuestaSeleccionada === null) {
      alert("Por favor selecciona una respuesta");
      return;
    }
    
    if (preguntaActual + 1 < preguntas.length) {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaSeleccionada(null);
      setMostrarPista(false);
    } else {
      setMostrarResultados(true);
    }
  };

  const handlePista = () => {
    setMostrarPista(!mostrarPista);
  };

  const getClaseRespuesta = (indice) => {
    if (respuestaSeleccionada === null) {
      return "respuesta-boton";
    }
    
    if (indice === preguntas[preguntaActual].correcta) {
      return "respuesta-boton respuesta-correcta";
    }
    
    if (respuestaSeleccionada === indice && indice !== preguntas[preguntaActual].correcta) {
      return "respuesta-boton respuesta-incorrecta";
    }
    
    return "respuesta-boton";
  };

  const respuestasCorrectas = respuestasUsuario.filter(r => r.esCorrecta).length;
  const respuestasIncorrectas = respuestasUsuario.length - respuestasCorrectas;
  const porcentaje = Math.round((respuestasCorrectas / preguntas.length) * 100);
  // Variable grados eliminada porque no se usa

  const handleReiniciar = () => {
    setPreguntaActual(0);
    setRespuestaSeleccionada(null);
    setMostrarPista(false);
    setRespuestasUsuario([]);
    setMostrarResultados(false);
  };

  if (mostrarResultados) {
    return (
      <div className="juego-container">
        <div className="boton-regreso" onClick={() => navigate('/inicio')}>
          <FaArrowLeft className="icono-flecha" />
        </div>

        <div className="boton-configuracion" onClick={() => navigate('/configuracion')}>
          <FaCog className="icono-engranaje" />
        </div>

        <div className="resultados-container">
          <h1 className="resultados-titulo">RESULTADO</h1>
          <p className="resultados-mensaje">¡Bien hecho! Terminaste la trivia.</p>
          
          <div className="resultados-cuadro-blanco">
            <h2 className="puntaje-titulo">TU PUNTAJE</h2>
            
            <div className="circulo-progreso-container">
              <svg className="circulo-progreso-svg" viewBox="0 0 200 200">
                <circle 
                  className="circulo-bg"
                  cx="100" 
                  cy="100" 
                  r="90"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="6"
                />
                <circle 
                  className="circulo-verde"
                  cx="100" 
                  cy="100" 
                  r="90"
                  fill="none"
                  stroke="#1da74a"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - respuestasCorrectas / preguntas.length)}`}
                  transform="rotate(-90 100 100)"
                />
                <text x="100" y="85" textAnchor="middle" className="circulo-texto-grande">
                  {respuestasCorrectas}
                </text>
                <text x="100" y="115" textAnchor="middle" className="circulo-texto-pequeno">
                  de {preguntas.length}
                </text>
              </svg>
            </div>
            
            <div className="linea-divisora"></div>
            
            <div className="iconos-estadisticas">
              <div className="icono-item">
                <div className="icono-circulo-verde">
                  <FaCheck className="icono-palomita" />
                </div>
                <div className="icono-numero">{respuestasCorrectas}</div>
                <div className="icono-label">Correctas</div>
              </div>
              
              <div className="icono-item">
                <div className="icono-circulo-rojo">
                  <FaTimes className="icono-tache" />
                </div>
                <div className="icono-numero">{respuestasIncorrectas}</div>
                <div className="icono-label">Incorrectas</div>
              </div>
              
              <div className="icono-item">
                <div className="icono-circulo-azul">
                  <FaTrophy className="icono-copa" />
                </div>
                <div className="icono-numero">{porcentaje}%</div>
                <div className="icono-label">Porcentaje</div>
              </div>
            </div>
          </div>
          
          <div className="botones-resultados">
            <button className="btn-intentar" onClick={handleReiniciar}>
              Intentar de nuevo
            </button>
            <button className="btn-volver" onClick={() => navigate('/inicio')}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="juego-container">
      <div className="boton-regreso" onClick={() => navigate('/inicio')}>
        <FaArrowLeft className="icono-flecha" />
      </div>

      <div className="boton-configuracion" onClick={() => navigate('/configuracion')}>
        <FaCog className="icono-engranaje" />
      </div>

      <div className="progreso-container">
        <div className="progreso-info">
          <span className="pregunta-label">PREGUNTA</span>
          <span className="preguntas-restantes">{preguntasRestantes} restantes</span>
        </div>
        <div className="barra-progreso">
          <div className="barra-progreso-lleno" style={{ width: `${progreso}%` }}></div>
        </div>
      </div>

      <div className="logo-superior">
        <img src={logo} alt="Logo" />
      </div>

      <h1 className="inicio-title">TRIVIA</h1>

      <div className="pregunta-cuadro">
        <h2 className="pregunta-texto">{preguntas[preguntaActual].texto}</h2>
      </div>

      <div className="respuestas-container">
        {preguntas[preguntaActual].respuestas.map((respuesta, index) => (
          <button
            key={index}
            className={getClaseRespuesta(index)}
            onClick={() => handleRespuestaClick(index)}
            disabled={respuestaSeleccionada !== null}
          >
            <span className="respuesta-letra">{String.fromCharCode(65 + index)}.</span>
            {respuesta}
          </button>
        ))}
      </div>

      <div className="acciones-container">
        <button className="boton-pista" onClick={handlePista}>
          <FaLightbulb className="icono-pista" />
          Pista
        </button>
        
        <button className="boton-siguiente" onClick={handleSiguiente}>
          Siguiente
          <FaArrowRight className="icono-siguiente" />
        </button>
      </div>

      {mostrarPista && (
        <div className="pista-panel">
          <p className="pista-texto">
            <strong>💡 Pista:</strong> {preguntas[preguntaActual].pista}
          </p>
        </div>
      )}
    </div>
  );
};

export default Juego;