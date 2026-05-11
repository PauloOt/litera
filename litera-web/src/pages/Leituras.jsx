import { useEffect, useState } from 'react';
import { BookOpen, BookPlus, Plus, Star } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { CardLivro } from '../components/CardLivro';
import { BadgeStatus } from '../components/BadgeStatus';
import { Modal } from '../components/Modal';
import api from '../services/api';

/* ─── Utilitários de data ────────────────────────────────────────────── */
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

function badgeTexto(prazo) {
  const d = diffDias(prazo);
  if (d < 0) return `${Math.abs(d)}d atrasado`;
  if (d === 0) return 'Vence hoje';
  if (d <= 7) return `${d}d restantes`;
  return 'No prazo';
}

function formatarData(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('pt-BR');
}

/* ─── Abas ───────────────────────────────────────────────────────────── */
const ABAS = ['Ativas', 'Histórico', 'Avaliadas'];

/* ─── Estrelas (avaliação) ───────────────────────────────────────────── */
function Estrelas({ nota, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange && onChange(n)}
          className="focus:outline-none"
        >
          <Star
            size={20}
            className={n <= nota ? 'text-stone fill-stone' : 'text-sand fill-sand'}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Modal: Nova Leitura ────────────────────────────────────────────── */
function ModalNovaLeitura({ isOpen, onClose, onSalvo }) {
  const [titulo, setTitulo] = useState('');
  const [ondePegou, setOndePegou] = useState('');
  const [prazo, setPrazo] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function resetar() {
    setTitulo(''); setOndePegou(''); setPrazo(''); setErro('');
  }

  function fechar() { resetar(); onClose(); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim()) { setErro('Informe o título do livro.'); return; }
    if (!prazo) { setErro('Informe o prazo de devolução.'); return; }
    setSalvando(true);
    try {
      await api.post('/leituras', { titulo, ondePegou, prazoDevolucao: prazo });
      resetar();
      onSalvo();
    } catch {
      setErro('Erro ao registrar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={fechar} title="Registrar nova leitura">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-body text-sm text-walnut block mb-1">Título do livro *</label>
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Dom Casmurro"
            className="w-full border border-sand rounded-lg px-3 py-2 font-body text-sm text-espresso bg-cream focus:outline-none focus:ring-2 focus:ring-stone"
          />
        </div>
        <div>
          <label className="font-body text-sm text-walnut block mb-1">Onde pegou?</label>
          <input
            value={ondePegou}
            onChange={e => setOndePegou(e.target.value)}
            placeholder="Ex: Biblioteca Municipal, amigo João"
            className="w-full border border-sand rounded-lg px-3 py-2 font-body text-sm text-espresso bg-cream focus:outline-none focus:ring-2 focus:ring-stone"
          />
        </div>
        <div>
          <label className="font-body text-sm text-walnut block mb-1">Prazo de devolução *</label>
          <input
            type="date"
            value={prazo}
            onChange={e => setPrazo(e.target.value)}
            className="w-full border border-sand rounded-lg px-3 py-2 font-body text-sm text-espresso bg-cream focus:outline-none focus:ring-2 focus:ring-stone"
          />
        </div>

        {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

        <div className="flex gap-3 justify-end pt-1">
          <button
            type="button"
            onClick={fechar}
            className="font-body text-sm text-walnut px-4 py-2 rounded-lg border border-sand hover:bg-sand transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="font-body text-sm text-cream bg-bark px-4 py-2 rounded-lg hover:brightness-90 transition-all disabled:opacity-60"
          >
            {salvando ? 'Registrando…' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Modal: Devolver ────────────────────────────────────────────────── */
function ModalDevolver({ leitura, onClose, onDevolvido }) {
  const [etapa, setEtapa] = useState('confirmar'); // 'confirmar' | 'avaliar'
  const [nota, setNota] = useState(0);
  const [resenha, setResenha] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  if (!leitura) return null;

  const diasDiff = diffDias(leitura.prazoDevolucao);
  const noPrazo = diasDiff >= 0;

  async function confirmarDevolucao() {
    setSalvando(true);
    try {
      await api.put(`/leituras/${leitura.id}/devolver`);
      setEtapa('avaliar');
    } catch {
      setErro('Erro ao registrar devolução. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function enviarAvaliacao() {
    if (nota === 0) { setErro('Selecione uma nota.'); return; }
    setSalvando(true);
    try {
      await api.post(`/leituras/${leitura.id}/avaliar`, { nota, resenha });
      onDevolvido();
    } catch {
      setErro('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen={!!leitura} onClose={onClose} title="Devolver livro">
      {etapa === 'confirmar' && (
        <div className="flex flex-col gap-4">
          <p className="font-body text-sm text-walnut">
            Confirme a devolução de{' '}
            <span className="font-medium text-espresso">"{leitura.titulo}"</span>
          </p>

          <div className="bg-sand rounded-lg p-3 flex flex-col gap-1 font-body text-sm">
            <p className="text-walnut">
              Prazo previsto:{' '}
              <span className="text-espresso font-medium">{formatarData(leitura.prazoDevolucao)}</span>
            </p>
            <p className="text-walnut">
              Data de hoje:{' '}
              <span className="text-espresso font-medium">{formatarData(new Date().toISOString())}</span>
            </p>
          </div>

          {noPrazo ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-green-700 font-body text-sm font-medium">
                ✓ No prazo — você ganhará +20 pontos!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-red-700 font-body text-sm font-medium">
                ⚠ Atrasado — sem pontos desta vez
              </span>
            </div>
          )}

          {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="font-body text-sm text-walnut px-4 py-2 rounded-lg border border-sand hover:bg-sand transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarDevolucao}
              disabled={salvando}
              className="font-body text-sm text-cream bg-bark px-4 py-2 rounded-lg hover:brightness-90 transition-all disabled:opacity-60"
            >
              {salvando ? 'Confirmando…' : 'Confirmar devolução'}
            </button>
          </div>
        </div>
      )}

      {etapa === 'avaliar' && (
        <div className="flex flex-col gap-4">
          <p className="font-body text-sm text-walnut">
            Devolução registrada! Que tal avaliar{' '}
            <span className="font-medium text-espresso">"{leitura.titulo}"</span>?
          </p>
          <div className="bg-stone/10 rounded-lg px-3 py-2">
            <p className="font-body text-sm text-stone font-medium">+25 pts por avaliar</p>
          </div>

          <div>
            <label className="font-body text-sm text-walnut block mb-2">Sua nota</label>
            <Estrelas nota={nota} onChange={setNota} />
          </div>

          <div>
            <label className="font-body text-sm text-walnut block mb-1">Resenha (opcional)</label>
            <textarea
              value={resenha}
              onChange={e => setResenha(e.target.value)}
              rows={3}
              placeholder="O que achou do livro?"
              className="w-full border border-sand rounded-lg px-3 py-2 font-body text-sm text-espresso bg-cream focus:outline-none focus:ring-2 focus:ring-stone resize-none"
            />
          </div>

          {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onDevolvido}
              className="font-body text-sm text-walnut px-4 py-2 rounded-lg border border-sand hover:bg-sand transition-colors"
            >
              Avaliar depois
            </button>
            <button
              onClick={enviarAvaliacao}
              disabled={salvando}
              className="font-body text-sm text-cream bg-bark px-4 py-2 rounded-lg hover:brightness-90 transition-all disabled:opacity-60"
            >
              {salvando ? 'Enviando…' : 'Avaliar agora'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ─── Aba: Ativas ────────────────────────────────────────────────────── */
function AbaAtivas({ leituras, onDevolver }) {
  if (leituras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-walnut">
        <BookPlus size={40} className="text-sand" />
        <p className="font-body text-sm">Você não tem leituras ativas. Que tal registrar uma?</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {leituras.map(l => (
        <CardLivro
          key={l.id}
          variante="horizontal"
          titulo={l.titulo}
          ondePegou={l.ondePegou}
          prazo={formatarData(l.prazoDevolucao)}
          badge
          statusVariant={badgeVariant(l.prazoDevolucao)}
          badgeTexto={badgeTexto(l.prazoDevolucao)}
          botao={
            <button
              onClick={() => onDevolver(l)}
              className="font-body text-xs text-bark border border-bark px-3 py-1.5 rounded-lg hover:bg-bark hover:text-cream transition-all whitespace-nowrap"
            >
              Devolver
            </button>
          }
        />
      ))}
    </div>
  );
}

/* ─── Aba: Histórico ─────────────────────────────────────────────────── */
function AbaHistorico({ leituras }) {
  if (leituras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-walnut">
        <BookOpen size={40} className="text-sand" />
        <p className="font-body text-sm">Nenhuma leitura devolvida ainda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {leituras.map(l => (
        <div key={l.id} className="flex items-center justify-between bg-sand rounded-xl px-4 py-3">
          <div className="min-w-0">
            <p className="font-body font-medium text-sm text-espresso truncate">{l.titulo}</p>
            {l.autor && <p className="font-body text-xs text-walnut">{l.autor}</p>}
            <p className="font-body text-xs text-walnut mt-0.5">
              Devolvido em {formatarData(l.dataDevolucao)}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <BadgeStatus variant={l.noPrazo ? 'no-prazo' : 'vencido'}>
              {l.noPrazo ? 'No prazo' : 'Atrasado'}
            </BadgeStatus>
            {l.pontosGanhos > 0 && (
              <span className="font-body text-xs font-medium text-stone">
                +{l.pontosGanhos} pts
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Aba: Avaliadas ─────────────────────────────────────────────────── */
function AbaAvaliadas({ leituras }) {
  if (leituras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-walnut">
        <Star size={40} className="text-sand" />
        <p className="font-body text-sm">Você ainda não avaliou nenhuma leitura.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {leituras.map(l => (
        <CardLivro
          key={l.id}
          variante="vertical"
          titulo={l.titulo}
          autor={l.autor}
          capa={l.capa}
          botao={
            <div className="flex flex-col gap-1">
              <Estrelas nota={l.nota} />
              {l.resenha && (
                <p className="font-body text-xs text-walnut line-clamp-2">{l.resenha}</p>
              )}
            </div>
          }
        />
      ))}
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Leituras() {
  const [abaAtiva, setAbaAtiva] = useState('Ativas');
  const [ativas, setAtivas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [avaliadas, setAvaliadas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNova, setModalNova] = useState(false);
  const [leituraDevolver, setLeituraDevolver] = useState(null);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [resAtivas, resHistorico] = await Promise.all([
        api.get('/leituras/ativas'),
        api.get('/leituras/historico'),
      ]);
      setAtivas(resAtivas.data);
      const hist = resHistorico.data;
      setHistorico(hist);
      setAvaliadas(hist.filter(l => l.nota));
    } catch {
      // mantém listas vazias em caso de erro
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  function handleSalvo() { setModalNova(false); carregarDados(); }
  function handleDevolvido() { setLeituraDevolver(null); carregarDados(); }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-3xl text-espresso">Minhas Leituras</h1>
          <button
            onClick={() => setModalNova(true)}
            className="flex items-center gap-2 bg-bark text-cream font-body text-sm px-4 py-2 rounded-lg hover:brightness-90 transition-all"
          >
            <Plus size={16} />
            Nova leitura
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-1 bg-sand rounded-xl p-1 mb-6 w-fit">
          {ABAS.map(aba => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`font-body text-sm px-4 py-2 rounded-lg transition-all ${
                abaAtiva === aba
                  ? 'bg-cream text-espresso font-medium shadow-sm'
                  : 'text-walnut hover:text-espresso'
              }`}
            >
              {aba}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-stone border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {abaAtiva === 'Ativas' && (
              <AbaAtivas leituras={ativas} onDevolver={setLeituraDevolver} />
            )}
            {abaAtiva === 'Histórico' && (
              <AbaHistorico leituras={historico} />
            )}
            {abaAtiva === 'Avaliadas' && (
              <AbaAvaliadas leituras={avaliadas} />
            )}
          </>
        )}
      </main>

      <ModalNovaLeitura
        isOpen={modalNova}
        onClose={() => setModalNova(false)}
        onSalvo={handleSalvo}
      />

      <ModalDevolver
        leitura={leituraDevolver}
        onClose={() => setLeituraDevolver(null)}
        onDevolvido={handleDevolvido}
      />
    </div>
  );
}
