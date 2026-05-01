import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [topProd, setTopProd] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ventas, productos, clientes, stockBajo, masVendidos] = await Promise.all([
          api.get('/ventas?estado=completada'),
          api.get('/productos'),
          api.get('/clientes'),
          api.get('/productos/stock-bajo'),
          api.get('/productos/mas-vendidos'),
        ]);
        const totalIngresos = ventas.reduce((s, v) => s + parseFloat(v.total), 0);
        setStats({
          totalVentas: ventas.length,
          totalIngresos,
          totalProductos: productos.length,
          totalClientes: clientes.length,
          stockBajo: stockBajo.length,
        });
        setTopProd(masVendidos.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="spinner">Cargando dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Resumen general del negocio</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-value">{stats.totalVentas}</div>
          <div className="stat-label">Ventas Completadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">Q{stats.totalIngresos.toLocaleString('es-GT', {maximumFractionDigits:0})}</div>
          <div className="stat-label">Ingresos Totales</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{stats.totalProductos}</div>
          <div className="stat-label">Productos</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{stats.totalClientes}</div>
          <div className="stat-label">Clientes</div>
        </div>
        {stats.stockBajo > 0 && (
          <div className="stat-card danger">
            <div className="stat-value">{stats.stockBajo}</div>
            <div className="stat-label"> Stock Bajo</div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title"> Productos Más Vendidos</div>
        <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:12}}>
          Consulta con CTE (WITH) + GROUP BY + HAVING desde ventas completadas
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Producto</th><th>Marca</th><th>Deporte</th>
                <th>Unidades</th><th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {topProd.map((p, i) => (
                <tr key={p.id_producto}>
                  <td style={{color:'var(--accent)',fontWeight:700}}>{i+1}</td>
                  <td>{p.nombre}</td>
                  <td>{p.marca}</td>
                  <td>{p.deporte}</td>
                  <td>{p.total_vendido}</td>
                  <td>Q{parseFloat(p.ingresos_totales).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stats.stockBajo > 0 && (
        <div className="alert alert-warning">
          ⚠️ Hay {stats.stockBajo} productos con stock bajo.{' '}
          <Link to="/stock" style={{color:'inherit',fontWeight:600}}>Ver productos →</Link>
        </div>
      )}
    </div>
  );
}
