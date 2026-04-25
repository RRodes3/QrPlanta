import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {

  const navigate = useNavigate();

  const { login, user } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(form);

      if (data.user.role === 'ADMIN') {
        navigate('/admin/users');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error en login:', error);

      setError(
        error.response?.data?.message || 'Ocurrió un error al iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Iniciar sesión</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@qrplanta.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        {user && (
          <div style={styles.userBox}>
            <p><strong>Sesión actual:</strong></p>
            <p>Nombre: {user.name}</p>
            <p>Correo: {user.email}</p>
            <p>Rol: {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  button: {
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    color: 'crimson',
    margin: 0,
    fontSize: '14px',
  },
  userBox: {
    marginTop: '20px',
    padding: '12px',
    borderRadius: '8px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
  },
};

export default LoginPage;