import { useEffect, useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { BarraProgresso } from '../components/BarraProgresso';
import { BadgePlano } from '../components/BadgePlano';
import { Modal } from '../components/Modal';
import api from '../services/api';

/* ─── Dados fixos de níveis ──────────────────────────────────────────── */
const NIVEIS = [
  { nivel: 'BRONZE',   emoji: '🥉', label: 'Bronze',   min: 0,     max: 499   },
  { nivel: 'PRATA',    emoji: '🥈', label: 'Prata',    min: 500,   max: 1499  },
  { nivel: 'OURO',     emoji: '🥇', label: 'Ouro',     min: 1500,  max: 3999  },
  { nivel: 'PLATINA',  emoji: '💎', label: 'Platina',  min: 4000,  max: 9999  },
  { nivel: 'DIAMANTE', emoji: '👑', label: 'Diamante', min: 10000, max: null  },
];

const RESGATES = [
  { pontos: 100, desconto: 5  },
  { pontos: 200, desconto: 10 },
  { pontos: 300, desconto: 15 },
];

function nivelInfo(nivel) {
  return NIVEIS.find(n => n.nivel === nivel) ?? NIVEIS[0];
}

function formatarData(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ─── Card de Nível ──────────────────────────────────────────────────── */
function CardNivel({ dados, tabelaAberta, onToggleTabela }) {
  const info = nivelInfo(dados.nivel);
  const prox = NIVEIS[NIVEIS.indexOf(info) + 1];

  const progresso = prox
    ? Math.min(100, Math.round(((dados.saldo - info.min) / (prox.min - info.min)) * 100))
    : 100;

  return (
    <div className="bg-espresso rounded-2xl p-6 text-cream mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-body text-sm text-cream/60 mb-1">Seu nível</p>
          <h2 className="font-display font-bold text-2xl">
            {info.emoji} {info.label}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <BadgePlano plano={dados.plano} />
          <span className="font-body text-xs text-cream/70 bg-cream/10 px-2 py-1 rounded-full">
            {dados.multiplicador}x pontos
          </span>
        </div>
      </div>

      <BarraProgresso valor={progresso} cor="stone" className="mb-2" />

      <p className="font-body text-xs text-cream/70">
        {prox
          ? `${dados.pontosParaProximoNivel} pontos para ${NIVEIS[NIVEIS.indexOf(info) + 1]?.label}`
          : 'Nível máximo atingido!'}
      </p>

      {/* Tabela colapsável */}
      <button
        onClick={onToggleTabela}
        className="flex items-center gap-1 font-body text-xs text-cream/60 hover:text-cream mt-4 transition-colors"
      >
        {tabelaAberta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Ver todos os níveis
      </button>

      {tabelaAberta && (
        <div className="mt-3 border border-cream/20 rounded-xl overflow-hidden">
          <table className="w-full font-body text-xs">
            <thead>
              <tr className="bg-cream/10">
                <th className="text-left px-3 py-2 text-cream/70">Nível</th>
                <th className="text-right px-3 py-2 text-cream/70">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {NIVEIS.map(n => (
                <tr
                  key={n.nivel}
                  className={`border-t border-cream/10 ${n.nivel === dados.nivel ? 'bg-cream/10' : ''}`}
                >
                  <td className="px-3 py-2 text-cream">{n.emoji} {n.label}</td>
                  <td className="px-3 py-2 text-right text-cream/70">
                    {n.max ? `${n.min.toLocaleString()} – ${n.max.toLocaleString()}` : `${n.min.toLocaleString()}+`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Seção: Desafios ────────────────────────────────────────────────── */
function SecaoDesafios({ desafios }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-semibold text-xl text-espresso mb-4">Seus Desafios</h2>
      {desafios.length === 0 ? (
        <p className="font-body text-sm text-walnut">Nenhum desafio disponível.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {desafios.map(d => (
            <div key={d.id} className="bg-sand rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-body font-medium text-sm text-espresso leading-snug">{d.titulo}</p>
                {d.concluido
                  ? <span className="shrink-0 font-body text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">✓ Concluído</span>
                  : <span className="shrink-0 font-body text-xs bg-sand text-bark border border-bark/30 px-2 py-0.5 rounded-full">{d.tipo}</span>
                }
              </div>

              <BarraProgresso
                valor={d.meta > 0 ? Math.min(100, Math.round((d.progressoAtual / d.meta) * 100)) : 0}
                cor="stone"
              />

              <div className="flex items-center justify-between">
                <p className="font-body text-xs text-walnut">
                  {d.concluido
                    ? `Concluído em ${formatarData(d.dataConclusao)}`
                    : `${d.progressoAtual} de ${d.meta} concluídos`}
                </p>
                <span className="font-body text-xs font-medium bg-stone text-cream px-2 py-0.5 rounded-full">
                  +{d.recompensa} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Seção: Resgatar Pontos ─────────────────────────────────────────── */
function SecaoResgate({ saldo, onResgatar }) {
  return (
    <section className="mb-8">
      <div className="bg-bark rounded-2xl p-6 text-cream">
        <h2 className="font-display font-semibold text-xl mb-1">Troque seus pontos por desconto em eventos</h2>
        <p className="font-body text-xs text-cream/70 mb-4">Saldo atual: {saldo} pontos</p>

        <div className="flex flex-col gap-2">
          {RESGATES.map(r => {
            const temSaldo = saldo >= r.pontos;
            return (
              <div key={r.pontos} className="flex items-center justify-between bg-cream/10 rounded-xl px-4 py-3">
                <div>
                  <p className="font-body font-medium text-sm">{r.pontos} pontos</p>
                  <p className="font-body text-xs text-cream/70">{r.desconto}% de desconto</p>
                </div>
                <button
                  onClick={() => temSaldo && onResgatar(r)}
                  disabled={!temSaldo}
                  className="font-body text-xs text-bark bg-cream px-3 py-1.5 rounded-lg hover:brightness-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Resgatar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Seção: Histórico ───────────────────────────────────────────────── */
function SecaoHistorico({ historico }) {
  const [pagina, setPagina] = useState(0);
  const POR_PAGINA = 10;
  const total = historico.length;
  const fatia = historico.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  return (
    <section className="mb-8">
      <h2 className="font-display font-semibold text-xl text-espresso mb-4">Histórico</h2>

      {historico.length === 0 ? (
        <p className="font-body text-sm text-walnut">Nenhuma transação ainda.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {fatia.map(h => (
              <div key={h.id} className="flex items-center justify-between bg-sand rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="font-body text-sm text-espresso truncate">{h.acao}</p>
                  <p className="font-body text-xs text-walnut">{formatarData(h.data)}</p>
                </div>
                <div className="shrink-0 text-right ml-3">
                  <p className="font-body font-medium text-sm text-stone">
                    +{h.pontosFinais} pts
                  </p>
                  {h.multiplicador > 1 && (
                    <p className="font-body text-xs text-walnut">{h.multiplicador}x</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {total > POR_PAGINA && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setPagina(p => Math.max(0, p - 1))}
                disabled={pagina === 0}
                className="font-body text-xs text-walnut px-3 py-1.5 border border-sand rounded-lg disabled:opacity-40 hover:bg-sand transition-colors"
              >
                ← Anterior
              </button>
              <span className="font-body text-xs text-walnut">
                {pagina + 1} / {Math.ceil(total / POR_PAGINA)}
              </span>
              <button
                onClick={() => setPagina(p => Math.min(Math.ceil(total / POR_PAGINA) - 1, p + 1))}
                disabled={(pagina + 1) * POR_PAGINA >= total}
                className="font-body text-xs text-walnut px-3 py-1.5 border border-sand rounded-lg disabled:opacity-40 hover:bg-sand transition-colors"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ─── Seção: Ranking ─────────────────────────────────────────────────── */
const MEDALHAS = ['🥇', '🥈', '🥉'];
const COR_POSICAO = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];

function SecaoRanking({ ranking }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-semibold text-xl text-espresso mb-4">Top 10 — Este mês</h2>

      {ranking.length === 0 ? (
        <p className="font-body text-sm text-walnut">Ranking indisponível.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {ranking.map((r, i) => (
            <div
              key={r.posicao}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
                i < 3 ? 'bg-sand' : 'bg-cream border border-sand'
              }`}
            >
              {/* Posição */}
              <span className={`font-display font-bold text-xl w-8 text-center shrink-0 ${COR_POSICAO[i] ?? 'text-walnut'}`}>
                {i < 3 ? MEDALHAS[i] : r.posicao}
              </span>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-bark flex items-center justify-center shrink-0">
                {r.foto
                  ? <img src={r.foto} alt={r.nomeCompleto} className="w-full h-full rounded-full object-cover" />
                  : <span className="font-body font-bold text-cream text-sm">
                      {r.nomeCompleto?.[0]?.toUpperCase()}
                    </span>
                }
              </div>

              {/* Nome */}
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-sm text-espresso truncate">{r.nomeCompleto}</p>
                <span className="font-body text-xs text-walnut">{nivelInfo(r.nivel)?.emoji} {nivelInfo(r.nivel)?.label}</span>
              </div>

              {/* Pontos */}
              <span className="font-body font-medium text-sm text-stone shrink-0">
                {r.pontosMes.toLocaleString()} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Modal cupom gerado ─────────────────────────────────────────────── */
function ModalCupom({ cupom, onClose }) {
  return (
    <Modal isOpen={!!cupom} onClose={onClose} title="Cupom gerado!">
      {cupom && (
        <div className="flex flex-col gap-4 items-center text-center">
          <div className="bg-sand rounded-xl px-6 py-4 w-full">
            <p className="font-body text-xs text-walnut mb-1">Seu código de desconto</p>
            <p className="font-display font-bold text-2xl text-bark tracking-widest">
              {cupom.codigoCupom}
            </p>
            <p className="font-body text-xs text-stone mt-1">{cupom.desconto}% de desconto em eventos</p>
          </div>
          <p className="font-body text-xs text-walnut">
            Saldo restante: <span className="font-medium text-espresso">{cupom.saldoRestante} pontos</span>
          </p>
          <button
            onClick={onClose}
            className="w-full font-body text-sm text-cream bg-bark py-2.5 rounded-xl hover:brightness-90 transition-all"
          >
            Fechar
          </button>
        </div>
      )}
    </Modal>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Pontos() {
  const [dados, setDados] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [desafios, setDesafios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [tabelaAberta, setTabelaAberta] = useState(false);
  const [cupomGerado, setCupomGerado] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [resPontos, resHistorico, resRanking, resDesafios] = await Promise.allSettled([
          api.get('/pontos'),
          api.get('/pontos/historico'),
          api.get('/pontos/ranking'),
          api.get('/desafios'),
        ]);
        if (resPontos.status === 'fulfilled') setDados(resPontos.value.data);
        if (resHistorico.status === 'fulfilled') setHistorico(resHistorico.value.data);
        if (resRanking.status === 'fulfilled') setRanking(resRanking.value.data);
        if (resDesafios.status === 'fulfilled') setDesafios(resDesafios.value.data);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function handleResgatar(opcao) {
    try {
      const res = await api.post('/pontos/resgatar/evento', { pontosResgatados: opcao.pontos });
      setCupomGerado(res.data);
      setDados(prev => prev ? { ...prev, saldo: res.data.saldoRestante } : prev);
    } catch (err) {
      alert(err.response?.data?.mensagem ?? 'Erro ao resgatar pontos.');
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center ml-[72px]">
          <div className="w-8 h-8 border-2 border-stone border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-8 px-4 md:px-8 page-enter">
        <div className="max-w-5xl mx-auto w-full">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-espresso">Pontos e Desafios</h1>
          {dados && (
            <p className="font-display font-bold text-4xl text-stone mt-1">
              {dados.saldo.toLocaleString()} pts
            </p>
          )}
        </div>

        {/* Card de nível */}
        {dados && (
          <CardNivel
            dados={dados}
            tabelaAberta={tabelaAberta}
            onToggleTabela={() => setTabelaAberta(v => !v)}
          />
        )}

        {/* Desafios */}
        <SecaoDesafios desafios={desafios} />

        {/* Resgatar */}
        {dados && (
          <SecaoResgate saldo={dados.saldo} onResgatar={handleResgatar} />
        )}

        {/* Histórico */}
        <SecaoHistorico historico={historico} />

        {/* Ranking */}
        <SecaoRanking ranking={ranking} />
        </div>
      </main>

      <ModalCupom cupom={cupomGerado} onClose={() => setCupomGerado(null)} />
    </div>
  );
}
