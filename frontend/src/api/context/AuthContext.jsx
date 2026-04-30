import { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.user, token: action.token, loading: false };
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
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) {
      dispatch({ type: 'LOGIN', token, user: JSON.parse(user) });
    } else {
      dispatch({ type: 'LOADED' });
    }
  }, []);

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    dispatch({ type: 'LOGIN', token: data.token, user: data.user });
  }

  function logout() {
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
