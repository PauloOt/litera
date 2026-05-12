import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Users, CalendarDays, Clock, Shield, ChevronUp, ChevronDown } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { BadgePlano } from '../components/BadgePlano';
import { Modal } from '../components/Modal';
import api from '../services/api';

/* ─── Utilitários ────────────────────────────────────────────────────── */
function formatarData(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('pt-BR');
}

function formatarPreco(v) {
  if (v == null || v === 0) return 'Gratuito';
  return `R$ ${Number(v).toFixed(2)}`;
}

/* ─── Badge de role ──────────────────────────────────────────────────── */
function BadgeRole({ role }) {
  const map = {
    ROLE_USUARIO:      { bg: 'bg-sand',      texto: 'text-walnut',  label: 'Usuário' },
    ROLE_ORGANIZADOR:  { bg: 'bg-stone/20',  texto: 'text-stone',   label: 'Organizador' },
    ROLE_ADMIN:        { bg: 'bg-bark/10',   texto: 'text-bark',    label: 'Admin' },
  };
  const { bg, texto, label } = map[role] ?? map.ROLE_USUARIO;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${bg} ${texto}`}>
      {label}
    </span>
  );
}

/* ─── Aba: Eventos pendentes ─────────────────────────────────────────── */
function AbaEventosPendentes() {
  const [eventos, setEventos]   = useState([]);
  const [carregando, setCarreg] = useState(true);
  const [processando, setProc]  = useState(null); /* id do evento sendo processado */

  useEffect(() => {
    api.get('/eventos/pendentes')
      .then(({ data }) => setEventos(data ?? []))
      .catch(() => {})
      .finally(() => setCarreg(false));
  }, []);

  async function handleAprovar(id) {
    setProc(id);
    try {
      await api.put(`/eventos/${id}/aprovar`);
      setEventos(evs => evs.filter(e => e.id !== id));
    } catch { /* silencia */ }
    finally { setProc(null); }
  }

  async function handleRejeitar(id) {
    setProc(id);
    try {
      await api.put(`/eventos/${id}/rejeitar`);
      setEventos(evs => evs.filter(e => e.id !== id));
    } catch { /* silencia */ }
    finally { setProc(null); }
  }

  if (carregando) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="bg-sand rounded-2xl h-28 animate-pulse" />)}
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 bg-sand rounded-2xl">
        <CheckCircle size={36} className="text-green-500" />
        <p className="font-body text-walnut">Nenhum evento pendente de aprovação.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {eventos.map(ev => (
        <div key={ev.id} className="bg-sand rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-lg text-espresso truncate">{ev.titulo}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span className="font-body text-xs text-walnut flex items-center gap-1">
                  <CalendarDays size={12} />
                  {new Date(ev.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-body text-xs text-walnut">{ev.local}</span>
                <span className="font-body text-xs font-medium text-bark">{formatarPreco(ev.preco)}</span>
                <span className="font-body text-xs text-walnut">{ev.vagasTotais ?? '?'} vagas</span>
              </div>
            </div>
            <span className="font-body text-xs text-walnut whitespace-nowrap shrink-0">
              por <strong className="text-espresso">{ev.organizador ?? 'Organizador'}</strong>
            </span>
          </div>

          {ev.descricao && (
            <p className="font-body text-sm text-walnut mb-4 line-clamp-2 leading-relaxed">{ev.descricao}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleAprovar(ev.id)}
              disabled={processando === ev.id}
              className="flex items-center gap-1.5"
              style={{
                padding: '9px 20px', borderRadius: 10, border: 'none',
                background: 'var(--color-bark)', color: 'var(--color-cream)',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                cursor: processando === ev.id ? 'not-allowed' : 'pointer',
                opacity: processando === ev.id ? 0.65 : 1,
              }}
            >
              <CheckCircle size={14} />
              Aprovar
            </button>
            <button
              onClick={() => handleRejeitar(ev.id)}
              disabled={processando === ev.id}
              className="flex items-center gap-1.5"
              style={{
                padding: '9px 20px', borderRadius: 10,
                border: '1px solid #EF4444', background: 'transparent',
                fontFamily: 'var(--font-body)', fontSize: 13, color: '#EF4444',
                cursor: processando === ev.id ? 'not-allowed' : 'pointer',
                opacity: processando === ev.id ? 0.65 : 1,
              }}
            >
              <XCircle size={14} />
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Modal promover a organizador ──────────────────────────────────── */
function ModalPromover({ usuario, onConfirmar, onFechar, carregando }) {
  if (!usuario) return null;
  return (
    <Modal isOpen={!!usuario} onClose={onFechar} title="Promover usuário">
      <p className="font-body text-sm text-walnut mb-6 leading-relaxed">
        Você está promovendo <strong className="text-espresso">{usuario.nomeCompleto}</strong> para{' '}
        <strong className="text-espresso">Organizador</strong>. Ele poderá criar e gerenciar eventos na plataforma.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onFechar}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 10,
            border: '1px solid var(--color-sand)', background: 'transparent',
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-walnut)', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          disabled={carregando}
          style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
            background: 'var(--color-bark)', color: 'var(--color-cream)',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
            cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.65 : 1,
          }}
        >
          {carregando ? 'Promovendo…' : 'Confirmar promoção'}
        </button>
      </div>
    </Modal>
  );
}

/* ─── Aba: Usuários ──────────────────────────────────────────────────── */
function AbaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca]       = useState('');
  const [carregando, setCarreg] = useState(true);
  const [promovendo, setProm]   = useState(null);  /* usuário selecionado para promover */
  const [carregProm, setCarProm]= useState(false);

  useEffect(() => {
    api.get('/admin/usuarios')
      .then(({ data }) => setUsuarios(data ?? []))
      .catch(() => {})
      .finally(() => setCarreg(false));
  }, []);

  async function handlePromover() {
    if (!promovendo) return;
    setCarProm(true);
    try {
      await api.put(`/admin/usuarios/${promovendo.id}/role`, { role: 'ROLE_ORGANIZADOR' });
      setUsuarios(us => us.map(u => u.id === promovendo.id ? { ...u, role: 'ROLE_ORGANIZADOR' } : u));
      setProm(null);
    } catch { /* silencia */ }
    finally { setCarProm(false); }
  }

  const filtrados = usuarios.filter(u =>
    u.nomeCompleto?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) {
    return (
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="bg-sand rounded-2xl h-14 animate-pulse" />)}
      </div>
    );
  }

  return (
    <>
      {/* Busca */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-walnut pointer-events-none" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          style={{
            width: '100%', padding: '10px 14px 10px 36px',
            border: '1px solid var(--color-sand)', borderRadius: 12,
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-espresso)',
            backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="py-12 text-center bg-sand rounded-2xl">
          <p className="font-body text-walnut">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="bg-sand rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream">
                <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Usuário</th>
                <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden md:table-cell">Plano</th>
                <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden lg:table-cell">Cadastro</th>
                <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Role</th>
                <th className="text-right p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? 'bg-sand' : 'bg-cream/40'}>
                  <td className="p-4">
                    <p className="font-body font-medium text-sm text-espresso">{u.nomeCompleto}</p>
                    <p className="font-body text-xs text-walnut">{u.email}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <BadgePlano plano={u.plano ?? 'Gratuito'} />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <p className="font-body text-sm text-walnut">{formatarData(u.criadoEm)}</p>
                  </td>
                  <td className="p-4">
                    <BadgeRole role={u.role} />
                  </td>
                  <td className="p-4 text-right">
                    {u.role === 'ROLE_USUARIO' && (
                      <button
                        onClick={() => setProm(u)}
                        className="flex items-center gap-1.5 ml-auto font-body text-xs text-stone hover:underline"
                      >
                        <Shield size={12} />
                        Promover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalPromover
        usuario={promovendo}
        onConfirmar={handlePromover}
        onFechar={() => setProm(null)}
        carregando={carregProm}
      />
    </>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Admin() {
  const [aba, setAba] = useState('eventos');
  const [contPendentes, setContPendentes] = useState(null);

  useEffect(() => {
    api.get('/eventos/pendentes')
      .then(({ data }) => setContPendentes((data ?? []).length))
      .catch(() => {});
  }, []);

  const abas = [
    { id: 'eventos',  label: 'Eventos pendentes', icone: CalendarDays, badge: contPendentes },
    { id: 'usuarios', label: 'Usuários',           icone: Users,        badge: null },
  ];

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-8 px-4 md:px-8 page-enter">
        <div className="max-w-5xl mx-auto w-full">

          {/* Cabeçalho */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <Shield size={24} className="text-bark" />
              <h1 className="font-display font-semibold text-3xl text-espresso">Painel Administrativo</h1>
            </div>
            <p className="font-body text-sm text-walnut">Gerencie eventos e usuários da plataforma</p>
          </header>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-sand">
            {abas.map(a => {
              const Icone = a.icone;
              const ativo = aba === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className="flex items-center gap-2 pb-3 px-1"
                  style={{
                    borderBottom: ativo ? '2px solid var(--color-bark)' : '2px solid transparent',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    fontWeight: ativo ? 500 : 400,
                    color: ativo ? 'var(--color-espresso)' : 'var(--color-walnut)',
                    background: 'none',
                    border: 'none',
                    borderBottom: ativo ? '2px solid var(--color-bark)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                >
                  <Icone size={16} />
                  {a.label}
                  {a.badge != null && a.badge > 0 && (
                    <span style={{
                      minWidth: 18, height: 18, borderRadius: 9,
                      background: '#EF4444', color: '#fff',
                      fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 5px',
                    }}>
                      {a.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Conteúdo */}
          {aba === 'eventos'  && <AbaEventosPendentes />}
          {aba === 'usuarios' && <AbaUsuarios />}

        </div>
      </main>
    </div>
  );
}
