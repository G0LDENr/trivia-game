import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaArrowRight, FaArrowLeft, FaCheck, FaTimes, FaClock, FaInfoCircle } from "react-icons/fa";
import { QuestionController } from '../../controllers/preguntasController';
import "../../css/Inicio/inicio.css";
import "../../css/Juego/juego.css";
import "../../css/Juego/juego-solo.css";
import logo from "../../img/Logo.png";

const JuegoSolo = () => {
  const navigate = useNavigate();
  
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [respuestasUsuario, setRespuestasUsuario] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [mostrarReglas, setMostrarReglas] = useState(true);
  
  // Estados para el temporizador
  const [tiempoRestante, setTiempoRestante] = useState(30);
  const [temporizadorActivo, setTemporizadorActivo] = useState(true);
  const [tiempoAgotado, setTiempoAgotado] = useState(false);
  
  // Puntuación base por pregunta
  const PUNTUACION_BASE = 100;
  const TIEMPO_LIMITE = 30;

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
            correcta: correcta,
            puntajeObtenido: 0
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

  const calcularPuntaje = (esCorrecta, tiempoUsado, pistaUsada) => {
    if (!esCorrecta) return 0;
    
    let puntaje = PUNTUACION_BASE;
    const porcentajeTiempo = tiempoUsado / TIEMPO_LIMITE;
    if (porcentajeTiempo < 0.3) {
      puntaje += 50;
    } else if (porcentajeTiempo < 0.6) {
      puntaje += 20;
    }
    
    if (pistaUsada) {
      puntaje -= 30;
    }
    
    return Math.max(0, puntaje);
  };

  const manejarTiempoAgotado = useCallback(() => {
    if (respuestaSeleccionada !== null) return;
    
    const pregunta = preguntas[preguntaActual];
    if (!pregunta) return;
    
    const puntajeObtenido = 0;
    
    setRespuestasUsuario(prev => [...prev, {
      pregunta: pregunta.texto,
      esCorrecta: false,
      puntaje: puntajeObtenido
    }]);
    
    setPuntajeTotal(prev => prev + puntajeObtenido);
    
    setPreguntas(prev => {
      const nuevas = [...prev];
      if (nuevas[preguntaActual]) {
        nuevas[preguntaActual].puntajeObtenido = puntajeObtenido;
      }
      return nuevas;
    });
  }, [preguntas, preguntaActual, respuestaSeleccionada]);

  useEffect(() => {
    let intervalo;
    
    if (temporizadorActivo && !mostrarResultados && tiempoRestante > 0 && respuestaSeleccionada === null && !tiempoAgotado && !mostrarReglas) {
      intervalo = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            clearInterval(intervalo);
            setTemporizadorActivo(false);
            setTiempoAgotado(true);
            manejarTiempoAgotado();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(intervalo);
  }, [temporizadorActivo, mostrarResultados, respuestaSeleccionada, tiempoRestante, tiempoAgotado, manejarTiempoAgotado, mostrarReglas]);

  const handleRespuestaClick = (indice) => {
    if (respuestaSeleccionada !== null) return;
    if (tiempoAgotado) return;
    
    setRespuestaSeleccionada(indice);
    setTemporizadorActivo(false);
    
    const tiempoUsado = TIEMPO_LIMITE - tiempoRestante;
    const esCorrecta = (indice === preguntas[preguntaActual].correcta);
    const puntajeObtenido = calcularPuntaje(esCorrecta, tiempoUsado, mostrarPista);
    
    setRespuestasUsuario(prev => [...prev, {
      pregunta: preguntas[preguntaActual].texto,
      esCorrecta: esCorrecta,
      puntaje: puntajeObtenido
    }]);
    
    setPuntajeTotal(prev => prev + puntajeObtenido);
    
    setPreguntas(prev => {
      const nuevas = [...prev];
      nuevas[preguntaActual].puntajeObtenido = puntajeObtenido;
      return nuevas;
    });
  };

  const handleSiguiente = () => {
    if (respuestaSeleccionada === null && !tiempoAgotado) {
      return;
    }
    
    if (preguntaActual + 1 < preguntas.length) {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaSeleccionada(null);
      setMostrarPista(false);
      setTiempoRestante(TIEMPO_LIMITE);
      setTemporizadorActivo(true);
      setTiempoAgotado(false);
    } else {
      setMostrarResultados(true);
    }
  };

  const handlePista = () => {
    if (!mostrarPista && respuestaSeleccionada === null && !tiempoAgotado) {
      setMostrarPista(true);
    } else {
      setMostrarPista(!mostrarPista);
    }
  };

  const getClaseRespuesta = (indice) => {
    if (respuestaSeleccionada === null && !tiempoAgotado) {
      return "respuesta-boton";
    }
    
    if (indice === preguntas[preguntaActual].correcta) {
      return "respuesta-boton respuesta-correcta";
    }
    
    if (respuestaSeleccionada === indice && indice !== preguntas[preguntaActual].correcta) {
      return "respuesta-boton respuesta-incorrecta";
    }
    
    if (tiempoAgotado && indice === preguntas[preguntaActual].correcta) {
      return "respuesta-boton respuesta-correcta";
    }
    
    return "respuesta-boton";
  };

  const handleReiniciar = () => {
    setPreguntaActual(0);
    setRespuestaSeleccionada(null);
    setMostrarPista(false);
    setRespuestasUsuario([]);
    setMostrarResultados(false);
    setPuntajeTotal(0);
    setTiempoRestante(TIEMPO_LIMITE);
    setTemporizadorActivo(true);
    setTiempoAgotado(false);
    setMostrarReglas(true);
    cargarPreguntas();
  };

  const handleCerrarReglas = () => {
    setMostrarReglas(false);
  };

  const respuestasCorrectas = respuestasUsuario.filter(r => r.esCorrecta).length;
  const respuestasIncorrectas = respuestasUsuario.filter(r => !r.esCorrecta).length;
  const porcentaje = preguntas.length > 0 ? Math.round((respuestasCorrectas / preguntas.length) * 100) : 0;
  const pistaUsadaCount = respuestasUsuario.filter(r => r.usoPista).length;
  const puntajeMaximoPosible = preguntas.length * PUNTUACION_BASE;

  if (loading) {
    return (
      <div className="juego-solo-container">
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
      <div className="juego-solo-container">
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
      <div className="juego-solo-container">
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
  const porcentajeTiempo = (tiempoRestante / TIEMPO_LIMITE) * 100;
  const colorTiempo = tiempoRestante > 15 ? '#1da74a' : (tiempoRestante > 5 ? '#1c68f1' : '#1c68f1');

  // Pantalla de reglas
  if (mostrarReglas) {
    return (
      <div className="juego-solo-container">
        <div className="boton-regreso" onClick={() => navigate('/inicio')}>
          <FaArrowLeft className="icono-flecha" />
        </div>
        <div className="reglas-container">
          <div className="reglas-cuadro">
            <FaInfoCircle className="reglas-icono" />
            <h2 className="reglas-titulo">REGLAS DEL JUEGO</h2>
            <div className="reglas-lista">
              <div className="regla-item">
                <span className="regla-numero">1</span>
                <p>Tienes <strong>30 segundos</strong> para responder cada pregunta</p>
              </div>
              <div className="regla-item">
                <span className="regla-numero">2</span>
                <p>Cada respuesta correcta vale <strong>100 puntos</strong></p>
              </div>
              <div className="regla-item">
                <span className="regla-numero">3</span>
                <p>Respuesta muy rápida (menos de 9 segundos): <strong>+50 puntos</strong></p>
              </div>
              <div className="regla-item">
                <span className="regla-numero">4</span>
                <p>Respuesta rápida (menos de 18 segundos): <strong>+20 puntos</strong></p>
              </div>
              <div className="regla-item">
                <span className="regla-numero">5</span>
                <p>Usar pista: <strong>-30 puntos</strong></p>
              </div>
              <div className="regla-item">
                <span className="regla-numero">6</span>
                <p>Si el tiempo se agota: <strong>0 puntos</strong></p>
              </div>
            </div>
            <button className="btn-comenzar" onClick={handleCerrarReglas}>
              ¡COMENZAR!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de resultados
  if (mostrarResultados) {
    return (
      <div className="juego-solo-container">
        <div className="boton-regreso" onClick={() => navigate('/inicio')}>
          <FaArrowLeft className="icono-flecha" />
        </div>

        <div className="resultados-container">
          <h1 className="resultados-titulo">RESULTADO FINAL</h1>
          <p className="resultados-mensaje">¡Completaste el desafío en solitario!</p>
          
          <div className="resultados-cuadro-blanco">
            <h2 className="puntaje-titulo">PUNTAJE TOTAL</h2>
            
            <div className="puntaje-grande">
              <span className="puntaje-numero">{puntajeTotal}</span>
              <span className="puntaje-maximo"> / {puntajeMaximoPosible}</span>
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
                  <FaClock className="icono-reloj" />
                </div>
                <div className="icono-numero">{(preguntas.length - respuestasCorrectas - respuestasIncorrectas)}</div>
                <div className="icono-label">Tiempo</div>
              </div>
            </div>
            
            <div className="estadisticas-adicionales">
              <div className="estadistica-item">
                <span className="estadistica-label">Porcentaje:</span>
                <span className="estadistica-valor">{porcentaje}%</span>
              </div>
              <div className="estadistica-item">
                <span className="estadistica-label">Pistas usadas:</span>
                <span className="estadistica-valor">{pistaUsadaCount}</span>
              </div>
              <div className="estadistica-item">
                <span className="estadistica-label">Puntaje promedio:</span>
                <span className="estadistica-valor">{Math.round(puntajeTotal / preguntas.length)}</span>
              </div>
            </div>
          </div>
          
          <div className="detalle-preguntas">
            <h3>Detalle por pregunta</h3>
            <div className="detalle-lista">
              {respuestasUsuario.map((resp, idx) => (
                <div key={idx} className={`detalle-item ${resp.esCorrecta ? 'detalle-correcto' : 'detalle-incorrecto'}`}>
                  <div className="detalle-numero">Pregunta {idx + 1}</div>
                  <div className="detalle-puntaje">{resp.puntaje} pts</div>
                  <div className="detalle-estado">
                    {resp.esCorrecta ? <FaCheck className="icono-palomita-ok" /> : <FaTimes className="icono-tache-ok" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="botones-resultados">
            <button className="btn-intentar" onClick={handleReiniciar}>
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla principal del juego
  return (
    <div className="juego-solo-container">
      <div className="boton-regreso" onClick={() => navigate('/inicio')}>
        <FaArrowLeft className="icono-flecha" />
      </div>

      <div className="progreso-container">
        <div className="progreso-info">
          <span className="pregunta-label">PREGUNTA {preguntaActual + 1} de {preguntas.length}</span>
          <span className="preguntas-restantes">{preguntasRestantes} restantes</span>
        </div>
        <div className="barra-progreso">
          <div className="barra-progreso-lleno" style={{ width: `${progreso}%` }}></div>
        </div>
      </div>

      <div className="temporizador-container">
        <div className="temporizador-info">
          <FaClock className="temporizador-icono" />
          <span className="temporizador-label">Tiempo restante</span>
        </div>
        <div className="temporizador-barra">
          <div 
            className="temporizador-barra-lleno"
            style={{ 
              width: `${porcentajeTiempo}%`,
              backgroundColor: colorTiempo
            }}
          ></div>
        </div>
        <div className="temporizador-tiempo" style={{ color: colorTiempo }}>
          {tiempoRestante} segundos
        </div>
      </div>

      <div className="logo-superior">
        <img src={logo} alt="Logo" />
      </div>

      <h1 className="inicio-title">TRIVIA SOLO</h1>

      <div className="pregunta-cuadro">
        <h2 className="pregunta-texto">{preguntas[preguntaActual].texto}</h2>
      </div>

      <div className="respuestas-container">
        {preguntas[preguntaActual].respuestas.map((respuesta, index) => (
          <button
            key={index}
            className={getClaseRespuesta(index)}
            onClick={() => handleRespuestaClick(index)}
            disabled={respuestaSeleccionada !== null || tiempoAgotado}
          >
            <span className="respuesta-letra">{String.fromCharCode(65 + index)}.</span>
            {respuesta}
          </button>
        ))}
      </div>

      {tiempoAgotado && respuestaSeleccionada === null && (
        <div className="tiempo-agotado-mensaje">
          ⏰ ¡Tiempo agotado! La respuesta correcta era: {preguntas[preguntaActual].respuestas[preguntas[preguntaActual].correcta]}
        </div>
      )}

      <div className="acciones-container">
        <button 
          className="boton-pista" 
          onClick={handlePista}
          disabled={respuestaSeleccionada !== null || tiempoAgotado}
        >
          <FaLightbulb className="icono-pista" />
          Pista {mostrarPista && '(usada)'}
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

export default JuegoSolo;