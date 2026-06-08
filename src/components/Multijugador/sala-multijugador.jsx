import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaDoorOpen } from 'react-icons/fa';
import { SalaController } from '../../controllers/salaController';
import '../../css/Multijugador/multijugador.css';

const Multijugador = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [crearSala, setCrearSala] = useState(false);
  const [unirseSala, setUnirseSala] = useState(false);
  const [nombreSala, setNombreSala] = useState('');
  const [codigoSala, setCodigoSala] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const usuario = localStorage.getItem('usuarioActual');
    if (!usuario) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(usuario));
  }, [navigate]);

  const handleCrearSala = async () => {
    if (!nombreSala.trim()) {
      setError('Ingresa un nombre para la sala');
      return;
    }

    setError('');

    const result = await SalaController.crearSala({
      nombreSala: nombreSala.trim(),
      creadorId: user.id,
      creadorNombre: user.name,
      categoria: 'todas',
      maxJugadores: 4,
      preguntasPorJugador: 5
    });

    if (result.success) {
      navigate(`/multijugador/sala/${result.data.codigo}`);
    } else {
      setError(result.error);
    }
  };

  const handleUnirseSala = async () => {
    if (!codigoSala.trim()) {
      setError('Ingresa el código de la sala');
      return;
    }

    setError('');

    const result = await SalaController.unirseSala(codigoSala.toUpperCase(), {
      id: user.id,
      nombre: user.name
    });

    if (result.success) {
      navigate(`/multijugador/sala/${result.data.codigo}`);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="multijugador-container">
      <button className="btn-volver-multi" onClick={() => navigate('/inicio')}>
        <FaArrowLeft />
      </button>

      <div className="multijugador-content">
        <h1 className="multijugador-titulo">MULTIJUGADOR</h1>
        <p className="multijugador-subtitulo">Juega con amigos o con otros jugadores</p>

        {error && <div className="error-message">{error}</div>}

        <div className="opciones-multijugador">
          {!crearSala && !unirseSala && (
            <>
              <button className="btn-crear-sala" onClick={() => setCrearSala(true)}>
                <FaPlus /> Crear sala
              </button>
              <button className="btn-unirse-sala" onClick={() => setUnirseSala(true)}>
                <FaDoorOpen /> Unirse a sala
              </button>
            </>
          )}

          {crearSala && (
            <div className="form-crear-sala">
              <h3>Crear nueva sala</h3>
              <input
                type="text"
                placeholder="Nombre de la sala"
                value={nombreSala}
                onChange={(e) => setNombreSala(e.target.value)}
                maxLength={50}
                autoFocus
              />
              <div className="form-buttons">
                <button className="btn-cancelar" onClick={() => setCrearSala(false)}>
                  Cancelar
                </button>
                <button className="btn-confirmar" onClick={handleCrearSala}>
                  Crear
                </button>
              </div>
            </div>
          )}

          {unirseSala && (
            <div className="form-unirse-sala">
              <h3>Unirse a sala</h3>
              <input
                type="text"
                placeholder="Código de 6 caracteres"
                value={codigoSala}
                onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
                maxLength={6}
                autoFocus
              />
              <div className="form-buttons">
                <button className="btn-cancelar" onClick={() => setUnirseSala(false)}>
                  Cancelar
                </button>
                <button className="btn-confirmar" onClick={handleUnirseSala}>
                  Unirse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Multijugador;