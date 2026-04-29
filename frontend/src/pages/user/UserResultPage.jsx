import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCarByQrValueRequest } from '../../api/car.api';

function UserResultPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState ('');
    
    useEffect(() => {
      const fetchCar = async () => {
        try {
          setLoading(true);
          setError('');

          const data = await getCarByQrValueRequest(id);
          setCar(data);
        } catch (error) {
          console.error('Error al consultar vehículo:', error);
          setError(
            error.response?.data?.message || 'No se pudo consultar el vehículo'
          );
        } finally {
          setLoading(false);
        }
      };

      if (id) {
        fetchCar();
      }
    }, [id]);

    const latestMovement = useMemo(() => {
      if(!car?.movements?.length) return null;
      return car.movements[car.movements.length -1];
    }, [car]);

    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h1 style={styles.title}>Resultado de consulta</h1>

          {loading ? (
            <p style={styles.text}>Consultando vehículo...</p>
          ) : error ? (
            <p style={styles.error}>{error}</p>
          ) : !car ? (
            <p style={styles.text}>No se encontró información del vehículo.</p>
          ) : (
            <>
              <div style={styles.infoBox}>
                <p><strong>NIV:</strong> {car.niv}</p>
                <p><strong>Chasis:</strong> {car.chasis || 'N/A'}</p>
                <p><strong>QR:</strong> {car.qrValue}</p>
                <p>
                  <strong>Etapa actual:</strong>{' '}
                  {latestMovement ? latestMovement.stageName : 'RECIEN_INGRESADO_A_LA_PLANTA'}
                </p>
                <p>
                  <strong>Escaneado por:</strong>{' '}
                  {latestMovement?.registeredByUser?.name ||
                    latestMovement?.registeredByName ||
                    'N/A'}
                </p>
                <p>
                  <strong>Fecha y hora:</strong>{' '}
                  {latestMovement?.registeredAt
                    ? new Date(latestMovement.registeredAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>

              <div style={styles.historyBox}>
                <h2 style={styles.historyTitle}>Historial del vehículo</h2>

                {!car.movements?.length ? (
                  <p style={styles.text}>
                    El vehículo no tiene movimientos registrados todavía.
                  </p>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Etapa</th>
                          <th style={styles.th}>Escaneado por</th>
                          <th style={styles.th}>Fecha y hora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {car.movements.map((movement) => (
                          <tr key={movement.id}>
                            <td style={styles.td}>{movement.stageName}</td>
                            <td style={styles.td}>
                              {movement.registeredByUser?.name ||
                                movement.registeredByName ||
                                'N/A'}
                            </td>
                            <td style={styles.td}>
                              {new Date(movement.registeredAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          <div style={styles.actions}>
            <button style={styles.primary} onClick={() => navigate('/user/scan')}>
              Escanear nuevo QR
            </button>
            <button style={styles.secondary} onClick={() => navigate('/user')}>
              Volver al dashboard
            </button>
          </div>
        </div>
      </div>
    );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    background: '#fff',
    borderRadius: '18px',
    padding: '32px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  },
  title: {
    marginTop: 0,
  },
  text: {
    color: '#6b7280',
  },
  infoBox: {
    marginTop: '20px',
    minHeight: '220px',
    borderRadius: '14px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    padding: '20px',
  },
  error: {
    color: 'crimson',
  },
  infoBox: {
    marginTop: '20px',
    borderRadius: '14px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    padding: '20px',
    lineHeight: 1.8,
  },
  historyBox: {
    marginTop: '24px',
  },
  historyTitle: {
    marginBottom: '14px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '650px',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  actions: {
    marginTop: '20px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  primary: {
    border: 'none',
    borderRadius: '10px',
    padding: '12px 18px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
  },
  secondary: {
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '12px 18px',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
  },
};

export default UserResultPage;