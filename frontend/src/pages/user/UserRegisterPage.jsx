import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerMovementRequest } from '../../api/movement.api';
import QrScanner from '../../components/QrScanner/QrScanner';

const STAGES = [
  { value: 'SOLDADURA', label: 'Soldadura' },
  { value: 'PINTURA', label: 'Pintura' },
  { value: 'MONTAJE', label: 'Montaje' },
  { value: 'CONTROL_DE_CALIDAD', label: 'Control de calidad' },
];

function UserRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    qrValue: '',
    stageName: '',
  });

  const [qrInputMode, setQrInputMode] = useState('camera');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScanSuccess = useCallback((decodedText) => {
    setForm((prev) => ({
      ...prev,
      qrValue: decodedText,
    }));

    setQrInputMode('manual');
    setError('');
    setSuccess('QR detectado correctamente. Confirma el registro.');
  }, []);

  const handleManualMode = useCallback(() => {
    setQrInputMode('manual');
    setError('');
  }, []);

  const handleCameraMode = () => {
    setQrInputMode('camera');
    setError('');
    setSuccess('');
    setResult(null);

    setForm((prev) => ({
      ...prev,
      qrValue: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResult(null);

    if (!form.stageName || !form.qrValue.trim()) {
      setError('Debes seleccionar una etapa y capturar el QR.');
      return;
    }

    setLoading(true);

    try {
      const data = await registerMovementRequest({
        qrValue: form.qrValue.trim(),
        stageName: form.stageName,
      });

      setSuccess(data.message || 'Movimiento registrado correctamente');
      setResult(data);

      setForm((prev) => ({
        ...prev,
        qrValue: '',
      }));

      setQrInputMode('camera');
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      setError(
        error.response?.data?.message || 'No se pudo registrar el movimiento'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Registrar entrada a etapa</h1>
        <p style={styles.text}>
          Selecciona una etapa de la línea de producción y escanea el código QR
          del vehículo para registrar su entrada.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="stageName">Etapa</label>
            <select
              id="stageName"
              name="stageName"
              value={form.stageName}
              onChange={handleChange}
              style={styles.input}
              disabled={loading}
            >
              <option value="">Selecciona una etapa</option>
              {STAGES.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.qrSection}>
            {qrInputMode === 'camera' ? (
              <QrScanner
                onScanSuccess={handleScanSuccess}
                onCancel={handleManualMode}
              />
            ) : (
              <div style={styles.field}>
                <label htmlFor="qrValue">QR del vehículo</label>

                <input
                  id="qrValue"
                  type="text"
                  name="qrValue"
                  value={form.qrValue}
                  onChange={handleChange}
                  placeholder="Ej. QR-TEST-0001"
                  style={styles.input}
                  disabled={loading}
                />

                {form.qrValue && (
                  <p style={styles.detectedQr}>
                    <strong>QR actual:</strong> {form.qrValue}
                  </p>
                )}

                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={handleCameraMode}
                  disabled={loading}
                >
                  Usar cámara
                </button>
              </div>
            )}
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Registrando...' : 'Registrar movimiento'}
          </button>
        </form>

        {result && (
          <div style={styles.resultBox}>
            <h2 style={styles.resultTitle}>Resultado</h2>
            <p>
              <strong>Mensaje:</strong> {result.message}
            </p>
            <p>
              <strong>Etapa registrada:</strong> {result.movement?.stageName}
            </p>
            <p>
              <strong>Fecha y hora:</strong>{' '}
              {result.movement?.registeredAt
                ? new Date(result.movement.registeredAt).toLocaleString(
                    'es-MX'
                  )
                : 'N/A'}
            </p>
            {result.finalMovement && (
              <p>
                <strong>Estado automático:</strong>{' '}
                {result.finalMovement.stageName}
              </p>
            )}
          </div>
        )}

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
    maxWidth: '720px',
    background: '#fff',
    borderRadius: '18px',
    padding: '32px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  },
  title: {
    marginTop: 0,
    marginBottom: '10px',
  },
  text: {
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  form: {
    display: 'grid',
    gap: '16px',
  },
  field: {
    display: 'grid',
    gap: '8px',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  qrSection: {
    display: 'grid',
    gap: '12px',
  },
  detectedQr: {
    margin: 0,
    padding: '10px 12px',
    borderRadius: '10px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#374151',
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
  secondaryButton: {
    width: 'fit-content',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '11px 16px',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
    fontWeight: 700,
  },
  backButton: {
    marginTop: '18px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '11px 16px',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
  },
  error: {
    color: 'crimson',
    margin: 0,
  },
  success: {
    color: 'green',
    margin: 0,
  },
  resultBox: {
    marginTop: '24px',
    padding: '18px',
    borderRadius: '12px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
  },
  resultTitle: {
    marginTop: 0,
  },
};

export default UserRegisterPage;