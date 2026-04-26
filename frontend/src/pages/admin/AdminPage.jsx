import { useEffect, useState } from 'react';
import {
  createUserRequest,
  deleteUserRequest,
  getUsersRequest,
} from '../../api/user.api';

function AdminPage() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const data = await getUsersRequest();
      setUsers(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError(
        error.response?.data?.message || 'No se pudieron cargar los usuarios'
      );
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'USER',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await createUserRequest(form);

      setSuccess(data.message || 'Usuario creado correctamente');
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setError(
        error.response?.data?.message || 'No se pudo crear el usuario'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar este usuario?'
    );

    if (!confirmDelete) return;

    setError('');
    setSuccess('');

    try {
      const data = await deleteUserRequest(id);
      setSuccess(data.message || 'Usuario eliminado correctamente');
      await fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError(
        error.response?.data?.message || 'No se pudo eliminar el usuario'
      );
    }
  };

  // Estilos dependientes de isMobile
  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: isMobile ? '16px 10px' : '30px 20px',
    },
    container: {
      width: '100%',
      maxWidth: isMobile ? '100%' : '1100px',
      margin: '0 auto',
      display: 'grid',
      gap: isMobile ? '16px' : '24px',
    },
    formCard: {
      background: '#fff',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
      width: '100%',
      boxSizing: 'border-box',
    },
    tableCard: {
      background: '#fff',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
      width: '100%',
      boxSizing: 'border-box',
    },
    title: {
      marginTop: 0,
      marginBottom: '8px',
      fontSize: isMobile ? '28px' : undefined,
    },
    subtitle: {
      marginTop: 0,
      marginBottom: '20px',
      color: '#6b7280',
      fontSize: isMobile ? '14px' : undefined,
    },
    tableTitle: {
      marginTop: 0,
      marginBottom: '16px',
      fontSize: isMobile ? '24px' : undefined,
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
      padding: isMobile ? '9px 10px' : '10px 12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: isMobile ? '13px' : '14px',
      width: '100%',
      boxSizing: 'border-box',
    },
    button: {
      padding: isMobile ? '11px' : '12px',
      border: 'none',
      borderRadius: '8px',
      background: '#111827',
      color: '#fff',
      cursor: 'pointer',
      fontSize: isMobile ? '13px' : '14px',
      width: '100%',
    },
    deleteButton: {
      padding: isMobile ? '6px 10px' : '8px 12px',
      border: 'none',
      borderRadius: '8px',
      background: '#dc2626',
      color: '#fff',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '13px',
    },
    error: {
      color: 'crimson',
      margin: 0,
    },
    success: {
      color: 'green',
      margin: 0,
    },
    tableWrapper: {
      overflowX: 'auto',
      width: '100%',
    },
    table: {
      width: '100%',
      minWidth: isMobile ? '700px' : '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: isMobile ? '10px' : '12px',
      borderBottom: '1px solid #e5e7eb',
      background: '#f9fafb',
      fontSize: isMobile ? '13px' : undefined,
    },
    td: {
      padding: isMobile ? '10px' : '12px',
      borderBottom: '1px solid #e5e7eb',
      fontSize: isMobile ? '13px' : undefined,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.formCard}>
          <h1 style={styles.title}>Administración de usuarios</h1>
          <p style={styles.subtitle}>
            Aquí el administrador puede registrar y eliminar usuarios.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label htmlFor="name">Nombre</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nombre completo"
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="correo@ejemplo.com"
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
                style={styles.input}
                placeholder="********"
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="role">Rol</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Guardando...' : 'Crear usuario'}
            </button>
          </form>
        </div>

        <div style={styles.tableCard}>
          <h2 style={styles.tableTitle}>Lista de usuarios</h2>

          {fetchingUsers ? (
            <p>Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p>No hay usuarios registrados.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Correo</th>
                    <th style={styles.th}>Rol</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={styles.td}>{user.id}</td>
                      <td style={styles.td}>{user.name}</td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>{user.role}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={styles.deleteButton}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



export default AdminPage;