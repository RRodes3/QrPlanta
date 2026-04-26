import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div style={styles.wrapper}>
            <header style={styles.header}>
                <div style={styles.left}>
                    <h2 style={styles.title}>¡Hola, {user?.name}!</h2>
                </div>

                <nav style={styles.nav}>
                    <NavLink to="/user" style={getLinkStyle}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/user/scan" style={getLinkStyle}>
                        Escanear QR
                    </NavLink>
                    <NavLink to="/user/vehicles" style={getLinkStyle}>
                        Estado de vehículos
                    </NavLink>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                    Cerrar sesión
                </button>
                </nav>
            </header>

            <main style={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}

const getLinkStyle = ({ isActive }) => ({
  textDecoration: 'none',
  color: isActive ? '#111827' : '#4b5563',
  fontWeight: isActive ? 700 : 500,
});

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#f3f4f6',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  left: {},
  title: {
    margin: 0,
    fontSize: '22px',
  },
  nav: {
    display: 'flex',
    gap: '18px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  logoutButton: {
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
  },
  main: {
    padding: '30px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};

export default UserLayout;