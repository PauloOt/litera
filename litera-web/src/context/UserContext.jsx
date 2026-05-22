import { createContext, useCallback, useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [pontos, setPontos] = useState(null);

  const refreshPontos = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/pontos');
      setPontos(data);
    } catch {
      // silencia — endpoint pode não existir ainda
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ pontos, setPontos, refreshPontos }}>
      {children}
    </UserContext.Provider>
  );
}

export function usePontos() {
  return useContext(UserContext);
}
