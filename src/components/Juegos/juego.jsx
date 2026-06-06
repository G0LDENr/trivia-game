// src/components/Juego/juego.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaArrowRight, FaArrowLeft } from "react-icons/fa";
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

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await QuestionController.getAllQuestions();
      
      if (result.success && result.data && result.data.length > 0) {
        // Transformar los datos al formato que usa el componente
        const preguntasFormateadas = result.data.map(q => {
          // Ordenar respuestas por el campo 'orden'
          const respuestasOrdenadas = [...q.respuestas].sort((a, b) => a.orden - b.orden);
          
          return {
            id: q.id,
            texto: q.texto,
            pista: q.pista || 'Sin pista disponible',
            nivel: q.nivel,
            respuestas: respuestasOrdenadas.map(r => r.texto),
            correcta: respuestasOrdenadas.findIndex(r => r.es_correcta === true)
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
  };

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

  const handleReiniciar = () => {
    setPreguntaActual(0);
    setRespuestaSeleccionada(null);
    setMostrarPista(false);
    setRespuestasUsuario([]);
    setMostrarResultados(false);
  };

  // Si quieres mantener la pantalla de resultados, agrégala aquí
  if (mostrarResultados) {
    const respuestasCorrectas = respuestasUsuario.filter(r => r.esCorrecta).length;
    return (
      <div className="juego-container">
        <div className="boton-regreso" onClick={() => navigate('/inicio')}>
          <FaArrowLeft className="icono-flecha" />
        </div>
        <div className="resultados-container">
          <h1>Resultados</h1>
          <p>Respuestas correctas: {respuestasCorrectas} de {preguntas.length}</p>
          <button onClick={handleReiniciar}>Jugar de nuevo</button>
          <button onClick={() => navigate('/inicio')}>Volver al inicio</button>
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