import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import api from '../services/api';

/* ─── Utilitários ────────────────────────────────────────────────────── */
function formatarData(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatarPreco(preco) {
  if (!preco || preco === 0) return 'Gratuito';
  return `R$ ${Number(preco).toFixed(2).replace('.', ',')}`;
}

/* ─── Card de ingresso ───────────────────────────────────────────────── */
function CardIngresso({ ingresso }) {
  const { evento, precoPago, codigoIngresso, checkInRealizado, dataCompra } = ingresso;

  return (
    <div className="bg-sand rounded-2xl overflow-hidden">
      {/* Cabeçalho do card */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-espresso leading-snug line-clamp-2">
            {evento?.titulo}
          </h3>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-1.5 font-body text-xs text-walnut">
              <CalendarDays size={12} className="shrink-0" />
              <span>{formatarData(evento?.dataHora)}</span>
            </div>
            {evento?.local && (
              <div className="flex items-center gap-1.5 font-body text-xs text-walnut">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{evento.local}</span>
              </div>
            )}
          </div>
        </div>

        <span className={`ml-3 shrink-0 font-body text-xs px-2.5 py-1 rounded-full font-medium ${
          checkInRealizado
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {checkInRealizado ? 'Check-in realizado ✓' : 'Aguardando check-in'}
        </span>
      </div>

      {/* Divider pontilhado */}
      <div className="border-t border-dashed border-walnut/30 mx-4" />

      {/* Código e preço */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-body text-xs text-walnut">Código do ingresso</p>
          <p className="font-body font-medium text-sm text-espresso tracking-wider">
            {codigoIngresso}
          </p>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-walnut">Valor pago</p>
          <p className="font-body font-medium text-sm text-bark">{formatarPreco(precoPago)}</p>
        </div>
      </div>

      {dataCompra && (
        <p className="font-body text-xs text-walnut px-4 pb-3">
          Comprado em {formatarData(dataCompra)}
        </p>
      )}
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function MeusIngressos() {
  const [ingressos, setIngressos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get('/meus-ingressos');
        setIngressos(res.data);
      } catch {
        setIngressos([]);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-8 px-4 md:px-8 page-enter">
        <div className="max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-espresso">Meus Ingressos</h1>
          <p className="font-body text-sm text-walnut mt-1">
            {carregando ? 'Carregando…' : `${ingressos.length} ingresso${ingressos.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-stone border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ingressos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-walnut">
            <Ticket size={40} className="text-sand" />
            <p className="font-body text-sm">Você ainda não comprou nenhum ingresso.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl">
            {ingressos.map(i => <CardIngresso key={i.id} ingresso={i} />)}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
