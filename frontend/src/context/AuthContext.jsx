import { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.user, loading: false };
    case 'LOGOUT':
      return { user: null, token: null, loading: false };
    case 'LOADED':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    api.get('/auth/me')
      .then(data => data.user ? dispatch({ type: 'LOGIN', user: data.user }) : dispatch({ type: 'LOADED' }))
      .catch(() => dispatch({ type: 'LOADED' }));
  }, []);

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    dispatch({ type: 'LOGIN', user: data.user });
  }

  async function logout() {
    await api.post('/auth/logout', {}).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
