import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PagamentoCancelado() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
        <XCircle size={64} className="text-red-400" />

        <div>
          <h1 className="font-display font-bold text-2xl text-espresso mb-2">
            Pagamento cancelado
          </h1>
          <p className="font-body text-sm text-walnut">
            Nenhuma cobrança foi feita. Você pode tentar novamente quando quiser.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full font-body font-medium text-cream bg-bark py-3 rounded-xl hover:brightness-90 transition-all"
        >
          Voltar ao evento
        </button>
      </div>
    </div>
  );
}
