import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import LoginPage      from './pages/LoginPage.jsx';
import Dashboard      from './pages/Dashboard.jsx';
import ProductosPage  from './pages/ProductosPage.jsx';
import ClientesPage   from './pages/ClientesPage.jsx';
import VentasPage     from './pages/VentasPage.jsx';
import NuevaVentaPage from './pages/NuevaVentaPage.jsx';
import ReportesPage   from './pages/ReportesPage.jsx';
import StockPage      from './pages/StockPage.jsx';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        SPORT GT
        <span>Panel de Gestión</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">Principal</div>
        <NavLink to="/"         className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="icon"></span> Dashboard</NavLink>
        <NavLink to="/ventas"   className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="icon"></span> Ventas</NavLink>
        <NavLink to="/nueva-venta" className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="icon"></span> Nueva Venta</NavLink>

        <div className="nav-section">Inventario</div>
        <NavLink to="/productos" className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="icon"></span> Productos</NavLink>
        <NavLink to="/stock"    className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="icon"></span> Stock Bajo</NavLink>

        <div className="nav-section">Clientes</div>
        <NavLink to="/clientes" className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="icon"></span> Clientes</NavLink>

        <div className="nav-section">Análisis</div>
        <NavLink to="/reportes" className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="icon"></span> Reportes</NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <strong>{user?.nombre}</strong>
          {user?.rol === 'admin' ? ' Admin' : ' Empleado'}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{width:'100%'}}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner">Cargando...</div>;
  if (!user)   return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/productos"   element={<ProductosPage />} />
          <Route path="/clientes"    element={<ClientesPage />} />
          <Route path="/ventas"      element={<VentasPage />} />
          <Route path="/nueva-venta" element={<NuevaVentaPage />} />
          <Route path="/reportes"    element={<ReportesPage />} />
          <Route path="/stock"       element={<StockPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*"     element={<ProtectedLayout />} />
    </Routes>
  );
}
