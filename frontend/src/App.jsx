import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { can } from './security/permissions.js';

import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductosPage from './pages/ProductosPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import VentasPage from './pages/VentasPage.jsx';
import NuevaVentaPage from './pages/NuevaVentaPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import StockPage from './pages/StockPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const roleLabel = {
    rol_admin: 'Admin',
    rol_gerente: 'Gerente',
    rol_vendedor: 'Vendedor',
    rol_inventario: 'Inventario',
    rol_consulta: 'Consulta',
  }[user?.rol] || user?.rol;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        SPORT GT
        <span>Panel de Gestion</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">Principal</div>
        {can(user, 'dashboard:view') && <NavLink to="/" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="icon"></span> Dashboard</NavLink>}
        {can(user, 'ventas:view') && <NavLink to="/ventas" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="icon"></span> Ventas</NavLink>}
        {can(user, 'ventas:create') && <NavLink to="/nueva-venta" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="icon"></span> Nueva Venta</NavLink>}

        <div className="nav-section">Inventario</div>
        {can(user, 'productos:view') && <NavLink to="/productos" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="icon"></span> Productos</NavLink>}
        {can(user, 'stock:view') && <NavLink to="/stock" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="icon"></span> Stock Bajo</NavLink>}

        {can(user, 'clientes:view') && <div className="nav-section">Clientes</div>}
        {can(user, 'clientes:view') && <NavLink to="/clientes" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="icon"></span> Clientes</NavLink>}

        {(can(user, 'reportes:view') || can(user, 'reportes:basic')) && <div className="nav-section">Analisis</div>}
        {(can(user, 'reportes:view') || can(user, 'reportes:basic')) && <NavLink to="/reportes" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="icon"></span> Reportes</NavLink>}

        {user?.rol === 'rol_admin' && <div className="nav-section">Administracion</div>}
        {user?.rol === 'rol_admin' && <NavLink to="/usuarios" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="icon"></span> Usuarios</NavLink>}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <strong>{user?.nombre}</strong>
          {roleLabel}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  function Guard({ permission, children }) {
    return can(user, permission) ? children : <Navigate to="/" replace />;
  }

  const home = can(user, 'dashboard:view') ? <Dashboard /> : <Navigate to="/productos" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={home} />
          <Route path="/productos" element={<Guard permission="productos:view"><ProductosPage /></Guard>} />
          <Route path="/clientes" element={<Guard permission="clientes:view"><ClientesPage /></Guard>} />
          <Route path="/ventas" element={<Guard permission="ventas:view"><VentasPage /></Guard>} />
          <Route path="/nueva-venta" element={<Guard permission="ventas:create"><NuevaVentaPage /></Guard>} />
          <Route path="/reportes" element={(can(user, 'reportes:view') || can(user, 'reportes:basic')) ? <ReportesPage /> : <Navigate to="/" replace />} />
          <Route path="/stock" element={<Guard permission="stock:view"><StockPage /></Guard>} />
          <Route path="/usuarios" element={user?.rol === 'rol_admin' ? <UsuariosPage /> : <Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
