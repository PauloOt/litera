import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, CreditCard, Pencil, X, Check,
  Ticket, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { BadgePlano } from '../components/BadgePlano';
import { BadgeStatus } from '../components/BadgeStatus';
import api from '../services/api';

/* ─── Utilitários ────────────────────────────────────────────────────── */
function iniciais(nome = '') {
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function mascaraCpf(cpf = '') {
  const s = cpf.replace(/\D/g, '');
  if (s.length !== 11) return cpf;
  return `***.***.***-${s.slice(9)}`;
}

function mascaraEmail(email = '') {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visiveis = Math.min(3, local.length);
  return `${local.slice(0, visiveis)}***@${domain}`;
}

function formatarData(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('pt-BR');
}

/* ─── Avatar ─────────────────────────────────────────────────────────── */
function Avatar({ nome, foto, tamanho = 96 }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={nome}
        style={{ width: tamanho, height: tamanho, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return (
    <div style={{
      width: tamanho,
      height: tamanho,
      borderRadius: '50%',
      backgroundColor: 'var(--color-bark)',
      color: 'var(--color-cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontSize: tamanho * 0.35,
      fontWeight: 700,
      userSelect: 'none',
      flexShrink: 0,
    }}>
      {iniciais(nome)}
    </div>
  );
}

/* ─── Campo de formulário ────────────────────────────────────────────── */
function Campo({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--color-walnut)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  border: '1px solid var(--color-sand)',
  borderRadius: 10,
  padding: '10px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--color-espresso)',
  backgroundColor: '#fff',
  outline: 'none',
};

/* ─── Modal de cancelamento ──────────────────────────────────────────── */
function ModalCancelar({ onConfirmar, onFechar, carregando }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: 'var(--color-cream)', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <AlertTriangle size={22} style={{ color: '#EF4444', flexShrink: 0 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-espresso)', margin: 0 }}>
            Cancelar assinatura?
          </h3>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-walnut)', marginBottom: 24, lineHeight: 1.6 }}>
          Você perderá os benefícios do seu plano (descontos em eventos e multiplicador de pontos) ao final do período pago.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onFechar}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid var(--color-sand)',
              background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontSize: 14, color: 'var(--color-walnut)',
            }}
          >
            Manter plano
          </button>
          <button
            onClick={onConfirmar}
            disabled={carregando}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #EF4444',
              background: 'transparent', cursor: carregando ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 14, color: '#EF4444',
              opacity: carregando ? 0.65 : 1,
            }}
          >
            {carregando ? 'Cancelando…' : 'Confirmar cancelamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Perfil() {
  const [perfil,   setPerfil]   = useState(null);
  const [ingressos, setIngressos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [editando, setEditando] = useState(false);
  const [form, setForm]         = useState({ nomeCompleto: '', email: '', foto: '' });
  const [salvando, setSalvando] = useState(false);
  const [feedbackSalvo, setFeedbackSalvo] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');

  const [modalCancelar, setModalCancelar] = useState(false);
  const [cancelando, setCancelando]       = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const [rPerfil, rIngressos] = await Promise.allSettled([
          api.get('/perfil'),
          api.get('/meus-ingressos'),
        ]);
        if (rPerfil.status === 'fulfilled') {
          const p = rPerfil.value.data;
          setPerfil(p);
          setForm({ nomeCompleto: p.nomeCompleto ?? '', email: p.email ?? '', foto: p.foto ?? '' });
        }
        if (rIngressos.status === 'fulfilled') setIngressos(rIngressos.value.data ?? []);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErroPerfil('');
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!form.nomeCompleto.trim()) { setErroPerfil('Nome obrigatório'); return; }
    setSalvando(true);
    try {
      const { data } = await api.put('/perfil', form);
      setPerfil(p => ({ ...p, ...data }));
      setEditando(false);
      setFeedbackSalvo(true);
      setTimeout(() => setFeedbackSalvo(false), 3000);
    } catch {
      setErroPerfil('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleCancelarAssinatura() {
    setCancelando(true);
    try {
      await api.post('/pagamentos/cancelar');
      setPerfil(p => ({ ...p, plano: 'Gratuito' }));
      setModalCancelar(false);
    } catch {
      /* silencia — não trava o fluxo */
    } finally {
      setCancelando(false);
    }
  }

  const plano = perfil?.plano ?? 'Gratuito';
  const temAssinatura = plano !== 'Gratuito';

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 ml-[72px] flex items-center justify-center">
          <p className="font-body text-walnut animate-pulse">Carregando perfil…</p>
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
          <header className="mb-8">
            <h1 className="font-display font-semibold text-3xl text-espresso">Meu Perfil</h1>
            <p className="font-body text-sm text-walnut mt-1">Gerencie seus dados e assinatura</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Coluna principal ── */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Card — Dados pessoais */}
              <section className="bg-sand rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="font-display font-semibold text-xl text-espresso">Dados pessoais</h2>
                  {!editando && (
                    <button
                      onClick={() => setEditando(true)}
                      className="flex items-center gap-1.5 text-sm font-body text-stone hover:underline"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                  )}
                </div>

                {/* Avatar + nome + plano */}
                <div className="flex items-center gap-4 mb-6">
                  <Avatar nome={perfil?.nomeCompleto ?? ''} foto={perfil?.foto} />
                  <div>
                    <p className="font-display font-semibold text-xl text-espresso">
                      {perfil?.nomeCompleto ?? '—'}
                    </p>
                    <div className="mt-1">
                      <BadgePlano plano={plano} />
                    </div>
                  </div>
                </div>

                {/* Modo visualização */}
                {!editando && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-walnut shrink-0" />
                      <span className="font-body text-sm text-espresso">{mascaraEmail(perfil?.email ?? '')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard size={16} className="text-walnut shrink-0" />
                      <span className="font-body text-sm text-espresso">{mascaraCpf(perfil?.cpf ?? '')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-walnut shrink-0" />
                      <span className="font-body text-sm text-espresso">
                        Membro desde {formatarData(perfil?.criadoEm)}
                      </span>
                    </div>

                    {feedbackSalvo && (
                      <div className="flex items-center gap-2 mt-2 p-3 rounded-xl bg-green-50 border border-green-200">
                        <Check size={14} className="text-green-600" />
                        <span className="font-body text-sm text-green-700">Perfil atualizado com sucesso!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Modo edição */}
                {editando && (
                  <form onSubmit={handleSalvar} className="flex flex-col gap-4">
                    <Campo label="Nome completo">
                      <input
                        name="nomeCompleto"
                        value={form.nomeCompleto}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Campo>
                    <Campo label="E-mail">
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </Campo>
                    <Campo label="URL da foto (opcional)">
                      <input
                        name="foto"
                        value={form.foto}
                        onChange={handleChange}
                        placeholder="https://..."
                        style={inputStyle}
                      />
                    </Campo>

                    {erroPerfil && (
                      <p className="font-body text-sm text-red-600">{erroPerfil}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={salvando}
                        style={{
                          padding: '10px 24px', borderRadius: 10, border: 'none',
                          background: 'var(--color-bark)', color: 'var(--color-cream)',
                          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                          cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.65 : 1,
                        }}
                      >
                        {salvando ? 'Salvando…' : 'Salvar alterações'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditando(false); setErroPerfil(''); }}
                        style={{
                          padding: '10px 24px', borderRadius: 10,
                          border: '1px solid var(--color-sand)', background: 'transparent',
                          fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-walnut)',
                          cursor: 'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </section>

              {/* Card — Meus Ingressos */}
              <section className="bg-sand rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-xl text-espresso">Meus Ingressos</h2>
                  <Link to="/meus-ingressos" className="flex items-center gap-1 text-sm font-body text-stone hover:underline">
                    Ver todos <ChevronRight size={14} />
                  </Link>
                </div>

                {ingressos.length === 0 ? (
                  <div className="py-8 text-center">
                    <Ticket size={28} className="text-walnut mx-auto mb-2" />
                    <p className="font-body text-sm text-walnut">Você ainda não comprou ingressos.</p>
                    <Link to="/eventos" className="font-body text-sm text-stone hover:underline mt-1 inline-block">
                      Explorar eventos
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {ingressos.slice(0, 3).map(ing => (
                      <div key={ing.id} className="flex items-center justify-between bg-cream rounded-xl p-3 gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-medium text-sm text-espresso truncate">{ing.tituloEvento}</p>
                          <p className="font-body text-xs text-walnut mt-0.5">{formatarData(ing.dataEvento)}</p>
                        </div>
                        <BadgeStatus
                          variante={ing.checkInRealizado ? 'no-prazo' : 'atencao'}
                          texto={ing.checkInRealizado ? 'Check-in ✓' : 'Aguardando'}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ── Coluna lateral — Assinatura ── */}
            <aside className="flex flex-col gap-6">

              {/* Card — Plano atual */}
              <section className="bg-espresso rounded-2xl p-6 text-cream">
                <p className="font-body text-xs text-walnut mb-1">Plano atual</p>
                <div className="flex items-center gap-2 mb-4">
                  <p className="font-display font-bold text-2xl text-cream">{plano}</p>
                  <BadgePlano plano={plano} />
                </div>

                {plano === 'Gratuito' && (
                  <>
                    <ul className="flex flex-col gap-2 mb-5">
                      {[
                        'Leituras, favoritos e desejos ilimitados',
                        'Participação em desafios',
                        'Acesso a eventos gratuitos',
                      ].map(b => (
                        <li key={b} className="flex items-start gap-2">
                          <Check size={14} className="text-stone mt-0.5 shrink-0" />
                          <span className="font-body text-xs text-walnut">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/planos">
                      <button style={{
                        width: '100%', padding: '11px 0', borderRadius: 10, border: 'none',
                        background: 'var(--color-stone)', color: 'var(--color-cream)',
                        fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                      }}>
                        Fazer upgrade
                      </button>
                    </Link>
                  </>
                )}

                {temAssinatura && (
                  <>
                    <ul className="flex flex-col gap-2 mb-5">
                      {plano === 'Pro' ? [
                        'Desconto de 10% em eventos',
                        'Multiplicador de pontos 1.5×',
                        'Suporte prioritário',
                      ] : [
                        'Desconto de 25% em eventos',
                        'Multiplicador de pontos 2×',
                        'Acesso antecipado a eventos',
                        'Suporte VIP',
                      ].map(b => (
                        <li key={b} className="flex items-start gap-2">
                          <Check size={14} className="text-stone mt-0.5 shrink-0" />
                          <span className="font-body text-xs text-walnut">{b}</span>
                        </li>
                      ))}
                    </ul>

                    {perfil?.assinaturaVencimento && (
                      <p className="font-body text-xs text-walnut mb-4">
                        Renova em {formatarData(perfil.assinaturaVencimento)}
                      </p>
                    )}

                    <div className="flex flex-col gap-2">
                      <Link to="/planos">
                        <button style={{
                          width: '100%', padding: '11px 0', borderRadius: 10, border: 'none',
                          background: 'var(--color-stone)', color: 'var(--color-cream)',
                          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                        }}>
                          Alterar plano
                        </button>
                      </Link>
                      <button
                        onClick={() => setModalCancelar(true)}
                        style={{
                          width: '100%', padding: '11px 0', borderRadius: 10,
                          border: '1px solid #EF4444', background: 'transparent',
                          fontFamily: 'var(--font-body)', fontSize: 14, color: '#EF4444', cursor: 'pointer',
                        }}
                      >
                        Cancelar assinatura
                      </button>
                    </div>
                  </>
                )}
              </section>

              {/* Dica upgrade (só no gratuito) */}
              {!temAssinatura && (
                <section className="bg-sand rounded-2xl p-5">
                  <p className="font-display font-semibold text-base text-espresso mb-2">
                    Aproveite mais com o Pro
                  </p>
                  <ul className="flex flex-col gap-1.5 mb-4">
                    {['10% de desconto em eventos', 'Pontos 1.5× mais rápido', 'R$ 19,90/mês'].map(b => (
                      <li key={b} className="flex items-center gap-2">
                        <Check size={13} className="text-stone shrink-0" />
                        <span className="font-body text-xs text-walnut">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/planos">
                    <button style={{
                      width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                      background: 'var(--color-bark)', color: 'var(--color-cream)',
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}>
                      Ver planos
                    </button>
                  </Link>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>

      {modalCancelar && (
        <ModalCancelar
          onConfirmar={handleCancelarAssinatura}
          onFechar={() => setModalCancelar(false)}
          carregando={cancelando}
        />
      )}
    </div>
  );
}
