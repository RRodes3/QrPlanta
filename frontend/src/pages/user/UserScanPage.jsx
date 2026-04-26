import { useNavigate } from 'react-router-dom';

function UserScanPage() {
    const navigate = useNavigate ();

    return(
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <h1 style={styles.tittle}>Escanear QR</h1>
                <p style={styles.text}>
                    Aquí se habilitará la cámara/lector QR para escanear el código del vehículo
                </p>

                <div style={styles.scannerBox}>
                    Área reservada para la cámara/lector QR
                </div>

                <button style={styles.backButton} onClick={() => navigate('/user')}>
                    Regresar
                </button>
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
    maxWidth: '700px',
    background: '#fff',
    borderRadius: '18px',
    padding: '32px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  title: {
    marginTop: 0,
  },
  text: {
    color: '#6b7280',
    marginBottom: '22px',
  },
  scannerBox: {
    minHeight: '320px',
    border: '2px dashed #d1d5db',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#6b7280',
    marginBottom: '20px',
    background: '#f9fafb',
  },
  backButton: {
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '10px 16px',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
  },
};

export default UserScanPage;