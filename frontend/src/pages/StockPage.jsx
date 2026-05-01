import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export default function StockPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/productos/stock-bajo')
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function exportCSV() {
    if (!items.length) return;
    const keys = Object.keys(items[0]);
    const csv  = [
      keys.join(','),
      ...items.map(r => keys.map(k => `"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download='stock_bajo.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 className="page-title">Stock Bajo</h1>
          <p className="page-subtitle">VIEW <code style={{background:'var(--surface2)',padding:'1px 6px',borderRadius:4}}>vista_stock_bajo</code> — productos donde stock &lt; stock_mínimo</p>
        </div>
        <button className="btn btn-ghost" onClick={exportCSV} disabled={!items.length}>
          Exportar CSV
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && items.length > 0 && (
        <div className="alert alert-warning">
          {items.length} producto{items.length!==1?'s':''} con stock por debajo del mínimo
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="alert alert-success">
          Todos los productos tienen stock suficiente
        </div>
      )}

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          {loading ? <div className="spinner">Cargando...</div> : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th><th>Talla</th><th>Color</th><th>Marca</th>
                  <th>Deporte</th><th>Categoría</th><th>Proveedor</th>
                  <th>Stock</th><th>Mínimo</th><th>Déficit</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id_producto}>
                    <td><strong>{p.nombre}</strong></td>
                    <td>{p.talla || '—'}</td>
                    <td>{p.color || '—'}</td>
                    <td>{p.marca}</td>
                    <td>{p.deporte}</td>
                    <td>{p.categoria}</td>
                    <td>{p.proveedor}</td>
                    <td><span className="chip-low">{p.stock}</span></td>
                    <td>{p.stock_minimo}</td>
                    <td><span className="badge badge-danger">-{p.stock_minimo - p.stock}</span></td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td colSpan="10" style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>Sin productos con stock bajo</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
