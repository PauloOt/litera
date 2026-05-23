import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import api from '../services/api';

export default function PagamentoSucesso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('confirmando'); // confirmando | ok | erro

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) { setStatus('ok'); return; }

    api.post(`/pagamentos/confirmar-ingresso?sessionId=${sessionId}`)
      .then(() => setStatus('ok'))
      .catch(() => setStatus('erro'));
  }, []);

  if (status === 'confirmando') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader size={40} className="text-stone animate-spin" />
          <p className="font-body text-sm text-walnut">Confirmando pagamento…</p>
        </div>
      </div>
    );
  }

  if (status === 'erro') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
          <p className="font-body text-sm text-red-600">
            Pagamento recebido, mas houve um erro ao gerar o ingresso. Entre em contato com o suporte.
          </p>
          <button
            onClick={() => navigate('/meus-ingressos')}
            className="font-body text-sm text-walnut underline"
          >
            Ver meus ingressos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
        <CheckCircle size={64} className="text-green-500" />

        <div>
          <h1 className="font-display font-bold text-2xl text-espresso mb-2">
            Compra confirmada!
          </h1>
          <p className="font-body text-sm text-walnut">
            Seu ingresso foi gerado e está disponível em "Meus Ingressos".
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate('/meus-ingressos')}
            className="w-full font-body font-medium text-cream bg-bark py-3 rounded-xl hover:brightness-90 transition-all"
          >
            Ver meus ingressos
          </button>
          <button
            onClick={() => navigate('/eventos')}
            className="w-full font-body text-sm text-walnut py-3 rounded-xl border border-sand hover:bg-sand transition-colors"
          >
            Explorar mais eventos
          </button>
        </div>
      </div>
    </div>
  );
}
