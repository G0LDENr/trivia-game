import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaCopy, FaCheck, FaPlay, FaExclamationTriangle } from 'react-icons/fa';
import { SalaController } from '../../controllers/salaController';
import '../../css/Multijugador/sala-espera.css';

const SalaEspera = () => {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const [sala, setSala] = useState(null);
  const [jugadorActual, setJugadorActual] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [estoyListo, setEstoyListo] = useState(false);

  useEffect(() => {
    const usuario = localStorage.getItem('usuarioActual');
    if (!usuario) {
      navigate('/login');
      return;
    }
    setJugadorActual(JSON.parse(usuario));
  }, [navigate]);

  const cargarSala = useCallback(async () => {
    const result = await SalaController.getSalaByCodigo(codigo);
    if (result.success && result.data) {
      setSala(result.data);
      setError('');
      
      const jugador = result.data.jugadores?.find(j => j.id === jugadorActual?.id);
      setEstoyListo(jugador?.listo || false);
      
      if (result.data.estado === 'jugando') {
        navigate(`/multijugador/juego/${codigo}`);
      }
    } else if (result.error) {
      setError('La sala ya no existe');
      setTimeout(() => navigate('/multijugador'), 2000);
    }
    setCargando(false);
  }, [codigo, navigate, jugadorActual]);

  useEffect(() => {
    if (jugadorActual && codigo) {
      cargarSala();
      const intervalo = setInterval(cargarSala, 2000);
      return () => clearInterval(intervalo);
    }
  }, [jugadorActual, codigo, cargarSala]);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const marcarListo = async () => {
    const result = await SalaController.actualizarListo(codigo, jugadorActual.id, !estoyListo);
    if (result.success) {
      setEstoyListo(!estoyListo);
      setSala(result.data);
    }
  };

  const iniciarPartida = async () => {
    const result = await SalaController.iniciarPartida(codigo);
    if (result.success) {
      navigate(`/multijugador/juego/${codigo}`);
    }
  };

  const salirSala = async () => {
    await SalaController.salirSala(codigo, jugadorActual.id);
    navigate('/multijugador');
  };

  const esCreador = sala?.creador_id === jugadorActual?.id;
  const todosListos = sala?.jugadores?.length >= 2 && sala.jugadores.every(j => j.listo === true);
  const hayDosJugadores = sala?.jugadores?.length >= 2;

  if (cargando) {
    return (
      <div className="multijugador-container">
        <button className="btn-volver-sala" onClick={salirSala}>
          <FaArrowLeft />
        </button>
        <div className="loading-simple">
          <p>Cargando sala...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="multijugador-container">
        <button className="btn-volver-sala" onClick={salirSala}>
          <FaArrowLeft />
        </button>
        <div className="error-message">
          <FaExclamationTriangle style={{ marginRight: '8px' }} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="multijugador-container">
      <button className="btn-volver-sala" onClick={salirSala}>
        <FaArrowLeft />
      </button>

      <div className="sala-container">
        <div className="sala-header">
          <h1 className="sala-titulo">{sala?.nombre_sala}</h1>
          <div className="sala-codigo">
            <span>Código: <strong>{codigo}</strong></span>
            <button className="btn-copiar" onClick={copiarCodigo}>
              {copiado ? <FaCheck /> : <FaCopy />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="sala-jugadores">
          <h3>Jugadores ({sala?.jugadores?.length}/{sala?.max_jugadores})</h3>
          <div className="lista-jugadores">
            {sala?.jugadores?.map((jugador, idx) => (
              <div key={idx} className={`jugador-card ${jugador.listo ? 'listo' : ''}`}>
                <div className="jugador-avatar">
                  <FaUser />
                </div>
                <div className="jugador-info">
                  <span className="jugador-nombre">{jugador.nombre}</span>
                  {jugador.id === sala?.creador_id && <span className="badge-creador">Creador</span>}
                  {jugador.listo && <span className="badge-listo">Listo</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sala-acciones">
          {!estoyListo && (
            <button className="btn-listo" onClick={marcarListo}>
              Estoy listo
            </button>
          )}
          
          {estoyListo && (
            <button className="btn-listo" onClick={marcarListo}>
              Cancelar
            </button>
          )}
          
          {esCreador && todosListos && hayDosJugadores && (
            <button className="btn-iniciar" onClick={iniciarPartida}>
              <FaPlay /> Iniciar partida
            </button>
          )}
          
          {esCreador && !todosListos && hayDosJugadores && (
            <p className="esperando-texto">Esperando que todos los jugadores estén listos...</p>
          )}
          
          {!hayDosJugadores && (
            <p className="esperando-texto">Esperando más jugadores... (mínimo 2)</p>
          )}
          
          {!esCreador && hayDosJugadores && !todosListos && (
            <p className="esperando-texto">Esperando a que todos se pongan listos...</p>
          )}
          
          {!esCreador && hayDosJugadores && todosListos && (
            <p className="esperando-texto">Esperando a que el creador inicie la partida...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaEspera;