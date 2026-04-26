import {useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {useAuth } from "../context/AuthContext";
import './admin-layout.css';

function AdminLayouts () {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleNavigate = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div style= {styles.page}>
            {/* Header móvil */}
            <header style={styles.mobileHeader} className="admin-layout-mobile-header">
                <button
                    style={styles.menuButton}
                    onClick={() => setMobileMenuOpen(true)}
                >
                    ☰
                </button>
                <div>
                    <h2 style={styles.mobileTitle}>Panel Admin</h2>
                    <p style={styles.mobileWelcome}>¡Hola, {user?.name}!</p>
                </div>
            </header>
            {/* Overlay móvil */}
            {mobileMenuOpen &&(
                <div
                    style={styles.overlay}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar escritorio / drawer móvil */}
            <aside 
                className="admin-layout-sidebar"
                style={{
                    ...styles.sidebar,
                    ...(mobileMenuOpen ? styles.sidebarMobileOpen : {}),
                }}
            >
                <div>
                    <h2 style={styles.logo}>Panel Admin</h2>
                    <p style={styles.welcome}>¡Hola, {user?.name}!</p>
                    <nav style={styles.nav}>
                        <NavLink to="/admin/users" style={getLinkStyle} onClick={handleNavigate}>
                            Usuarios
                        </NavLink>
                        <NavLink to="/admin/import" style={getLinkStyle} onClick={handleNavigate}>
                            Importar BD
                        </NavLink>
                        <NavLink to="/admin/qr-pdf" style={getLinkStyle} onClick={handleNavigate}>
                            Exportar PDF de QRs
                        </NavLink>
                        <NavLink to="/admin/movements" style={getLinkStyle} onClick={handleNavigate}>
                            Movimientos registrados
                        </NavLink>
                    </nav>
                </div>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Cerrar sesión
                </button>
            </aside>
            <main style={styles.main} className="admin-layout-main">
                <Outlet />
            </main>
        </div>
    );
}

const getLinkStyle = ({ isActive }) => ({
    display: "block",
    padding: '12px 14px',
    borderRadius: '10px',
    textDecoration: 'none',
    color: isActive ? '#fff' : '#111827',
    background: isActive ? '#111827' : '#f3f4f6',
    fontWeight: 500,
});

const SIDEBAR_WIDTH = 280;

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
  },

  mobileHeader: {
    display: 'none',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 30,
  },

  menuButton: {
    border: 'none',
    borderRadius: '8px',
    padding: '10px 12px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
  },

  mobileTitle: {
    margin: 0,
    fontSize: '18px',
  },

  mobileWelcome: {
    margin: '4px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    zIndex: 39,
  },

  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${SIDEBAR_WIDTH}px`,
    height: '100vh',
    background: '#fff',
    borderRight: '1px solid #e5e7eb',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '24px',
    overflowY: 'auto',
    zIndex: 40,
    boxSizing: 'border-box',
    transition: 'transform 0.25s ease',
  },

  sidebarMobileOpen: {
    transform: 'translateX(0)',
  },

  logo: {
    marginTop: 0,
    marginBottom: '8px',
  },

  welcome: {
    marginTop: 0,
    color: '#6b7280',
    marginBottom: '24px',
  },

  nav: {
    display: 'grid',
    gap: '10px',
  },

  logoutButton: {
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    width: '100%',
  },

  main: {
    marginLeft: `${SIDEBAR_WIDTH}px`,
    minHeight: '100vh',
    padding: '30px',
    boxSizing: 'border-box',
  },
};

export default AdminLayouts;