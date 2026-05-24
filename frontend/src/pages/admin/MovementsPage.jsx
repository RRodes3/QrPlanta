import { useEffect, useMemo, useState } from 'react';
import { getMovementRequest } from '../../api/movement.api';
import './MovementsPage.css';

function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sourceType, setSourceType] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('recent');

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getMovementRequest();
        setMovements(data);
      } catch (error) {
        console.error('Error al obtener movimientos:', error);
        setError(
          error.response?.data?.message ||
            'No se pudieron cargar los movimientos'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const normalizeText = (value) => {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/_/g, ' ')
      .toLowerCase();
  };

  const formatStageName = (stageName) => {
    return String(stageName || 'N/A').replace(/_/g, ' ');
  };

  const formatSourceType = (value) => {
    if (value === 'SCAN') return 'Escaneo';
    if (value === 'IMPORT') return 'Importación';
    return 'N/A';
  };

  const getRegisteredBy = (movement) => {
    return (
      movement.registeredByUser?.name ||
      movement.registeredByName ||
      'N/A'
    );
  };

  const filteredMovements = useMemo(() => {
    let result = [...movements];

    if (search.trim()) {
      const query = normalizeText(search);

      result = result.filter((movement) => {
        const car = movement.car || {};
        const user = movement.registeredByUser || {};

        const searchableText = [
          car.niv,
          car.qrValue,
          formatStageName(movement.stageName),
          getRegisteredBy(movement),
          user.email,
          formatSourceType(movement.sourceType),
        ]
          .map((value) => normalizeText(value))
          .join(' ');

        return searchableText.includes(query);
      });
    }

    if (selectedDate) {
      result = result.filter((movement) => {
        if (!movement.registeredAt) return false;

        const movementDate = new Date(movement.registeredAt)
          .toISOString()
          .split('T')[0];

        return movementDate === selectedDate;
      });
    }

    if (sourceType !== 'ALL') {
      result = result.filter((movement) => movement.sourceType === sourceType);
    }

    result.sort((a, b) => {
      const dateA = a.registeredAt
        ? new Date(a.registeredAt).getTime()
        : 0;

      const dateB = b.registeredAt
        ? new Date(b.registeredAt).getTime()
        : 0;

      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [movements, search, selectedDate, sourceType, sortOrder]);

  const highlightMatch = (text) => {
    const value = String(text || 'N/A');
    const query = search.trim();

    if (!query) return value;

    const lowerValue = value.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerValue.indexOf(lowerQuery);

    if (index === -1) return value;

    const before = value.slice(0, index);
    const match = value.slice(index, index + query.length);
    const after = value.slice(index + query.length);

    return (
      <>
        {before}
        <span className="movements-highlight">{match}</span>
        {after}
      </>
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDate('');
    setSourceType('ALL');
    setSortOrder('recent');
  };

  return (
    <div className="movements-page">
      <section className="movements-card">
        <div className="movements-header">
          <h1>Movimientos registrados</h1>
          <p>
            Consulta el historial general de etapas registradas dentro de la
            planta, incluyendo movimientos importados y movimientos hechos por
            escaneo.
          </p>
        </div>

        <div className="movements-filters">
          <div className="movements-filter-group">
            <label htmlFor="search">Buscar</label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="NIV, QR, etapa, operador o correo"
            />
          </div>

          <div className="movements-filter-group">
            <label htmlFor="selectedDate">Fecha</label>
            <input
              id="selectedDate"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>

          <div className="movements-filter-group">
            <label htmlFor="sourceType">Origen</label>
            <select
              id="sourceType"
              value={sourceType}
              onChange={(event) => setSourceType(event.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="SCAN">Escaneo</option>
              <option value="IMPORT">Importación</option>
            </select>
          </div>

          <div className="movements-filter-group">
            <label htmlFor="sortOrder">Orden</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="recent">Más reciente a más antiguo</option>
              <option value="oldest">Más antiguo a más reciente</option>
            </select>
          </div>
        </div>

        <div className="movements-summary-bar">
          <p>
            Total de movimientos: <strong>{movements.length}</strong>
          </p>

          <p>
            Mostrando: <strong>{filteredMovements.length}</strong>
          </p>

          <button
            type="button"
            className="movements-clear-button"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>

        {loading ? (
          <p className="movements-message">Cargando movimientos...</p>
        ) : error ? (
          <p className="movements-error">{error}</p>
        ) : filteredMovements.length === 0 ? (
          <p className="movements-message">
            No hay movimientos para mostrar con los filtros actuales.
          </p>
        ) : (
          <div className="movements-table-wrapper">
            <table className="movements-table">
              <thead>
                <tr>
                  <th>NIV</th>
                  <th>Código QR</th>
                  <th>Etapa</th>
                  <th>Registrado por</th>
                  <th>Correo</th>
                  <th>Origen</th>
                  <th>Fecha y hora</th>
                </tr>
              </thead>

              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{highlightMatch(movement.car?.niv)}</td>

                    <td>{highlightMatch(movement.car?.qrValue)}</td>

                    <td>{highlightMatch(formatStageName(movement.stageName))}</td>

                    <td>{highlightMatch(getRegisteredBy(movement))}</td>

                    <td>
                      {movement.registeredByUser?.email
                        ? highlightMatch(movement.registeredByUser.email)
                        : 'N/A'}
                    </td>

                    <td>
                      <span
                        className={
                          movement.sourceType === 'SCAN'
                            ? 'movements-badge movements-badge-scan'
                            : 'movements-badge movements-badge-import'
                        }
                      >
                        {formatSourceType(movement.sourceType)}
                      </span>
                    </td>

                    <td>
                      {movement.registeredAt
                        ? new Date(movement.registeredAt).toLocaleString(
                            'es-MX'
                          )
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default MovementsPage;