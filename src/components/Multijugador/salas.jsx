import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaCopy, FaCheck, FaPlay, FaExclamationTriangle } from 'react-icons/fa';
import { SalaController } from '../../controllers/salaController';
import '../../css/Multijugador/sala-multijugador.css';

const SalaEspera = () => {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const [sala, setSala] = useState(null);
  const [jugadorActual, setJugadorActual] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
      if (result.data.estado === 'jugando') {
        navigate(`/multijugador/juego/${codigo}`);
      }
    } else if (result.error) {
      setError('La sala ya no existe');
      setTimeout(() => navigate('/multijugador'), 2000);
    }
    setCargando(false);
  }, [codigo, navigate]);

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
              <div key={idx} className="jugador-card">
                <div className="jugador-avatar">
                  <FaUser />
                </div>
                <div className="jugador-info">
                  <span className="jugador-nombre">{jugador.nombre}</span>
                  {jugador.id === sala?.creador_id && <span className="badge-creador">Creador</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sala-acciones">
          {esCreador && hayDosJugadores && (
            <button className="btn-iniciar" onClick={iniciarPartida}>
              <FaPlay /> Iniciar partida
            </button>
          )}
          
          {esCreador && !hayDosJugadores && (
            <p className="esperando-texto">Esperando más jugadores... (mínimo 2)</p>
          )}
          
          {!esCreador && (
            <p className="esperando-texto">
              {hayDosJugadores 
                ? 'Esperando a que el creador inicie la partida...' 
                : 'Esperando que se unan más jugadores...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaEspera;