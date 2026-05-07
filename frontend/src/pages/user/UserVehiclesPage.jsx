import { useEffect, useMemo, useState } from 'react';
import { getCarsRequest } from '../../api/car.api';

function UserVehiclesPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getCarsRequest();
        setCars(data);
      } catch (error) {
        console.error('Error al obtener vehículos:', error);
        setError(
          error.response?.data?.message || 'No se pudieron cargar los vehículos'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const normalizedCars = useMemo(() => {
    return cars.map((car) => {
      const latestMovement =
        car.movements && car.movements.length > 0
          ? car.movements[0]
          : null;

      return {
        ...car,
        currentStage:
          latestMovement?.stageName || 'RECIEN_INGRESADO_A_LA_PLANTA',
        scannedBy:
          latestMovement?.registeredByUser?.name ||
          latestMovement?.registeredByName ||
          'N/A',
        lastRegisteredAt: latestMovement?.registeredAt || null,
      };
    });
  }, [cars]);

  const filteredCars = useMemo(() => {
    let result = [...normalizedCars];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((car) => car.niv.toLowerCase().includes(query));
    }

    if (selectedDate) {
      result = result.filter((car) => {
        if (!car.lastRegisteredAt) return false;

        const movementDate = new Date(car.lastRegisteredAt)
          .toISOString()
          .split('T')[0];

        return movementDate === selectedDate;
      });
    }

    result.sort((a, b) => {
      const dateA = a.lastRegisteredAt ? new Date(a.lastRegisteredAt).getTime() : 0;
      const dateB = b.lastRegisteredAt ? new Date(b.lastRegisteredAt).getTime() : 0;

      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [normalizedCars, search, selectedDate, sortOrder]);

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <span style={styles.highlight}>{match}</span>
        {after}
      </>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Estado de vehículos</h1>
        <p style={styles.subtitle}>
          Consulta el estado global de todos los vehículos registrados en el sistema.
        </p>

        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label htmlFor="search">Buscar por NIV</label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Escribe parte del NIV"
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label htmlFor="selectedDate">Fecha</label>
            <input
              id="selectedDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label htmlFor="sortOrder">Orden</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={styles.input}
            >
              <option value="recent">Más reciente a más antiguo</option>
              <option value="oldest">Más antiguo a más reciente</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={styles.message}>Cargando vehículos...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : filteredCars.length === 0 ? (
          <p style={styles.message}>No hay vehículos para mostrar.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>NIV</th>
                  <th style={styles.th}>Etapa actual</th>
                  <th style={styles.th}>Escaneado por</th>
                  <th style={styles.th}>Fecha y hora</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => (
                  <tr key={car.id}>
                    <td style={styles.td}>
                      {highlightMatch(car.niv, search)}
                    </td>
                    <td style={styles.td}>{car.currentStage}</td>
                    <td style={styles.td}>{car.scannedBy}</td>
                    <td style={styles.td}>
                      {car.lastRegisteredAt
                        ? new Date(car.lastRegisteredAt).toLocaleString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
  },
  card: {
    width: '100%',
    background: '#fff',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    boxSizing: 'border-box',
  },
  title: {
    marginTop: 0,
    marginBottom: '8px',
  },
  subtitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#6b7280',
    lineHeight: 1.6,
  },
  filters: {
    display: 'grid',
    gap: '16px',
    marginBottom: '24px',
  },
  filterGroup: {
    display: 'grid',
    gap: '8px',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  message: {
    color: '#6b7280',
  },
  error: {
    color: 'crimson',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  highlight: {
    backgroundColor: '#fde68a',
    borderRadius: '4px',
    padding: '1px 2px',
    textDecoration: 'underline',
  },
};

export default UserVehiclesPage;