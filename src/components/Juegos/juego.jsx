import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaArrowRight, FaArrowLeft, FaCheck, FaTimes, FaTrophy } from "react-icons/fa";
import { QuestionController } from '../../controllers/preguntasController';
import "../../css/Inicio/inicio.css";
import "../../css/Juego/juego.css";
import logo from "../../img/Logo.png";

const Juego = () => {
  const navigate = useNavigate();
  
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [respuestasUsuario, setRespuestasUsuario] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // IDs de las categorías
  const CATEGORIAS = {
    VIDEOJUEGOS: '420fef18-a673-4be3-8169-7bb20efb68a4',
    AUTOS: '2c783dce-a1f9-49a8-aa4d-bed766ed1928',
    COMIDA: 'ee7a72b3-bf94-424c-9580-d38db9ba73d3'
  };

  const cargarPreguntas = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await QuestionController.getAllQuestions();
      
      if (result.success && result.data && result.data.length > 0) {
        
        const preguntasVideojuegos = result.data.filter(q => q.categoria_id === CATEGORIAS.VIDEOJUEGOS);
        const preguntasAutos = result.data.filter(q => q.categoria_id === CATEGORIAS.AUTOS);
        const preguntasComida = result.data.filter(q => q.categoria_id === CATEGORIAS.COMIDA);
        
        const seleccionadas = [
          ...preguntasVideojuegos.slice(0, 10),
          ...preguntasAutos.slice(0, 10),
          ...preguntasComida.slice(0, 10)
        ];
        
        for (let i = seleccionadas.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [seleccionadas[i], seleccionadas[j]] = [seleccionadas[j], seleccionadas[i]];
        }
        
        let preguntasFormateadas = seleccionadas.map(q => {
          let respuestasArray = q.respuestas.map(r => r.texto);
          const respuestaCorrectaTexto = q.respuestas.find(r => r.es_correcta === true)?.texto;
          
          for (let i = respuestasArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [respuestasArray[i], respuestasArray[j]] = [respuestasArray[j], respuestasArray[i]];
          }
          
          const correcta = respuestasArray.findIndex(r => r === respuestaCorrectaTexto);
          
          return {
            id: q.id,
            texto: q.texto,
            pista: q.pista || 'Sin pista disponible',
            nivel: q.nivel,
            categoria_id: q.categoria_id,
            respuestas: respuestasArray,
            correcta: correcta
          };
        });
        
        setPreguntas(preguntasFormateadas);
        
      } else {
        setError('No hay preguntas disponibles en la base de datos');
      }
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
      setError('Error al cargar las preguntas');
    } finally {
      setLoading(false);
    }
  }, [CATEGORIAS.VIDEOJUEGOS, CATEGORIAS.AUTOS, CATEGORIAS.COMIDA]);

  useEffect(() => {
    cargarPreguntas();
  }, [cargarPreguntas]);

  if (loading) {
    return (
      <div className="juego-container">
        <div className="boton-regreso" onClick={() => navigate('/inicio')}>
          <FaArrowLeft className="icono-flecha" />
        </div>
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner"></div>
          <p>Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="juego-container">
        <div className="boton-regreso" onClick={() => navigate('/inicio')}>
          <FaArrowLeft className="icono-flecha" />
        </div>
        <div className="error-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
          <button onClick={() => navigate('/inicio')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  if (preguntas.length === 0) {
    return (
      <div className="juego-container">
        <div className="boton-regreso" onClick={() => navigate('/inicio')}>
          <FaArrowLeft className="icono-flecha" />
        </div>
        <div className="error-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>No hay preguntas</h2>
          <p>No se encontraron preguntas en la base de datos.</p>
          <button onClick={() => navigate('/inicio')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

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

  const handleReiniciar = () => {
    setPreguntaActual(0);
    setRespuestaSeleccionada(null);
    setMostrarPista(false);
    setRespuestasUsuario([]);
    setMostrarResultados(false);
    cargarPreguntas();
  };

  if (mostrarResultados) {
    return (
      <div className="juego-container">
        <div className="boton-regreso" onClick={() => navigate('/inicio')}>
          <FaArrowLeft className="icono-flecha" />
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