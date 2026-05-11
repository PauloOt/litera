import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarDays, MapPin, CalendarX } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import api from '../services/api';

/* ─── Utilitários ────────────────────────────────────────────────────── */
function formatarData(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatarHora(str) {
  if (!str) return '';
  return new Date(str).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarPreco(preco) {
  if (!preco || preco === 0) return 'Gratuito';
  return `R$ ${Number(preco).toFixed(2).replace('.', ',')}`;
}

/* ─── Filtros ────────────────────────────────────────────────────────── */
const FILTROS = [
  { label: 'Todos', valor: '' },
  { label: 'Esta semana', valor: 'semana' },
  { label: 'Este mês', valor: 'mes' },
];

/* ─── Card de Evento ─────────────────────────────────────────────────── */
function CardEvento({ evento }) {
  return (
    <div className="bg-sand rounded-2xl overflow-hidden hover:shadow-md hover:brightness-95 transition-all flex flex-col">
      {/* Capa */}
      <div className="relative w-full aspect-video bg-cream overflow-hidden">
        {evento.capa
          ? <img src={evento.capa} alt={evento.titulo} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <CalendarDays size={32} className="text-walnut" />
            </div>
        }
        {evento.ultimasVagas && (
          <span className="absolute top-2 left-2 bg-walnut text-cream font-body text-xs px-2 py-1 rounded-full font-medium">
            Últimas vagas!
          </span>
        )}
        {evento.descontoPlano?.percentual > 0 && (
          <span className="absolute top-2 right-2 bg-sand text-bark font-body text-xs px-2 py-1 rounded-full font-medium">
            -{evento.descontoPlano.percentual}%
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display font-semibold text-espresso leading-snug line-clamp-2">
          {evento.titulo}
        </h3>

        <div className="flex items-center gap-1.5 text-walnut font-body text-xs">
          <CalendarDays size={13} className="shrink-0" />
          <span>{formatarData(evento.dataHora)} às {formatarHora(evento.dataHora)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-walnut font-body text-xs">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{evento.local}</span>
        </div>

        <p className="font-body font-medium text-bark text-sm mt-auto pt-1">
          {formatarPreco(evento.preco)}
        </p>

        <Link
          to={`/eventos/${evento.id}`}
          className="mt-1 text-center font-body text-sm text-bark border border-bark px-3 py-1.5 rounded-lg hover:bg-bark hover:text-cream transition-all"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const params = {};
        if (filtro) params.filtro = filtro;
        if (busca.trim()) params.busca = busca.trim();
        const res = await api.get('/eventos', { params });
        setEventos(res.data);
      } catch {
        setEventos([]);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [filtro, busca]);

  const quantidade = eventos.length;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-espresso">Eventos Culturais</h1>
          <p className="font-body text-sm text-walnut mt-1">
            {carregando ? 'Carregando…' : `${quantidade} evento${quantidade !== 1 ? 's' : ''} disponíve${quantidade !== 1 ? 'is' : 'l'}`}
          </p>
        </div>

        {/* Filtros + busca */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 bg-sand rounded-xl p-1 w-fit">
            {FILTROS.map(f => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`font-body text-sm px-4 py-2 rounded-lg transition-all ${
                  filtro === f.valor
                    ? 'bg-cream text-espresso font-medium shadow-sm'
                    : 'text-walnut hover:text-espresso'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1 flex items-center gap-2 bg-sand rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-stone transition-all">
            <Search size={16} className="text-walnut shrink-0" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar evento..."
              className="flex-1 bg-transparent font-body text-sm text-espresso placeholder-walnut focus:outline-none"
            />
          </div>
        </div>

        {/* Conteúdo */}
        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-stone border-t-transparent rounded-full animate-spin" />
          </div>
        ) : eventos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-walnut">
            <CalendarX size={40} className="text-sand" />
            <p className="font-body text-sm">Nenhum evento disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventos.map(e => <CardEvento key={e.id} evento={e} />)}
          </div>
        )}
      </main>
    </div>
  );
}
