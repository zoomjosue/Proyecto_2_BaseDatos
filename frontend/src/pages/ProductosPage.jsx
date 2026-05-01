import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

function ProductoModal({ producto, catalogos, onSave, onClose }) {
  const editing = !!producto?.id_producto;
  const [form, setForm] = useState(
    editing ? { ...producto } : {
      nombre:'', descripcion:'', talla:'', color:'', precio:'',
      stock:0, stock_minimo:5,
      id_categoria:'', id_marca:'', id_deporte:'', id_proveedor:''
    }
  );
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({...f, [k]: v})); }

  async function submit() {
    setError('');
    try {
      if (editing) await api.put(`/productos/${producto.id_producto}`, form);
      else         await api.post('/productos', form);
      onSave();
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{editing ? 'Editar Producto' : 'Nuevo Producto'}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <div className="form-group" style={{gridColumn:'1/-1'}}>
            <label>Nombre *</label>
            <input value={form.nombre} onChange={e=>set('nombre',e.target.value)} placeholder="Nombre del producto" />
          </div>
          <div className="form-group">
            <label>Precio *</label>
            <input type="number" step="0.01" value={form.precio} onChange={e=>set('precio',e.target.value)} />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input type="number" value={form.stock} onChange={e=>set('stock',e.target.value)} />
          </div>
          <div className="form-group">
            <label>Stock Mínimo</label>
            <input type="number" value={form.stock_minimo} onChange={e=>set('stock_minimo',e.target.value)} />
          </div>
          <div className="form-group">
            <label>Talla</label>
            <input value={form.talla||''} onChange={e=>set('talla',e.target.value)} placeholder="S, M, L, 42..." />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input value={form.color||''} onChange={e=>set('color',e.target.value)} />
          </div>
          <div className="form-group">
            <label>Categoría *</label>
            <select value={form.id_categoria} onChange={e=>set('id_categoria',e.target.value)}>
              <option value="">Seleccionar...</option>
              {catalogos.categorias.map(c=><option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Marca *</label>
            <select value={form.id_marca} onChange={e=>set('id_marca',e.target.value)}>
              <option value="">Seleccionar...</option>
              {catalogos.marcas.map(m=><option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Deporte *</label>
            <select value={form.id_deporte} onChange={e=>set('id_deporte',e.target.value)}>
              <option value="">Seleccionar...</option>
              {catalogos.deportes.map(d=><option key={d.id_deporte} value={d.id_deporte}>{d.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Proveedor *</label>
            <select value={form.id_proveedor} onChange={e=>set('id_proveedor',e.target.value)}>
              <option value="">Seleccionar...</option>
              {catalogos.proveedores.map(p=><option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="form-group" style={{gridColumn:'1/-1'}}>
            <label>Descripción</label>
            <input value={form.descripcion||''} onChange={e=>set('descripcion',e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={submit}>
            {editing ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductosPage() {
  const [productos,  setProductos]  = useState([]);
  const [catalogos,  setCatalogos]  = useState({categorias:[],marcas:[],deportes:[],proveedores:[]});
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); 
  const [search,     setSearch]     = useState('');
  const [catFiltro,  setCatFiltro]  = useState('');
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)   params.append('search', search);
      if (catFiltro) params.append('categoria', catFiltro);
      const [prods, cats, marcas, deportes, proveedores] = await Promise.all([
        api.get(`/productos?${params}`),
        api.get('/categorias'),
        api.get('/marcas'),
        api.get('/deportes'),
        api.get('/proveedores'),
      ]);
      setProductos(prods);
      setCatalogos({categorias:cats, marcas, deportes, proveedores});
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, [search, catFiltro]);

  async function deleteProducto(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      setSuccess('Producto eliminado'); load();
    } catch(e){ setError(e.message); }
  }

  function onSave() {
    setModal(null); setSuccess('Producto guardado correctamente'); load();
  }

  return (
    <div>
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">CRUD con JOIN entre PRODUCTO, CATEGORIA, MARCA, DEPORTE, PROVEEDOR</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal('new')}>+ Nuevo Producto</button>
      </div>

      {error   && <div className="alert alert-error"   onClick={()=>setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={()=>setSuccess('')}>{success}</div>}

      <div className="search-bar">
        <input placeholder=" Buscar producto..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select value={catFiltro} onChange={e=>setCatFiltro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {catalogos.categorias.map(c=><option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
        </select>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          {loading ? <div className="spinner">Cargando...</div> : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th><th>Categoría</th><th>Marca</th><th>Deporte</th>
                  <th>Precio</th><th>Stock</th><th>Mín.</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p=>(
                  <tr key={p.id_producto}>
                    <td><strong>{p.nombre}</strong>{p.talla&&<span style={{color:'var(--text-muted)',marginLeft:6}}>T:{p.talla}</span>}</td>
                    <td>{p.categoria}</td>
                    <td>{p.marca}</td>
                    <td>{p.deporte}</td>
                    <td>Q{parseFloat(p.precio).toLocaleString()}</td>
                    <td>
                      <span className={p.stock < p.stock_minimo ? 'chip-low' : 'chip-ok'}>
                        {p.stock} {p.stock < p.stock_minimo && '(¡Bajo!)'}
                      </span>
                    </td>
                    <td>{p.stock_minimo}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setModal(p)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>deleteProducto(p.id_producto)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!productos.length && <tr><td colSpan="8" style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No hay productos</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <ProductoModal
          producto={modal === 'new' ? null : modal}
          catalogos={catalogos}
          onSave={onSave}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}
