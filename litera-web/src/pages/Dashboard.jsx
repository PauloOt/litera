import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { CardMetrica } from '../components/CardMetrica';
import { CardLivro } from '../components/CardLivro';
import { BarraProgresso } from '../components/BarraProgresso';
import { BadgePlano } from '../components/BadgePlano';
import { BadgeStatus } from '../components/BadgeStatus';
import api from '../services/api';

/* ─── Utilitário de data ─────────────────────────────────────────────── */
function dataHoje() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function diffDias(prazo) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(prazo);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / 86400000);
}

function badgeVariant(prazo) {
  const d = diffDias(prazo);
  if (d < 0) return 'vencido';
  if (d <= 7) return 'atencao';
  return 'no-prazo';
}

function formatarData(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR');
}

/* ─── Seção: Leituras próximas ───────────────────────────────────────── */
function SecaoLeituras({ leituras }) {
  const proximas = leituras
    .filter(l => diffDias(l.prazoDevolucao) <= 7)
    .slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-xl text-espresso">
          Atenção — devoluções próximas
        </h2>
        <Link to="/leituras" className="text-sm font-body text-stone hover:underline">
          Ver todas as leituras
        </Link>
      </div>

      {proximas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 bg-sand rounded-2xl text-center">
          <CheckCircle size={32} className="text-green-500" />
          <p className="font-body text-walnut">Tudo em dia!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {proximas.map(l => (
            <CardLivro
              key={l.id}
              variante="horizontal"
              titulo={l.titulo}
              ondePegou={l.ondePegou}
              prazo={formatarData(l.prazoDevolucao)}
              badge
              statusVariant={badgeVariant(l.prazoDevolucao)}
              badgeTexto={
                diffDias(l.prazoDevolucao) < 0
                  ? `Vencido há ${Math.abs(diffDias(l.prazoDevolucao))} dia(s)`
                  : diffDias(l.prazoDevolucao) === 0
                  ? 'Vence hoje'
                  : `${diffDias(l.prazoDevolucao)} dia(s)`
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Seção: Desafios ────────────────────────────────────────────────── */
function SecaoDesafios({ desafios }) {
  const ativos = desafios.slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-xl text-espresso">Seus desafios</h2>
        <Link to="/pontos" className="text-sm font-body text-stone hover:underline">
          Ver todos os desafios
        </Link>
      </div>

      {ativos.length === 0 ? (
        <div className="py-8 bg-sand rounded-2xl text-center">
          <p className="font-body text-walnut">Nenhum desafio em andamento.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ativos.map(d => (
            <div key={d.id} className="bg-sand rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-body font-medium text-espresso">{d.nome}</p>
                <span className="text-xs font-body text-stone whitespace-nowrap shrink-0">
                  +{d.pontosRecompensa} pts
                </span>
              </div>
              <p className="text-xs font-body text-walnut mb-2">
                {d.progresso} de {d.meta} livros
              </p>
              <BarraProgresso value={d.progresso} max={d.meta} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Seção: Próximos Eventos ────────────────────────────────────────── */
function SecaoEventos({ eventos }) {
  const proximos = eventos.slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-xl text-espresso">Eventos em breve</h2>
        <Link to="/eventos" className="text-sm font-body text-stone hover:underline">
          Ver todos os eventos
        </Link>
      </div>

      {proximos.length === 0 ? (
        <div className="py-8 bg-sand rounded-2xl text-center">
          <p className="font-body text-walnut">Nenhum evento em breve.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {proximos.map(ev => (
            <div key={ev.id} className="bg-sand rounded-2xl overflow-hidden card-hover">
              {ev.capa ? (
                <img src={ev.capa} alt={ev.titulo} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-bark/10 flex items-center justify-center">
                  <BookOpen size={28} className="text-walnut" />
                </div>
              )}
              <div className="p-3">
                <p className="font-body font-medium text-espresso line-clamp-2 text-sm">
                  {ev.titulo}
                </p>
                <p className="font-body text-xs text-walnut mt-1">
                  {formatarData(ev.data)}
                </p>
                <p className="font-body text-xs text-stone mt-0.5">
                  {ev.preco === 0 || ev.preco == null ? 'Gratuito' : `R$ ${ev.preco.toFixed(2)}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Dashboard (página principal) ──────────────────────────────────── */
export default function Dashboard() {
  const [perfil,   setPerfil]   = useState(null);
  const [pontos,   setPontos]   = useState(null);
  const [leituras, setLeituras] = useState([]);
  const [desafios, setDesafios] = useState([]);
  const [eventos,  setEventos]  = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [rPerfil, rPontos, rLeituras, rDesafios, rEventos] = await Promise.allSettled([
          api.get('/perfil'),
          api.get('/pontos'),
          api.get('/leituras/ativas'),
          api.get('/desafios'),
          api.get('/eventos'),
        ]);

        if (rPerfil.status   === 'fulfilled') setPerfil(rPerfil.value.data);
        if (rPontos.status   === 'fulfilled') setPontos(rPontos.value.data);
        if (rLeituras.status === 'fulfilled') setLeituras(rLeituras.value.data ?? []);
        if (rDesafios.status === 'fulfilled') setDesafios(rDesafios.value.data ?? []);
        if (rEventos.status  === 'fulfilled') setEventos(rEventos.value.data ?? []);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  /* Próxima devolução */
  const proximaDevolucao = leituras.length > 0
    ? leituras.reduce((min, l) => {
        const d = new Date(l.prazoDevolucao);
        return d < new Date(min.prazoDevolucao) ? l : min;
      })
    : null;

  /* Métricas */
  const metricas = [
    {
      icon: BookOpen,
      valor: carregando ? '—' : leituras.length,
      rotulo: 'Leituras ativas',
      corIcone: 'text-stone',
    },
    {
      icon: Star,
      valor: carregando ? '—' : (pontos?.saldo ?? 0),
      rotulo: 'Pontos acumulados',
      corIcone: 'text-walnut',
    },
    {
      icon: TrendingUp,
      valor: carregando ? '—' : (pontos?.nivel ?? '—'),
      rotulo: 'Nível atual',
      corIcone: 'text-bark',
    },
    {
      icon: Clock,
      valor: carregando ? '—' : (proximaDevolucao ? formatarData(proximaDevolucao.prazoDevolucao) : '—'),
      rotulo: 'Próxima devolução',
      corIcone: 'text-stone',
    },
  ];

  const nome = perfil?.nomeCompleto?.split(' ')[0] ?? 'leitor';
  const plano = perfil?.plano ?? 'Gratuito';

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] p-6 md:p-10 max-w-5xl">

        {/* Cabeçalho */}
        <header className="mb-8">
          <h1 className="font-display font-semibold text-3xl text-espresso">
            Olá, {nome}! 👋
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="font-body text-sm text-walnut capitalize">{dataHoje()}</p>
            <BadgePlano plano={plano} />
          </div>
        </header>

        {/* Grid de métricas */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {metricas.map(m => (
            <CardMetrica key={m.rotulo} {...m} />
          ))}
        </section>

        {/* Leituras próximas */}
        <div className="mb-10">
          <SecaoLeituras leituras={leituras} />
        </div>

        {/* Desafios */}
        <div className="mb-10">
          <SecaoDesafios desafios={desafios} />
        </div>

        {/* Eventos */}
        <div className="mb-10">
          <SecaoEventos eventos={eventos} />
        </div>

      </main>
    </div>
  );
}
