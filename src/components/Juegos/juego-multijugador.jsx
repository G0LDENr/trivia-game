import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaTrophy, FaUser, FaSpinner } from 'react-icons/fa';
import { QuestionController } from '../../controllers/preguntasController';
import { SalaController } from '../../controllers/salaController';
import "../../css/Juego/juego-multijugador.css";
import "../../css/Inicio/inicio.css";
import "../../css/Juego/juego.css";
import logo from "../../img/Logo.png";

const JuegoMultijugador = () => {
  const navigate = useNavigate();
  const { codigo } = useParams();
  
  const [sala, setSala] = useState(null);
  const [jugadorActual, setJugadorActual] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(30);
  const [temporizadorActivo, setTemporizadorActivo] = useState(true);
  const [tiempoAgotado, setTiempoAgotado] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [respuestasJugador, setRespuestasJugador] = useState([]);
  const [partidaIniciada, setPartidaIniciada] = useState(false);
  const [oponentes, setOponentes] = useState([]);
  const [feedbackMensaje, setFeedbackMensaje] = useState(null);
  const [esperandoFeedback, setEsperandoFeedback] = useState(false);
  const [jugadorTermino, setJugadorTermino] = useState(false);
  const [esperandoOponentes, setEsperandoOponentes] = useState(false);
  const [salaCancelada, setSalaCancelada] = useState(false);
  const [jugadorSalio, setJugadorSalio] = useState(null);
  
  const ultimosJugadoresRef = useRef([]); // Ahora guardamos objetos completos, no solo IDs
  
  const TIEMPO_LIMITE = 30;
  const TOTAL_PREGUNTAS = 15;

  const CATEGORIAS = {
    VIDEOJUEGOS: '420fef18-a673-4be3-8169-7bb20efb68a4',
    AUTOS: '2c783dce-a1f9-49a8-aa4d-bed766ed1928',
    COMIDA: 'ee7a72b3-bf94-424c-9580-d38db9ba73d3'
  };

  useEffect(() => {
    const usuario = localStorage.getItem('usuarioActual');
    if (!usuario) {
      navigate('/login');
      return;
    }
    setJugadorActual(JSON.parse(usuario));
  }, [navigate]);

  useEffect(() => {
    if (sala && sala.jugadores && ultimosJugadoresRef.current.length === 0) {
      ultimosJugadoresRef.current = sala.jugadores.map(j => ({ id: j.id, nombre: j.nombre }));
    }
  }, [sala]);

  const cargarSala = async () => {
    const result = await SalaController.getSalaByCodigo(codigo);
    
    if (!result.success || !result.data) {
      if (!salaCancelada) {
        setSalaCancelada(true);
        setJugadorSalio(null);
        setTemporizadorActivo(false);
      }
      return;
    }
    
    if (result.success && result.data) {
      const jugadorAunEnSala = result.data.jugadores?.find(j => j.id === jugadorActual?.id);
      if (!jugadorAunEnSala && jugadorActual && !salaCancelada) {
        setSalaCancelada(true);
        setJugadorSalio(null);
        setTemporizadorActivo(false);
        return;
      }
      
      // Detectar si alguien se salió comparando los objetos completos
      const jugadoresActuales = result.data.jugadores?.map(j => ({ id: j.id, nombre: j.nombre })) || [];
      const jugadoresAnteriores = ultimosJugadoresRef.current;
      
      if (jugadoresAnteriores.length > 0 && jugadoresActuales.length < jugadoresAnteriores.length) {
        const jugadorQueSalio = jugadoresAnteriores.find(
          jAntiguo => !jugadoresActuales.some(jActual => jActual.id === jAntiguo.id)
        );
        
        if (jugadorQueSalio && jugadorQueSalio.id !== jugadorActual?.id) {
          setSalaCancelada(true);
          setJugadorSalio(jugadorQueSalio.nombre);
          setTemporizadorActivo(false);
          return;
        }
      }
      
      // Actualizar el ref con los jugadores actuales
      ultimosJugadoresRef.current = jugadoresActuales;
      
      setSala(result.data);
      
      if (result.data.jugadores && jugadorActual) {
        const otros = result.data.jugadores.filter(j => j.id !== jugadorActual.id);
        setOponentes(otros);
        
        const jugadorEnSala = result.data.jugadores.find(j => j.id === jugadorActual.id);
        const yoComplete = jugadorEnSala?.completado === true;
        const todosCompletaron = result.data.jugadores.every(j => j.completado === true);
        
        if (yoComplete && !todosCompletaron && !jugadorTermino && !mostrarResultados) {
          setJugadorTermino(true);
          setEsperandoOponentes(true);
          setTemporizadorActivo(false);
        }
        
        if (yoComplete && todosCompletaron && !mostrarResultados) {
          setEsperandoOponentes(false);
          setMostrarResultados(true);
          setTemporizadorActivo(false);
        }
      }
      
      if (result.data.estado === 'jugando' && !partidaIniciada) {
        setPartidaIniciada(true);
      }
      
      if (result.data.estado === 'terminado' && !mostrarResultados) {
        setMostrarResultados(true);
        setTemporizadorActivo(false);
        setEsperandoOponentes(false);
      }
    }
  };

  useEffect(() => {
    if (salaCancelada) {
      const timer = setTimeout(() => {
        navigate('/multijugador');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [salaCancelada, navigate]);

  const cargarPreguntas = useCallback(async () => {
    try {
      const result = await QuestionController.getAllQuestions();
      
      if (result.success && result.data && result.data.length > 0) {
        const preguntasVideojuegos = result.data.filter(q => q.categoria_id === CATEGORIAS.VIDEOJUEGOS);
        const preguntasAutos = result.data.filter(q => q.categoria_id === CATEGORIAS.AUTOS);
        const preguntasComida = result.data.filter(q => q.categoria_id === CATEGORIAS.COMIDA);
        
        let seleccionadas = [
          ...preguntasVideojuegos.slice(0, 5),
          ...preguntasAutos.slice(0, 5),
          ...preguntasComida.slice(0, 5)
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
            respuestas: respuestasArray,
            correcta: correcta
          };
        });
        
        setPreguntas(preguntasFormateadas.slice(0, TOTAL_PREGUNTAS));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (codigo) {
      cargarSala();
      cargarPreguntas();
      const intervalo = setInterval(cargarSala, 2000);
      return () => clearInterval(intervalo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  useEffect(() => {
    if (partidaIniciada && !mostrarResultados && !jugadorTermino && preguntaActual < TOTAL_PREGUNTAS) {
      setRespuestaSeleccionada(null);
      setTiempoAgotado(false);
      setTiempoRestante(TIEMPO_LIMITE);
      setTemporizadorActivo(true);
      setEsperandoFeedback(false);
    }
  }, [preguntaActual, partidaIniciada, mostrarResultados, jugadorTermino]);

  const manejarTiempoAgotado = async () => {
    if (respuestaSeleccionada !== null) return;
    if (esperandoFeedback) return;
    if (jugadorTermino) return;
    
    setEsperandoFeedback(true);
    const puntajeObtenido = 0;
    
    setRespuestaSeleccionada(-1);
    setFeedbackMensaje({ type: 'tiempo', mensaje: '⏰ Tiempo agotado! 0 puntos' });
    
    await SalaController.actualizarRespuesta(codigo, jugadorActual.id, preguntaActual, false, puntajeObtenido, TIEMPO_LIMITE);
    
    setTimeout(() => {
      setFeedbackMensaje(null);
      setEsperandoFeedback(false);
      if (preguntaActual + 1 < TOTAL_PREGUNTAS) {
        setPreguntaActual(prev => prev + 1);
      } else {
        setJugadorTermino(true);
        setTemporizadorActivo(false);
        setEsperandoOponentes(true);
      }
    }, 1500);
  };

  useEffect(() => {
    let intervalo;
    
    if (temporizadorActivo && partidaIniciada && !mostrarResultados && !esperandoFeedback && !jugadorTermino && !salaCancelada && tiempoRestante > 0 && respuestaSeleccionada === null && !tiempoAgotado && preguntaActual < TOTAL_PREGUNTAS) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporizadorActivo, partidaIniciada, mostrarResultados, esperandoFeedback, jugadorTermino, salaCancelada, tiempoRestante, respuestaSeleccionada, tiempoAgotado, preguntaActual]);

  const calcularPuntaje = (esCorrecta, tiempoUsado) => {
    if (!esCorrecta) return 0;
    let puntaje = 100;
    const porcentajeTiempo = tiempoUsado / TIEMPO_LIMITE;
    if (porcentajeTiempo < 0.3) puntaje += 50;
    else if (porcentajeTiempo < 0.6) puntaje += 20;
    return puntaje;
  };

  const handleRespuestaClick = async (indice) => {
    if (respuestaSeleccionada !== null) return;
    if (tiempoAgotado) return;
    if (esperandoFeedback) return;
    if (jugadorTermino) return;
    
    setEsperandoFeedback(true);
    setRespuestaSeleccionada(indice);
    setTemporizadorActivo(false);
    
    const tiempoUsado = TIEMPO_LIMITE - tiempoRestante;
    const esCorrecta = (indice === preguntas[preguntaActual].correcta);
    const puntajeObtenido = calcularPuntaje(esCorrecta, tiempoUsado);
    
    if (esCorrecta) {
      setFeedbackMensaje({ type: 'correcto', mensaje: `✓ Correcto! +${puntajeObtenido} puntos` });
    } else {
      setFeedbackMensaje({ type: 'incorrecto', mensaje: `✗ Incorrecto! 0 puntos` });
    }
    
    setPuntajeTotal(prev => prev + puntajeObtenido);
    setRespuestasJugador(prev => [...prev, { esCorrecta, puntaje: puntajeObtenido }]);
    
    await SalaController.actualizarRespuesta(codigo, jugadorActual.id, preguntaActual, esCorrecta, puntajeObtenido, tiempoUsado);
    
    setTimeout(() => {
      setFeedbackMensaje(null);
      setEsperandoFeedback(false);
      if (preguntaActual + 1 < TOTAL_PREGUNTAS) {
        setPreguntaActual(prev => prev + 1);
      } else {
        setJugadorTermino(true);
        setTemporizadorActivo(false);
        setEsperandoOponentes(true);
      }
    }, 1500);
  };

  const getClaseRespuesta = (indice) => {
    if (respuestaSeleccionada === null && !tiempoAgotado && !jugadorTermino && !salaCancelada) {
      return "respuesta-boton";
    }
    
    if (indice === preguntas[preguntaActual]?.correcta) {
      return "respuesta-boton respuesta-correcta";
    }
    
    if (respuestaSeleccionada === indice && indice !== preguntas[preguntaActual]?.correcta) {
      return "respuesta-boton respuesta-incorrecta";
    }
    
    if (tiempoAgotado && indice === preguntas[preguntaActual]?.correcta) {
      return "respuesta-boton respuesta-correcta";
    }
    
    return "respuesta-boton";
  };

  const salirSala = async () => {
    await SalaController.salirSala(codigo, jugadorActual?.id);
    navigate('/multijugador');
  };

  const obtenerGanador = () => {
    if (!sala?.jugadores) return null;
    
    let mejorJugador = null;
    let mejorPuntaje = -1;
    
    for (const jugador of sala.jugadores) {
      if (jugador.puntaje > mejorPuntaje) {
        mejorPuntaje = jugador.puntaje;
        mejorJugador = jugador;
      }
    }
    
    return mejorJugador;
  };

  if (salaCancelada) {
    return (
      <div className="multijugador-container">
        <button className="btn-volver-sala" onClick={() => navigate('/multijugador')}>
          <FaArrowLeft />
        </button>
        <div className="sala-cancelada-container">
          <h2>Partida Cancelada</h2>
          <p>
            <strong>El jugador: {jugadorSalio || 'Desconocido'}</strong> se ha salido de la partida
          </p>
          <button className="btn-volver-inicio" onClick={() => navigate('/multijugador')}>
            Volver al multijugador
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="multijugador-container">
        <button className="btn-volver-sala" onClick={salirSala}>
          <FaArrowLeft />
        </button>
        <div className="loading-simple">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!partidaIniciada) {
    return (
      <div className="multijugador-container">
        <button className="btn-volver-sala" onClick={salirSala}>
          <FaArrowLeft />
        </button>
        <div className="loading-simple">
          <p>Esperando al creador...</p>
        </div>
      </div>
    );
  }

  if (esperandoOponentes && !mostrarResultados) {
    return (
      <div className="multijugador-container">
        <button className="btn-volver-sala" onClick={salirSala}>
          <FaArrowLeft />
        </button>
        <div className="esperando-container">
          <FaSpinner className="spinner-grande" />
          <h2>¡Completaste todas las preguntas!</h2>
          <p>Esperando a que los demás jugadores terminen...</p>
          <div className="oponentes-estado">
            {oponentes.map((oponente, idx) => (
              <div key={idx} className="oponente-espera">
                <FaUser />
                <span>{oponente.nombre}</span>
                {oponente.completado ? (
                  <span className="completado-badge">✓ Completado</span>
                ) : (
                  <span className="esperando-badge">⏳ Respondiendo...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mostrarResultados) {
    const ganador = obtenerGanador();
    const esGanador = ganador?.id === jugadorActual?.id;
    const todosJugadores = sala?.jugadores || [];
    
    return (
      <div className="multijugador-container">
        <button className="btn-volver-sala" onClick={() => navigate('/multijugador')}>
          <FaArrowLeft />
        </button>

        <div className="resultados-container-multi">
          <h1 className="resultados-titulo-multi">RESULTADO FINAL</h1>
          
          {esGanador ? (
            <div className="ganador-mensaje">
              <FaTrophy className="ganador-icono" />
              <p>¡FELICIDADES! <br /> <strong>HAS GANADO LA PARTIDA</strong></p>
            </div>
          ) : (
            <div className="perdedor-mensaje">
              <p>El ganador es: <strong>{ganador?.nombre}</strong></p>
            </div>
          )}
          
          <div className="jugadores-resultados">
            {todosJugadores.map((jugador, idx) => (
              <div key={idx} className={`jugador-resultado-card ${jugador.id === ganador?.id ? 'ganador' : ''}`}>
                <div className="jugador-resultado-avatar">
                  <FaUser />
                </div>
                <div className="jugador-resultado-info">
                  <span className="jugador-resultado-nombre">{jugador.nombre}</span>
                  <span className="jugador-resultado-puntos">{jugador.puntaje} pts</span>
                  <span className="jugador-resultado-aciertos">{jugador.respuestas?.filter(r => r.esCorrecta).length || 0}/{TOTAL_PREGUNTAS} aciertos</span>
                </div>
                {jugador.id === ganador?.id && <FaTrophy className="jugador-resultado-trophy" />}
              </div>
            ))}
          </div>
          
          <div className="botones-resultados-multi">
            <button className="btn-volver-inicio" onClick={() => navigate('/inicio')}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progreso = ((preguntaActual + 1) / TOTAL_PREGUNTAS) * 100;
  const porcentajeTiempo = (tiempoRestante / TIEMPO_LIMITE) * 100;
  const colorTiempo = tiempoRestante > 15 ? '#1da74a' : (tiempoRestante > 5 ? '#1c68f1' : '#f44336');

  return (
    <div className="multijugador-container">
      <button className="btn-volver-sala" onClick={salirSala}>
        <FaArrowLeft />
      </button>

      <div className="juego-multijugador-content">
        <div className="logo-superior">
          <img src={logo} alt="Logo" />
        </div>

        <h1 className="inicio-title">TRIVIA</h1>

        <div className="puntaje-propio">
          <span className="puntaje-vivo-puntos">{puntajeTotal} pts</span>
          <span className="puntaje-vivo-progreso">{respuestasJugador.length}/{TOTAL_PREGUNTAS}</span>
        </div>

        <div className="progreso-container">
          <div className="progreso-info">
            <span className="pregunta-label">PREGUNTA {preguntaActual + 1} de {TOTAL_PREGUNTAS}</span>
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

        <div className="pregunta-cuadro">
          <h2 className="pregunta-texto">{preguntas[preguntaActual]?.texto}</h2>
        </div>

        <div className="respuestas-container">
          {preguntas[preguntaActual]?.respuestas.map((respuesta, index) => (
            <button
              key={`${preguntaActual}-${index}`}
              className={getClaseRespuesta(index)}
              onClick={() => handleRespuestaClick(index)}
              disabled={respuestaSeleccionada !== null || tiempoAgotado || esperandoFeedback || jugadorTermino || salaCancelada}
            >
              <span className="respuesta-letra">{String.fromCharCode(65 + index)}.</span>
              {respuesta}
            </button>
          ))}
        </div>

        {feedbackMensaje && (
          <div className={`respuesta-feedback ${feedbackMensaje.type}`}>
            <p>{feedbackMensaje.mensaje}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JuegoMultijugador;