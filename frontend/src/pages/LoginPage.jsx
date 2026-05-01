import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [email, setEmail]   = useState('');
  const [pass,  setPass]    = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, pass);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo"> SPORT GT</div>
        <p className="login-sub">Sistema de Gestión de Tienda Deportiva</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom:16, textAlign:'left'}}>
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                   placeholder="admin@tienda.com" required />
          </div>
          <div className="form-group" style={{marginBottom:24, textAlign:'left'}}>
            <label>Contraseña</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
                   placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{width:'100%', justifyContent:'center'}}
                  disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
