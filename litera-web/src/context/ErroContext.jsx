import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import api from '../services/api';

const ErroContext = createContext(null);

export function ErroProvider({ children }) {
  const [erro, setErro] = useState(null);
  const timerRef = useRef(null);

  const mostrarErro = useCallback((info) => {
    setErro(info);
    // Auto-dismiss após 6 segundos
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setErro(null), 6000);
  }, []);

  const fechar = useCallback(() => {
    clearTimeout(timerRef.current);
    setErro(null);
  }, []);

  useEffect(() => {
    api._onErro = mostrarErro;
    return () => { api._onErro = null; };
  }, [mostrarErro]);

  return (
    <ErroContext.Provider value={{ mostrarErro }}>
      {children}
      {erro && <ToastErro erro={erro} onClose={fechar} />}
    </ErroContext.Provider>
  );
}

export function useErro() {
  return useContext(ErroContext);
}

function ToastErro({ erro, onClose }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 animate-slide-up">
      <div className="bg-espresso text-cream rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 px-4 py-4">
          <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <p className="font-body text-sm flex-1">{erro.mensagem}</p>
          <button
            onClick={onClose}
            className="text-cream/50 hover:text-cream transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
