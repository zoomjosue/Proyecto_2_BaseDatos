import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

function exportCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const header = keys.join(',');
  const rows = data.map(row =>
    keys.map(k => `"${String(row[k]??'').replace(/"/g,'""')}"`).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportesPage() {
  const [reporte, setReporte] = useState(null);
  const [desde,   setDesde]   = useState('');
  const [hasta,   setHasta]   = useState('');
  const [sinVentas, setSinVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('empleados');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (desde) params.append('fecha_desde', desde);
    if (hasta) params.append('fecha_hasta', hasta);
    try {
      const [rep, sv] = await Promise.all([
        api.get(`/ventas/reporte?${params}`),
        api.get('/productos/sin-ventas'),
      ]);
      setReporte(rep);
      setSinVentas(sv);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, [desde, hasta]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reportes</h1>
      </div>

      <div className="card">
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div className="form-group">
            <label>Fecha desde</label>
            <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} style={{width:170}} />
          </div>
          <div className="form-group">
            <label>Fecha hasta</label>
            <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} style={{width:170}} />
          </div>
          <button className="btn btn-ghost" onClick={()=>{setDesde('');setHasta('');}}>Limpiar</button>
        </div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {['empleados','categorias','ventas_detalle','sin_ventas'].map(t=>(
          <button key={t} className={`btn ${tab===t?'btn-primary':'btn-ghost'}`} onClick={()=>setTab(t)}>
            {{empleados:' Por Empleado',categorias:' Por Categoría',ventas_detalle:' Detalle Ventas',sin_ventas:' Sin Ventas'}[t]}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner">Cargando reportes...</div> : (
        <>
          {tab === 'empleados' && reporte && (
            <div className="card" style={{padding:0}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px'}}>
                <div>
                  <div className="card-title" style={{marginBottom:4}}>Ventas por Empleado</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>exportCSV(reporte.porEmpleado,'reporte_empleados.csv')}>
                   Exportar CSV
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Empleado</th><th>Ventas</th><th>Total Vendido</th><th>Promedio</th></tr></thead>
                  <tbody>
                    {reporte.porEmpleado.map((e,i)=>(
                      <tr key={i}>
                        <td><strong>{e.empleado}</strong></td>
                        <td>{e.num_ventas}</td>
                        <td>Q{parseFloat(e.total_ventas).toLocaleString()}</td>
                        <td>Q{parseFloat(e.promedio_venta).toLocaleString()}</td>
                      </tr>
                    ))}
                    {!reporte.porEmpleado.length&&<tr><td colSpan="4" style={{textAlign:'center',color:'var(--text-muted)',padding:24}}>Sin datos</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'categorias' && reporte && (
            <div className="card" style={{padding:0}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px'}}>
                <div>
                  <div className="card-title" style={{marginBottom:4}}>Ventas por Categoría</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>exportCSV(reporte.porCategoria,'reporte_categorias.csv')}>
                   Exportar CSV
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Categoría</th><th>Unidades Vendidas</th><th>Ingresos</th></tr></thead>
                  <tbody>
                    {reporte.porCategoria.map((c,i)=>(
                      <tr key={i}>
                        <td><strong>{c.categoria}</strong></td>
                        <td>{c.unidades_vendidas}</td>
                        <td>Q{parseFloat(c.ingresos).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'ventas_detalle' && reporte && (
            <div className="card" style={{padding:0}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px'}}>
                <div>
                  <div className="card-title" style={{marginBottom:4}}>Detalle de Ventas</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>exportCSV(reporte.ultimasVentas,'reporte_ventas_detalle.csv')}>
                   Exportar CSV
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Venta</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Producto</th><th>Cant.</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {reporte.ultimasVentas.map((v,i)=>(
                      <tr key={i}>
                        <td>#{v.id_venta}</td>
                        <td>{new Date(v.fecha_venta).toLocaleDateString('es-GT')}</td>
                        <td>{v.nombre_cliente}</td>
                        <td>{v.nombre_empleado}</td>
                        <td>{v.nombre_producto}</td>
                        <td>{v.cantidad}</td>
                        <td>Q{parseFloat(v.subtotal).toLocaleString()}</td>
                      </tr>
                    ))}
                    {!reporte.ultimasVentas.length&&<tr><td colSpan="7" style={{textAlign:'center',color:'var(--text-muted)',padding:24}}>Sin datos en ese rango</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'sin_ventas' && (
            <div className="card" style={{padding:0}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px'}}>
                <div>
                  <div className="card-title" style={{marginBottom:4}}>Productos Sin Ventas</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>exportCSV(sinVentas,'productos_sin_ventas.csv')}>
                   Exportar CSV
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Producto</th><th>Marca</th><th>Categoría</th><th>Precio</th><th>Stock</th></tr></thead>
                  <tbody>
                    {sinVentas.map(p=>(
                      <tr key={p.id_producto}>
                        <td><strong>{p.nombre}</strong></td>
                        <td>{p.marca}</td>
                        <td>{p.categoria}</td>
                        <td>Q{parseFloat(p.precio).toLocaleString()}</td>
                        <td>{p.stock}</td>
                      </tr>
                    ))}
                    {!sinVentas.length&&<tr><td colSpan="5" style={{textAlign:'center',color:'var(--success)',padding:24}}>¡Todos los productos han sido vendidos!</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
