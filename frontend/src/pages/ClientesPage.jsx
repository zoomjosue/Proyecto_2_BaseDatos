import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

function ClienteModal({ cliente, onSave, onClose }) {
  const editing = !!cliente?.id_cliente;
  const [form, setForm] = useState(editing ? {...cliente} : {nombre:'',email:'',telefono:'',direccion:''});
  const [error, setError] = useState('');

  function set(k,v){ setForm(f=>({...f,[k]:v})); }

  async function submit() {
    setError('');
    try {
      if (editing) await api.put(`/clientes/${cliente.id_cliente}`, form);
      else         await api.post('/clientes', form);
      onSave();
    } catch(e){ setError(e.message); }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{editing?'Editar Cliente':'Nuevo Cliente'}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <div className="form-group" style={{gridColumn:'1/-1'}}>
            <label>Nombre *</label>
            <input value={form.nombre} onChange={e=>set('nombre',e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email||''} onChange={e=>set('email',e.target.value)} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input value={form.telefono||''} onChange={e=>set('telefono',e.target.value)} />
          </div>
          <div className="form-group" style={{gridColumn:'1/-1'}}>
            <label>Dirección</label>
            <input value={form.direccion||''} onChange={e=>set('direccion',e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={submit}>
            {editing?'Guardar':'Crear'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [tab, setTab] = useState('lista'); 
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);
  const [search, setSearch] = useState('');
  const [error,  setError]  = useState('');
  const [success,setSuccess]= useState('');

  async function load() {
    setLoading(true);
    try {
      const [list, hist] = await Promise.all([
        api.get(`/clientes${search?`?search=${search}`:''}`),
        api.get('/clientes/historial'),
      ]);
      setClientes(list);
      setHistorial(hist);
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, [search]);

  async function deleteCliente(id) {
    if (!confirm('¿Eliminar cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      setSuccess('Cliente eliminado'); load();
    } catch(e){ setError(e.message); }
  }

  function onSave(){ setModal(null); setSuccess('Cliente guardado'); load(); }

  return (
    <div>
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">CRUD + historial de compras con GROUP BY</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal('new')}>+ Nuevo Cliente</button>
      </div>

      {error   && <div className="alert alert-error"   onClick={()=>setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={()=>setSuccess('')}>{success}</div>}

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <button className={`btn ${tab==='lista'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('lista')}>
          Lista de clientes
        </button>
        <button className={`btn ${tab==='historial'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('historial')}>
          Historial de compras
        </button>
      </div>

      {tab === 'lista' && (
        <>
          <div className="search-bar">
            <input placeholder=" Buscar cliente..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="card" style={{padding:0}}>
            <div className="table-wrap">
              {loading ? <div className="spinner">Cargando...</div> : (
                <table>
                  <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Dirección</th><th>Registro</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {clientes.map(c=>(
                      <tr key={c.id_cliente}>
                        <td><strong>{c.nombre}</strong></td>
                        <td>{c.email||'—'}</td>
                        <td>{c.telefono||'—'}</td>
                        <td>{c.direccion||'—'}</td>
                        <td>{new Date(c.fecha_registro).toLocaleDateString('es-GT')}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>setModal(c)}>Editar</button>
                            <button className="btn btn-danger btn-sm" onClick={()=>deleteCliente(c.id_cliente)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!clientes.length && <tr><td colSpan="6" style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No hay clientes</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'historial' && (
        <div className="card" style={{padding:0}}>
          <div style={{padding:'16px 20px 0',color:'var(--text-muted)',fontSize:12}}>
            Consulta con LEFT JOIN + GROUP BY + HAVING — ranking de mejores clientes
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Email</th><th>Ventas</th><th>Monto Total</th><th>Última Compra</th></tr></thead>
              <tbody>
                {historial.map(c=>(
                  <tr key={c.id_cliente}>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.email||'—'}</td>
                    <td>{c.total_ventas}</td>
                    <td>Q{parseFloat(c.monto_total).toLocaleString()}</td>
                    <td>{c.ultima_compra ? new Date(c.ultima_compra).toLocaleDateString('es-GT') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <ClienteModal
          cliente={modal==='new'?null:modal}
          onSave={onSave}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}
