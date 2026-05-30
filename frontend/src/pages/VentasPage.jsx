import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const ESTADO_BADGE = {
  completada: 'badge-success',
  pendiente:  'badge-warning',
  anulada:    'badge-danger',
};

export default function VentasPage() {
  const { user } = useAuth();
  const [ventas, setVentas]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado]   = useState('');
  const [desde, setDesde]     = useState('');
  const [hasta, setHasta]     = useState('');
  const [detalle, setDetalle] = useState(null);
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);
    if (desde)  params.append('fecha_desde', desde);
    if (hasta)  params.append('fecha_hasta', hasta);
    try {
      const data = await api.get(`/ventas?${params}`);
      setVentas(data);
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, [estado, desde, hasta]);

  async function verDetalle(id) {
    try {
      const data = await api.get(`/ventas/${id}`);
      setDetalle(data);
    } catch(e){ setError(e.message); }
  }

  async function anular(id) {
    if (!confirm('¿Anular esta venta? El stock será restaurado.')) return;
    try {
      await api.put(`/ventas/${id}/anular`, {});
      load();
    } catch(e){ setError(e.message); }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ventas</h1>
        <p className="page-subtitle">Historial de ventas con JOIN entre VENTA, CLIENTE, EMPLEADO, USUARIO</p>
      </div>

      {error && <div className="alert alert-error" onClick={()=>setError('')}>{error}</div>}

      <div className="search-bar">
        <select value={estado} onChange={e=>setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="completada">Completadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="anulada">Anuladas</option>
        </select>
        <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} title="Fecha desde" />
        <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} title="Fecha hasta" />
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          {loading ? <div className="spinner">Cargando...</div> : (
            <table>
              <thead><tr>
                <th>ID</th><th>Fecha</th><th>Cliente</th><th>Empleado</th>
                <th>Total</th><th>Estado</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {ventas.map(v=>(
                  <tr key={v.id_venta}>
                    <td style={{color:'var(--accent)'}}><strong>#{v.id_venta}</strong></td>
                    <td>{new Date(v.fecha_venta).toLocaleDateString('es-GT')}</td>
                    <td>{v.nombre_cliente}</td>
                    <td>{v.nombre_empleado}</td>
                    <td>Q{parseFloat(v.total).toLocaleString()}</td>
                    <td><span className={`badge ${ESTADO_BADGE[v.estado]||''}`}>{v.estado}</span></td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-info btn-sm" onClick={()=>verDetalle(v.id_venta)}>Ver</button>
                        {v.estado !== 'anulada' && ['rol_admin','rol_gerente'].includes(user?.rol) && (
                          <button className="btn btn-danger btn-sm" onClick={()=>anular(v.id_venta)}>Anular</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!ventas.length && <tr><td colSpan="7" style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No hay ventas</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {detalle && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDetalle(null)}>
          <div className="modal" style={{maxWidth:700}}>
            <button className="modal-close" onClick={()=>setDetalle(null)}>✕</button>
            <div className="modal-title">Venta #{detalle.id_venta}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20,fontSize:13}}>
              <div><span style={{color:'var(--text-muted)'}}>Cliente: </span><strong>{detalle.nombre_cliente}</strong></div>
              <div><span style={{color:'var(--text-muted)'}}>Empleado: </span><strong>{detalle.nombre_empleado}</strong></div>
              <div><span style={{color:'var(--text-muted)'}}>Fecha: </span>{new Date(detalle.fecha_venta).toLocaleString('es-GT')}</div>
              <div><span style={{color:'var(--text-muted)'}}>Estado: </span><span className={`badge ${ESTADO_BADGE[detalle.estado]}`}>{detalle.estado}</span></div>
            </div>
            <table>
              <thead><tr><th>Producto</th><th>Marca</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
              <tbody>
                {detalle.detalle?.map(d=>(
                  <tr key={d.id_detalle}>
                    <td>{d.nombre_producto}</td>
                    <td>{d.marca}</td>
                    <td>{d.cantidad}</td>
                    <td>Q{parseFloat(d.precio_unitario).toLocaleString()}</td>
                    <td>Q{parseFloat(d.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{textAlign:'right',marginTop:16,fontFamily:'var(--font-head)',fontSize:20}}>
              TOTAL: Q{parseFloat(detalle.total).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
