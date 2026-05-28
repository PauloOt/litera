import { createContext, useCallback, useContext, useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

/* ─── Provider ───────────────────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seqRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback((toast) => {
    const id = ++seqRef.current;
    const duracao = toast.duracao ?? 4000;
    setToasts((curr) => [...curr, { ...toast, id }]);
    setTimeout(() => dismiss(id), duracao);
    return id;
  }, [dismiss]);

  // Atalho — dispara a partir de um PontosGanhosDTO {pontosGanhos, acao, novoSaldo}
  const mostrarPontos = useCallback((dto, mensagemCustomizada) => {
    if (!dto || !dto.pontosGanhos || dto.pontosGanhos <= 0) return;
    const mensagem = mensagemCustomizada || mensagemPorAcao(dto.acao);
    mostrar({ tipo: 'pontos', pontos: dto.pontosGanhos, mensagem });
  }, [mostrar]);

  return (
    <ToastContext.Provider value={{ mostrar, mostrarPontos, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onClose={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}

/* ─── Container + Card ───────────────────────────────────────────────── */
function ToastContainer({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onClose }) {
  const [entrando, setEntrando] = useState(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntrando(false));
    return () => cancelAnimationFrame(id);
  }, []);

  const ehPontos = toast.tipo === 'pontos';
  const Icone = ehPontos ? Sparkles : CheckCircle;

  return (
    <div
      className={`pointer-events-auto w-[320px] max-w-[calc(100vw-2rem)] bg-espresso text-cream rounded-2xl shadow-2xl overflow-hidden
        transition-all duration-300 ${entrando ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className={`shrink-0 rounded-full p-1.5 ${ehPontos ? 'bg-stone/30' : 'bg-green-500/30'}`}>
          <Icone size={16} className={ehPontos ? 'text-stone' : 'text-green-300'} />
        </div>
        <div className="flex-1 min-w-0">
          {ehPontos && (
            <p className="font-display font-bold text-base text-stone leading-tight">
              +{toast.pontos} pts
            </p>
          )}
          <p className="font-body text-sm text-cream/90 leading-snug">{toast.mensagem}</p>
        </div>
        <button
          onClick={onClose}
          className="text-cream/50 hover:text-cream transition-colors shrink-0"
          aria-label="Fechar notificação"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function mensagemPorAcao(acao) {
  switch (acao) {
    case 'DEVOLUCAO_NO_PRAZO': return 'Devolução no prazo!';
    case 'AVALIAR_LIVRO': return 'Obrigado por avaliar o livro!';
    case 'ESCREVER_RESENHA': return 'Resenha publicada — obrigado!';
    case 'CHECKIN_EVENTO': return 'Check-in realizado!';
    case 'PARTICIPAR_EVENTO': return 'Você comprou um ingresso!';
    case 'CADASTRAR_LIVRO': return 'Livro cadastrado!';
    case 'INDICACAO': return 'Indicação confirmada!';
    case 'DESAFIO_CONCLUIDO': return 'Desafio concluído!';
    default: return 'Você ganhou pontos!';
  }
}
