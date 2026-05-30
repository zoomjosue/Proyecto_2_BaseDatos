import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const roles = ['rol_admin', 'rol_gerente', 'rol_vendedor', 'rol_inventario', 'rol_consulta'];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: 'secret', rol: 'rol_consulta' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    try {
      setUsuarios(await api.get('/usuarios'));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  function set(k, v) {
    setForm((current) => ({ ...current, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/usuarios', form);
      setSuccess('Usuario registrado');
      setForm({ nombre: '', email: '', password: 'secret', rol: 'rol_consulta' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <p className="page-subtitle">Administracion de usuarios asociados a roles</p>
      </div>

      {error && <div className="alert alert-error" onClick={()=>setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={()=>setSuccess('')}>{success}</div>}

      <div className="card">
        <div className="card-title">Nuevo Usuario</div>
        <form onSubmit={submit} className="form-grid">
          <div className="form-group">
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e)=>set('nombre', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e)=>set('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contrasena</label>
            <input type="password" value={form.password} onChange={(e)=>set('password', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select value={form.rol} onChange={(e)=>set('rol', e.target.value)}>
              {roles.map((rol)=><option key={rol} value={rol}>{rol}</option>)}
            </select>
          </div>
          <div className="form-actions" style={{gridColumn:'1/-1'}}>
            <button className="btn btn-primary">Crear usuario</button>
          </div>
        </form>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Empleado</th><th>Contrato</th></tr></thead>
            <tbody>
              {usuarios.map((u)=>(
                <tr key={u.id_usuario}>
                  <td><strong>{u.nombre}</strong></td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-info">{u.rol}</span></td>
                  <td>{u.id_empleado || '-'}</td>
                  <td>{u.fecha_contrato ? new Date(u.fecha_contrato).toLocaleDateString('es-GT') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
