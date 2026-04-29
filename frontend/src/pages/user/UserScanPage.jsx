import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserScanPage() {
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!qrValue.trim()) return;

    navigate(`/user/result/${encodeURIComponent(qrValue.trim())}`);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Consultar vehículo por QR</h1>
        <p style={styles.text}>
          Captura el valor del QR del vehículo para consultar su estado e historial.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="qrValue">QR del vehículo</label>
            <input
              id="qrValue"
              type="text"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              placeholder="Ej. QR-TEST-0001"
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Consultar vehículo
          </button>
        </form>

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
    lineHeight: 1.6,
  },
  form: {
    display: 'grid',
    gap: '16px',
    marginBottom: '20px',
  },
  field: {
    display: 'grid',
    gap: '8px',
    textAlign: 'left',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  button: {
    border: 'none',
    borderRadius: '10px',
    padding: '13px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
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