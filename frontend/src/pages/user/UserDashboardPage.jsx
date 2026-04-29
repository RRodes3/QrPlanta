import { useNavigate } from 'react-router-dom';

function UserDashboardPage() {
    const navigate = useNavigate ();
    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <h1 style={styles.title}>Dashboard de Usuario</h1>
                <p style={styles.text}>
                    Desde aquí puedes iniciar el escaneo de códigos QR para
                     consultar la información de los vehículos o registrar
                     una etapa de producción.
                </p>
                <button style={styles.button} onClick={() => navigate('/user/scan')}>
                    Consultar estado de vehículo
                </button>
                <button style={{...styles.button, marginLeft: '12px'}} onClick={() => navigate('/user/register')}>
                    Registrar etapa de producción
                </button>
            </div>
        </div>
    );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  card: {
    width: '100%',
    maxWidth: '650px',
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
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  button: {
    border: 'none',
    borderRadius: '10px',
    padding: '14px 22px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
  },
};

export default UserDashboardPage;