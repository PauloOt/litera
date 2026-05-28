import { useEffect, useState } from 'react';
import {
  Search, CheckCircle, XCircle, Users, CalendarDays, Clock, Shield,
  BarChart3, LogIn, UserX, UserCheck, Ticket, BookOpen, Eye, Receipt, RotateCcw,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { BadgePlano } from '../components/BadgePlano';
import { Modal } from '../components/Modal';
import api from '../services/api';

/* ─── Utilitários ────────────────────────────────────────────────────── */
function formatarData(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('pt-BR');
}

function formatarDataHora(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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

function BadgeStatus({ status }) {
  const map = {
    PENDENTE:  { bg: 'bg-amber-100',  texto: 'text-amber-700', label: 'Pendente' },
    APROVADO:  { bg: 'bg-green-100',  texto: 'text-green-700', label: 'Aprovado' },
    CANCELADO: { bg: 'bg-red-100',    texto: 'text-red-600',   label: 'Cancelado' },
    REJEITADO: { bg: 'bg-red-100',    texto: 'text-red-600',   label: 'Rejeitado' },
  };
  const { bg, texto, label } = map[status] ?? map.PENDENTE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${bg} ${texto}`}>
      {label}
    </span>
  );
}

/* ─── Card de métrica ────────────────────────────────────────────────── */
function CardMetrica({ icone: Icone, label, valor, cor, carregando }) {
  return (
    <div className="bg-sand rounded-2xl p-4">
      <Icone size={18} className={`${cor} mb-2`} />
      <p className="font-display font-bold text-2xl text-espresso">{carregando ? '—' : valor}</p>
      <p className="font-body text-xs text-walnut mt-0.5">{label}</p>
    </div>
  );
}

/* ─── Aba: Dashboard ────────────────────────────────────────────────── */
function AbaDashboard() {
  const [stats, setStats]       = useState(null);
  const [carregando, setCarreg] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/usuarios').then(r => r.data ?? []),
      api.get('/admin/eventos/pendentes').then(r => r.data ?? []),
      api.get('/admin/eventos').then(r => r.data ?? []).catch(() => []),
    ])
      .then(([usuarios, pendentes, eventos]) => {
        const totalUsuarios = usuarios.length;
        const organizadores = usuarios.filter(u => u.role === 'ROLE_ORGANIZADOR').length;
        const totalEventos = eventos.length;
        const eventosAprovados = eventos.filter(e => e.status === 'APROVADO').length;
        const eventosPendentes = pendentes.length;
        const totalIngressos = eventos.reduce((acc, e) => acc + (e.ingressosVendidos ?? 0), 0);

        setStats({ totalUsuarios, organizadores, totalEventos, eventosAprovados, eventosPendentes, totalIngressos });
      })
      .catch(() => {})
      .finally(() => setCarreg(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <CardMetrica icone={Users}        label="Usuários"          valor={stats?.totalUsuarios}    cor="text-bark"       carregando={carregando} />
        <CardMetrica icone={Shield}       label="Organizadores"     valor={stats?.organizadores}    cor="text-stone"      carregando={carregando} />
        <CardMetrica icone={CalendarDays} label="Total de eventos"  valor={stats?.totalEventos}     cor="text-espresso"   carregando={carregando} />
        <CardMetrica icone={CheckCircle}  label="Aprovados"         valor={stats?.eventosAprovados} cor="text-green-600"  carregando={carregando} />
        <CardMetrica icone={Clock}        label="Pendentes"         valor={stats?.eventosPendentes} cor="text-amber-500"  carregando={carregando} />
        <CardMetrica icone={Ticket}       label="Ingressos vendidos" valor={stats?.totalIngressos}  cor="text-stone"      carregando={carregando} />
      </div>

      {/* Últimos usuários cadastrados */}
      <div>
        <h3 className="font-display font-semibold text-lg text-espresso mb-3">Cadastros recentes</h3>
        <ResumoUsuarios />
      </div>
    </div>
  );
}

function ResumoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarreg] = useState(true);

  useEffect(() => {
    api.get('/admin/usuarios')
      .then(({ data }) => {
        const sorted = (data ?? []).sort((a, b) => new Date(b.dataCadastro ?? b.criadoEm ?? 0) - new Date(a.dataCadastro ?? a.criadoEm ?? 0));
        setUsuarios(sorted.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setCarreg(false));
  }, []);

  if (carregando) {
    return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-sand rounded-2xl h-12 animate-pulse" />)}</div>;
  }

  if (usuarios.length === 0) {
    return <p className="font-body text-sm text-walnut">Nenhum usuário cadastrado.</p>;
  }

  return (
    <div className="bg-sand rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cream">
            <th className="text-left p-3 font-body text-xs font-medium text-walnut uppercase tracking-wide">Nome</th>
            <th className="text-left p-3 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden md:table-cell">E-mail</th>
            <th className="text-left p-3 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden sm:table-cell">Cadastro</th>
            <th className="text-left p-3 font-body text-xs font-medium text-walnut uppercase tracking-wide">Role</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, i) => (
            <tr key={u.id} className={i % 2 === 0 ? 'bg-sand' : 'bg-cream/40'}>
              <td className="p-3 font-body text-sm text-espresso">{u.nomeCompleto}</td>
              <td className="p-3 font-body text-xs text-walnut hidden md:table-cell">{u.email}</td>
              <td className="p-3 font-body text-xs text-walnut hidden sm:table-cell">{formatarData(u.dataCadastro ?? u.criadoEm)}</td>
              <td className="p-3"><BadgeRole role={u.role} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Aba: Eventos pendentes ─────────────────────────────────────────── */
function AbaEventosPendentes() {
  const [eventos, setEventos]   = useState([]);
  const [carregando, setCarreg] = useState(true);
  const [processando, setProc]  = useState(null);

  useEffect(() => {
    api.get('/admin/eventos/pendentes')
      .then(({ data }) => setEventos(data ?? []))
      .catch(() => {})
      .finally(() => setCarreg(false));
  }, []);

  async function handleAprovar(id) {
    setProc(id);
    try {
      await api.put(`/eventos/${id}/aprovar`);
      setEventos(evs => evs.filter(e => e.id !== id));
    } catch { /* toast global */ }
    finally { setProc(null); }
  }

  async function handleRejeitar(id) {
    setProc(id);
    try {
      await api.put(`/eventos/${id}/rejeitar`);
      setEventos(evs => evs.filter(e => e.id !== id));
    } catch { /* toast global */ }
    finally { setProc(null); }
  }

  if (carregando) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-sand rounded-2xl h-28 animate-pulse" />)}</div>;
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
                  {formatarDataHora(ev.dataHora ?? ev.data)}
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

/* ─── Aba: Todos os eventos ──────────────────────────────────────────── */
function AbaTodosEventos() {
  const [eventos, setEventos]       = useState([]);
  const [carregando, setCarreg]     = useState(true);
  const [busca, setBusca]           = useState('');
  const [filtroStatus, setFiltro]   = useState('TODOS');

  useEffect(() => {
    api.get('/admin/eventos')
      .then(({ data }) => setEventos(data ?? []))
      .catch(() => {})
      .finally(() => setCarreg(false));
  }, []);

  const filtrados = eventos.filter(ev => {
    const matchBusca = !busca || ev.titulo?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'TODOS' || ev.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  if (carregando) {
    return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="bg-sand rounded-2xl h-14 animate-pulse" />)}</div>;
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-walnut pointer-events-none" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar evento..."
            style={{
              width: '100%', padding: '10px 14px 10px 36px',
              border: '1px solid var(--color-sand)', borderRadius: 12,
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-espresso)',
              backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={filtroStatus}
          onChange={e => setFiltro(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 12,
            border: '1px solid var(--color-sand)',
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-espresso)',
            backgroundColor: '#fff', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="TODOS">Todos os status</option>
          <option value="APROVADO">Aprovados</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="REJEITADO">Rejeitados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="py-12 text-center bg-sand rounded-2xl">
          <p className="font-body text-walnut">Nenhum evento encontrado.</p>
        </div>
      ) : (
        <div className="bg-sand rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream">
                <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Evento</th>
                <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden md:table-cell">Organizador</th>
                <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden lg:table-cell">Data</th>
                <th className="text-center p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden sm:table-cell">Ingressos</th>
                <th className="text-center p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((ev, i) => (
                <tr key={ev.id} className={i % 2 === 0 ? 'bg-sand' : 'bg-cream/40'}>
                  <td className="p-4">
                    <p className="font-body font-medium text-sm text-espresso truncate max-w-[220px]">{ev.titulo}</p>
                    <p className="font-body text-xs text-walnut mt-0.5">{formatarPreco(ev.preco)}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="font-body text-sm text-walnut">{ev.organizador ?? '—'}</p>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <p className="font-body text-sm text-walnut">{formatarDataHora(ev.dataHora ?? ev.data)}</p>
                  </td>
                  <td className="p-4 text-center hidden sm:table-cell">
                    <p className="font-body text-sm font-medium text-stone">{ev.ingressosVendidos ?? 0}/{ev.vagasTotais ?? '—'}</p>
                  </td>
                  <td className="p-4 text-center">
                    <BadgeStatus status={ev.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ─── Aba: Logs de acesso ────────────────────────────────────────────── */
function AbaLogs() {
  const [logs, setLogs]         = useState([]);
  const [carregando, setCarreg] = useState(true);

  useEffect(() => {
    api.get('/admin/logins')
      .then(({ data }) => setLogs(data ?? []))
      .catch(() => {
        /* Se o backend ainda não implementou o endpoint, mostra lista vazia */
      })
      .finally(() => setCarreg(false));
  }, []);

  if (carregando) {
    return <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="bg-sand rounded-2xl h-12 animate-pulse" />)}</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 bg-sand rounded-2xl">
        <LogIn size={36} className="text-walnut" />
        <p className="font-body text-walnut">Nenhum registro de login encontrado.</p>
        <p className="font-body text-xs text-walnut/60">O backend precisa implementar <code className="bg-cream px-1.5 py-0.5 rounded text-xs">GET /admin/logins</code></p>
      </div>
    );
  }

  return (
    <div className="bg-sand rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cream">
            <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Usuário</th>
            <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden md:table-cell">E-mail</th>
            <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Data/hora</th>
            <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden lg:table-cell">IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={log.id ?? i} className={i % 2 === 0 ? 'bg-sand' : 'bg-cream/40'}>
              <td className="p-4">
                <p className="font-body font-medium text-sm text-espresso">{log.nomeCompleto ?? log.usuario ?? '—'}</p>
              </td>
              <td className="p-4 hidden md:table-cell">
                <p className="font-body text-xs text-walnut">{log.email ?? '—'}</p>
              </td>
              <td className="p-4">
                <p className="font-body text-sm text-walnut">{formatarDataHora(log.dataHora ?? log.data)}</p>
              </td>
              <td className="p-4 hidden lg:table-cell">
                <p className="font-body text-xs text-walnut font-mono">{log.ip ?? '—'}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Modal promover/alterar role ────────────────────────────────────── */
function ModalAlterarRole({ usuario, novaRole, onConfirmar, onFechar, carregando }) {
  if (!usuario) return null;

  const labels = {
    ROLE_ORGANIZADOR: 'Organizador',
    ROLE_USUARIO: 'Usuário',
  };
  const labelRole = labels[novaRole] ?? novaRole;
  const isPromocao = novaRole === 'ROLE_ORGANIZADOR';

  return (
    <Modal isOpen={!!usuario} onClose={onFechar} title={isPromocao ? 'Promover usuário' : 'Rebaixar usuário'}>
      <p className="font-body text-sm text-walnut mb-6 leading-relaxed">
        {isPromocao ? (
          <>Você está promovendo <strong className="text-espresso">{usuario.nomeCompleto}</strong> para <strong className="text-espresso">{labelRole}</strong>. Ele poderá criar e gerenciar eventos na plataforma.</>
        ) : (
          <>Você está rebaixando <strong className="text-espresso">{usuario.nomeCompleto}</strong> para <strong className="text-espresso">{labelRole}</strong>. Ele perderá acesso à gestão de eventos.</>
        )}
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
            background: isPromocao ? 'var(--color-bark)' : '#EF4444',
            color: 'var(--color-cream)',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
            cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.65 : 1,
          }}
        >
          {carregando ? 'Processando…' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  );
}

/* ─── Modal desativar conta ──────────────────────────────────────────── */
function ModalDesativar({ usuario, onConfirmar, onFechar, carregando }) {
  if (!usuario) return null;
  return (
    <Modal isOpen={!!usuario} onClose={onFechar} title="Desativar conta">
      <p className="font-body text-sm text-walnut mb-6 leading-relaxed">
        Tem certeza que deseja desativar a conta de <strong className="text-espresso">{usuario.nomeCompleto}</strong>?
        O usuário não conseguirá acessar a plataforma até ser reativado.
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
            background: '#EF4444', color: '#fff',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
            cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.65 : 1,
          }}
        >
          {carregando ? 'Desativando…' : 'Desativar conta'}
        </button>
      </div>
    </Modal>
  );
}

/* ─── Aba: Usuários (expandida) ──────────────────────────────────────── */
function AbaUsuarios() {
  const [usuarios, setUsuarios]   = useState([]);
  const [busca, setBusca]         = useState('');
  const [carregando, setCarreg]   = useState(true);
  const [alterando, setAlterando] = useState(null);   /* { usuario, novaRole } */
  const [desativando, setDesativ] = useState(null);
  const [carregAcao, setCarAcao]  = useState(false);

  useEffect(() => {
    api.get('/admin/usuarios')
      .then(({ data }) => setUsuarios(data ?? []))
      .catch(() => {})
      .finally(() => setCarreg(false));
  }, []);

  async function handleAlterarRole() {
    if (!alterando) return;
    setCarAcao(true);
    try {
      if (alterando.novaRole === 'ROLE_ORGANIZADOR') {
        await api.put(`/admin/usuarios/${alterando.usuario.id}/promover`);
      } else {
        await api.put(`/admin/usuarios/${alterando.usuario.id}/rebaixar`);
      }
      setUsuarios(us => us.map(u => u.id === alterando.usuario.id ? { ...u, role: alterando.novaRole } : u));
      setAlterando(null);
    } catch { /* toast global */ }
    finally { setCarAcao(false); }
  }

  async function handleDesativar() {
    if (!desativando) return;
    setCarAcao(true);
    try {
      await api.put(`/admin/usuarios/${desativando.id}/desativar`);
      setUsuarios(us => us.map(u => u.id === desativando.id ? { ...u, ativo: false } : u));
      setDesativ(null);
    } catch { /* toast global */ }
    finally { setCarAcao(false); }
  }

  async function handleReativar(userId) {
    try {
      await api.put(`/admin/usuarios/${userId}/reativar`);
      setUsuarios(us => us.map(u => u.id === userId ? { ...u, ativo: true } : u));
    } catch { /* toast global */ }
  }

  const filtrados = usuarios.filter(u =>
    u.nomeCompleto?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) {
    return <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="bg-sand rounded-2xl h-14 animate-pulse" />)}</div>;
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
                <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-right p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, i) => (
                <tr key={u.id} className={`${i % 2 === 0 ? 'bg-sand' : 'bg-cream/40'} ${u.ativo === false ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <p className="font-body font-medium text-sm text-espresso">{u.nomeCompleto}</p>
                    <p className="font-body text-xs text-walnut">{u.email}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <BadgePlano plano={u.plano ?? 'Gratuito'} />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <p className="font-body text-sm text-walnut">{formatarData(u.dataCadastro ?? u.criadoEm)}</p>
                  </td>
                  <td className="p-4">
                    <BadgeRole role={u.role} />
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    {u.ativo === false ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium bg-red-100 text-red-600">Inativo</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium bg-green-100 text-green-700">Ativo</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'ROLE_ADMIN' && (
                      <div className="flex items-center justify-end gap-1">
                        {/* Promover / Rebaixar */}
                        {u.role === 'ROLE_USUARIO' ? (
                          <button
                            onClick={() => setAlterando({ usuario: u, novaRole: 'ROLE_ORGANIZADOR' })}
                            className="p-1.5 rounded-lg hover:bg-cream transition-colors"
                            title="Promover a Organizador"
                          >
                            <UserCheck size={15} className="text-stone" />
                          </button>
                        ) : u.role === 'ROLE_ORGANIZADOR' ? (
                          <button
                            onClick={() => setAlterando({ usuario: u, novaRole: 'ROLE_USUARIO' })}
                            className="p-1.5 rounded-lg hover:bg-cream transition-colors"
                            title="Rebaixar a Usuário"
                          >
                            <UserX size={15} className="text-walnut" />
                          </button>
                        ) : null}

                        {/* Desativar / Reativar */}
                        {u.ativo === false ? (
                          <button
                            onClick={() => handleReativar(u.id)}
                            className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                            title="Reativar conta"
                          >
                            <UserCheck size={15} className="text-green-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDesativ(u)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Desativar conta"
                          >
                            <UserX size={15} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalAlterarRole
        usuario={alterando?.usuario}
        novaRole={alterando?.novaRole}
        onConfirmar={handleAlterarRole}
        onFechar={() => setAlterando(null)}
        carregando={carregAcao}
      />

      <ModalDesativar
        usuario={desativando}
        onConfirmar={handleDesativar}
        onFechar={() => setDesativ(null)}
        carregando={carregAcao}
      />
    </>
  );
}

/* ─── Aba: Pagamentos ───────────────────────────────────────────────── */
function BadgeStatusPagamento({ status }) {
  const map = {
    PAGO:        { bg: 'bg-green-100', texto: 'text-green-700', label: 'Pago' },
    REEMBOLSADO: { bg: 'bg-amber-100', texto: 'text-amber-700', label: 'Reembolsado' },
    FALHOU:      { bg: 'bg-red-100',   texto: 'text-red-600',   label: 'Falhou' },
  };
  const { bg, texto, label } = map[status] ?? { bg: 'bg-sand', texto: 'text-walnut', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${bg} ${texto}`}>
      {label}
    </span>
  );
}

function AbaPagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [carregando, setCarreg]     = useState(true);
  const [acaoEm, setAcaoEm]         = useState(null);
  const [versao, setVersao]         = useState(0);

  useEffect(() => {
    let cancelado = false;
    api.get('/admin/pagamentos')
      .then(({ data }) => { if (!cancelado) setPagamentos(data ?? []); })
      .catch(() => { if (!cancelado) setPagamentos([]); })
      .finally(() => { if (!cancelado) setCarreg(false); });
    return () => { cancelado = true; };
  }, [versao]);

  async function handleReembolsar(p) {
    if (!confirm(`Reembolsar pagamento "${p.descricao}" no valor de R$ ${Number(p.valorLiquido).toFixed(2)}?`)) return;
    setAcaoEm(p.id);
    try {
      await api.post(`/admin/pagamentos/${p.id}/reembolsar`);
      setVersao(v => v + 1);
    } catch {
      // Toast global mostra erro
    } finally {
      setAcaoEm(null);
    }
  }

  if (carregando) {
    return <p className="font-body text-sm text-walnut">Carregando pagamentos…</p>;
  }

  if (pagamentos.length === 0) {
    return (
      <div className="bg-sand rounded-2xl p-10 text-center">
        <Receipt size={32} className="text-walnut mx-auto mb-3 opacity-50" />
        <p className="font-body text-sm text-walnut">Nenhum pagamento registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-sand rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cream">
            <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Data</th>
            <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Tipo</th>
            <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Descrição</th>
            <th className="text-right p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Valor</th>
            <th className="text-center p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Status</th>
            <th className="text-right p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pagamentos.map((p, i) => (
            <tr key={p.id} className={i % 2 === 0 ? 'bg-sand' : 'bg-cream/40'}>
              <td className="p-4 font-body text-sm text-espresso whitespace-nowrap">{formatarDataHora(p.data)}</td>
              <td className="p-4 font-body text-sm text-espresso">{p.tipo}</td>
              <td className="p-4 font-body text-sm text-espresso">{p.descricao || '—'}</td>
              <td className="p-4 font-body text-sm text-espresso text-right whitespace-nowrap">
                {formatarPreco(p.valorLiquido)}
              </td>
              <td className="p-4 text-center"><BadgeStatusPagamento status={p.status} /></td>
              <td className="p-4 text-right">
                {p.status === 'PAGO' && (
                  <button
                    onClick={() => handleReembolsar(p)}
                    disabled={acaoEm === p.id}
                    className="inline-flex items-center gap-1 text-xs font-body font-medium text-amber-700 hover:text-amber-800 disabled:opacity-50"
                  >
                    <RotateCcw size={13} />
                    {acaoEm === p.id ? 'Reembolsando…' : 'Reembolsar'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Admin() {
  const [aba, setAba] = useState('dashboard');
  const [contPendentes, setContPendentes] = useState(null);

  useEffect(() => {
    api.get('/admin/eventos/pendentes')
      .then(({ data }) => setContPendentes((data ?? []).length))
      .catch(() => {});
  }, []);

  const abas = [
    { id: 'dashboard',  label: 'Dashboard',          icone: BarChart3,    badge: null },
    { id: 'pendentes',  label: 'Eventos pendentes',  icone: Clock,        badge: contPendentes },
    { id: 'eventos',    label: 'Todos os eventos',   icone: CalendarDays, badge: null },
    { id: 'usuarios',   label: 'Usuários',           icone: Users,        badge: null },
    { id: 'pagamentos', label: 'Pagamentos',         icone: Receipt,      badge: null },
    { id: 'logs',       label: 'Logins',             icone: LogIn,        badge: null },
  ];

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-8 px-4 md:px-8 page-enter">
        <div className="max-w-6xl mx-auto w-full">

          {/* Cabeçalho */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <Shield size={24} className="text-bark" />
              <h1 className="font-display font-semibold text-3xl text-espresso">Painel Administrativo</h1>
            </div>
            <p className="font-body text-sm text-walnut">Gerencie eventos, usuários e acompanhe a plataforma</p>
          </header>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-sand overflow-x-auto">
            {abas.map(a => {
              const Icone = a.icone;
              const ativo = aba === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className="flex items-center gap-2 pb-3 px-3 shrink-0"
                  style={{
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
          {aba === 'dashboard'  && <AbaDashboard />}
          {aba === 'pendentes'  && <AbaEventosPendentes />}
          {aba === 'eventos'    && <AbaTodosEventos />}
          {aba === 'usuarios'   && <AbaUsuarios />}
          {aba === 'pagamentos' && <AbaPagamentos />}
          {aba === 'logs'       && <AbaLogs />}

        </div>
      </main>
    </div>
  );
}
