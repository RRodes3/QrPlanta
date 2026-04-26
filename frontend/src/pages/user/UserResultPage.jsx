import { useNavigate, useParams } from 'react-router-dom';

function UserResultPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    return(
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <h1 style={styles.tittle}> Resultado del escaneo</h1>
                <p style={styles.text}>Vehículo identificado por referencia: {id}</p>

                <div style={styles.infoBox}>
                    Aquí se mostrarán los datos del vehículo escaneado.
                </div>

                <div style={styles.actions}>
                    <button style={styles.primary} onClick={() => navigate('/user/scan')}>
                        Escanear otro QR
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