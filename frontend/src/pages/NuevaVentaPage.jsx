import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function NuevaVentaPage() {
  const { user } = useAuth();
  const [productos,  setProductos]  = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [empleados,  setEmpleados]  = useState([]);
  const [cart,       setCart]       = useState([]);
  const [idCliente,  setIdCliente]  = useState('');
  const [idEmpleado, setIdEmpleado] = useState('');
  const [search,     setSearch]     = useState('');
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [loading,    setLoading]    = useState(false);

  useEffect(()=>{
    Promise.all([
      api.get('/productos'),
      api.get('/clientes'),
      api.get('/empleados'),
    ]).then(([prods, clts, emps])=>{
      setProductos(prods);
      setClientes(clts);
      setEmpleados(emps);
      const emp = emps.find(e=>e.email===user?.email);
      if (emp) setIdEmpleado(emp.id_empleado);
    }).catch(e=>setError(e.message));
  },[]);

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) && p.stock > 0
  );

  function addToCart(producto) {
    setCart(prev => {
      const existing = prev.find(i=>i.id_producto===producto.id_producto);
      if (existing) {
        if (existing.cantidad >= producto.stock) {
          setError(`Stock máximo: ${producto.stock}`); return prev;
        }
        return prev.map(i=>i.id_producto===producto.id_producto
          ? {...i, cantidad: i.cantidad+1}
          : i
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i=>i.id_producto!==id));
  }

  function changeQty(id, qty) {
    if (qty < 1) return;
    const prod = productos.find(p=>p.id_producto===id);
    if (qty > prod.stock) { setError(`Stock disponible: ${prod.stock}`); return; }
    setCart(prev => prev.map(i=>i.id_producto===id ? {...i, cantidad:qty} : i));
  }

  const total = cart.reduce((s,i)=>s+parseFloat(i.precio)*i.cantidad, 0);

  async function confirmar() {
    setError(''); setSuccess('');
    if (!idCliente)  return setError('Selecciona un cliente');
    if (!idEmpleado) return setError('Selecciona un empleado');
    if (!cart.length) return setError('El carrito está vacío');
    setLoading(true);
    try {
      const items = cart.map(i=>({id_producto:i.id_producto, cantidad:i.cantidad}));
      const res = await api.post('/ventas', {
        id_cliente:  parseInt(idCliente),
        id_empleado: parseInt(idEmpleado),
        items,
      });
      setSuccess(` Venta #${res.id_venta} registrada correctamente por Q${parseFloat(res.total).toLocaleString()}`);
      setCart([]);
      const prods = await api.get('/productos');
      setProductos(prods);
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Nueva Venta</h1>
        <p className="page-subtitle">Transacción explícita con BEGIN/COMMIT/ROLLBACK en el backend</p>
      </div>

      {error   && <div className="alert alert-error"   onClick={()=>setError('')}>{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:20}}>
        <div>
          <div className="card">
            <div className="card-title">Seleccionar Productos</div>
            <input placeholder=" Buscar producto..." value={search}
                   onChange={e=>setSearch(e.target.value)} style={{marginBottom:16}} />
            <div style={{maxHeight:400,overflowY:'auto'}}>
              <table>
                <thead><tr><th>Producto</th><th>Deporte</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
                <tbody>
                  {filtrados.map(p=>(
                    <tr key={p.id_producto}>
                      <td><strong>{p.nombre}</strong>{p.talla&&<small style={{color:'var(--text-muted)'}}> T:{p.talla}</small>}</td>
                      <td>{p.deporte}</td>
                      <td>Q{parseFloat(p.precio).toLocaleString()}</td>
                      <td className={p.stock<p.stock_minimo?'chip-low':'chip-ok'}>{p.stock}</td>
                      <td><button className="btn btn-primary btn-sm" onClick={()=>addToCart(p)}>+</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title"> Carrito</div>

            <div className="form-group" style={{marginBottom:12}}>
              <label>Cliente *</label>
              <select value={idCliente} onChange={e=>setIdCliente(e.target.value)}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c=><option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:16}}>
              <label>Empleado *</label>
              <select value={idEmpleado} onChange={e=>setIdEmpleado(e.target.value)}>
                <option value="">Seleccionar empleado...</option>
                {empleados.map(e=><option key={e.id_empleado} value={e.id_empleado}>{e.nombre}</option>)}
              </select>
            </div>

            {cart.length === 0 ? (
              <p style={{color:'var(--text-muted)',textAlign:'center',padding:'20px 0'}}>
                Agrega productos al carrito
              </p>
            ) : (
              <div>
                {cart.map(item=>(
                  <div key={item.id_producto} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{item.nombre}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>Q{parseFloat(item.precio).toLocaleString()} c/u</div>
                    </div>
                    <input type="number" min="1" value={item.cantidad}
                           onChange={e=>changeQty(item.id_producto, parseInt(e.target.value))}
                           style={{width:60,textAlign:'center'}} />
                    <button className="btn btn-danger btn-sm" onClick={()=>removeFromCart(item.id_producto)}>✕</button>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',marginTop:16,fontSize:16,fontFamily:'var(--font-head)',letterSpacing:1}}>
                  <span>TOTAL</span>
                  <span style={{color:'var(--accent)'}}>Q{total.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:16}}
                    onClick={confirmar} disabled={loading||!cart.length}>
              {loading ? 'Procesando...' : ' Confirmar Venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
