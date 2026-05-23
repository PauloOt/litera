import { useEffect, useState, useRef } from 'react';
import { Plus, CalendarDays, Users, Clock, CheckCircle, XCircle, Pencil, Trash2, Eye, Upload, X } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Modal } from '../components/Modal';
import api from '../services/api';

/* ─── Utilitários ────────────────────────────────────────────────────── */
function formatarData(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatarPreco(v) {
  if (v == null || v === 0) return 'Gratuito';
  return `R$ ${Number(v).toFixed(2)}`;
}

/* ─── Badge de status do evento ──────────────────────────────────────── */
function BadgeEvento({ status }) {
  const map = {
    PENDENTE:  { bg: 'bg-sand',       texto: 'text-walnut', label: 'Pendente' },
    APROVADO:  { bg: 'bg-green-100',  texto: 'text-green-700', label: 'Aprovado' },
    CANCELADO: { bg: 'bg-red-100',    texto: 'text-red-600',  label: 'Cancelado' },
    REJEITADO: { bg: 'bg-red-100',    texto: 'text-red-600',  label: 'Rejeitado' },
  };
  const { bg, texto, label } = map[status] ?? map.PENDENTE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${bg} ${texto}`}>
      {label}
    </span>
  );
}

/* ─── Campos do formulário ───────────────────────────────────────────── */
const inputCls = {
  width: '100%',
  border: '1px solid var(--color-sand)',
  borderRadius: 10,
  padding: '10px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--color-espresso)',
  backgroundColor: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

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

/* ─── Modal criar/editar evento ──────────────────────────────────────── */
const FORM_VAZIO = { titulo: '', descricao: '', local: '', data: '', preco: '', vagas: '', capa: '' };

function ModalEvento({ aberto, onFechar, onSalvo, eventoEdit }) {
  const [form, setForm]       = useState(FORM_VAZIO);
  const [erro, setErro]       = useState('');
  const [salvando, setSalvando] = useState(false);
  const [previewCapa, setPreviewCapa] = useState(null);
  const [capaArquivo, setCapaArquivo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (eventoEdit) {
      setForm({
        titulo: eventoEdit.titulo || '',
        descricao: eventoEdit.descricao || '',
        local: eventoEdit.local || '',
        data: eventoEdit.dataHora ? eventoEdit.dataHora.slice(0, 16) : '',
        preco: eventoEdit.preco ?? '',
        vagas: eventoEdit.vagasTotais ?? '',
        capa: eventoEdit.capa || '',
      });
      setPreviewCapa(eventoEdit.capa || null);
      setCapaArquivo(null);
    } else {
      setForm(FORM_VAZIO);
      setPreviewCapa(null);
      setCapaArquivo(null);
    }
  }, [eventoEdit]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErro('');
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErro('Selecione um arquivo de imagem válido.');
      return;
    }
    setCapaArquivo(file);
    setForm(f => ({ ...f, capa: '' }));
    setErro('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewCapa(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleRemoverCapa() {
    setCapaArquivo(null);
    setPreviewCapa(null);
    setForm(f => ({ ...f, capa: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.local.trim() || !form.data) {
      setErro('Preencha título, local e data.');
      return;
    }
    setSalvando(true);
    try {
      let capaUrl = form.capa || null;

      // Se tem arquivo selecionado, faz upload via multipart
      if (capaArquivo) {
        const formData = new FormData();
        formData.append('file', capaArquivo);
        const uploadRes = await api.post('/upload/imagem', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        capaUrl = uploadRes.data.url ?? uploadRes.data;
      }

      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        local: form.local,
        dataHora: form.data ? form.data + ':00' : null,
        preco: Number(form.preco) || 0,
        vagasTotais: Number(form.vagas) || 0,
        capa: capaUrl,
      };
      if (eventoEdit) {
        const { data } = await api.put(`/eventos/${eventoEdit.id}`, payload);
        onSalvo(data, true);
      } else {
        const { data } = await api.post('/eventos', payload);
        onSalvo(data, false);
      }
      setForm(FORM_VAZIO);
      setPreviewCapa(null);
      setCapaArquivo(null);
      onFechar();
    } catch (err) {
      const msg = err?.response?.data?.erro || err?.response?.data?.message || err?.message || '';
      setErro(eventoEdit
        ? `Erro ao editar evento. ${msg}`
        : `Erro ao criar evento. ${msg}`);
    } finally {
      setSalvando(false);
    }
  }

  function handleFechar() {
    setForm(FORM_VAZIO);
    setPreviewCapa(null);
    setCapaArquivo(null);
    setErro('');
    onFechar();
  }

  return (
    <Modal isOpen={aberto} onClose={handleFechar} title={eventoEdit ? 'Editar evento' : 'Criar novo evento'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Campo label="Título *">
          <input name="titulo" value={form.titulo} onChange={handleChange} style={inputCls} placeholder="Nome do evento" />
        </Campo>
        <Campo label="Descrição">
          <textarea
            name="descricao" value={form.descricao} onChange={handleChange}
            rows={3} style={{ ...inputCls, resize: 'vertical' }}
            placeholder="Descreva o evento..."
          />
        </Campo>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Campo label="Local *">
            <input name="local" value={form.local} onChange={handleChange} style={inputCls} placeholder="Rua, cidade..." />
          </Campo>
          <Campo label="Data e hora *">
            <input name="data" type="datetime-local" value={form.data} onChange={handleChange} style={inputCls} />
          </Campo>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Campo label="Preço (R$) — 0 = gratuito">
            <input name="preco" type="number" min="0" step="0.01" value={form.preco} onChange={handleChange} style={inputCls} placeholder="0,00" />
          </Campo>
          <Campo label="Vagas totais">
            <input name="vagas" type="number" min="0" value={form.vagas} onChange={handleChange} style={inputCls} placeholder="Ex: 100" />
          </Campo>
        </div>

        {/* Campo de imagem de capa */}
        <Campo label="Imagem de capa">
          {previewCapa ? (
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--color-sand)' }}>
              <img src={previewCapa} alt="Preview" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              <button
                type="button"
                onClick={handleRemoverCapa}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={14} color="#fff" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--color-sand)', borderRadius: 10,
                padding: '24px 16px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-stone)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-sand)'}
            >
              <Upload size={24} style={{ color: 'var(--color-walnut)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-walnut)', textAlign: 'center' }}>
                Clique para selecionar uma foto do dispositivo
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-walnut)', opacity: 0.6 }}>
                JPG, PNG ou WebP
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {/* Opção alternativa de URL */}
          {!capaArquivo && !previewCapa && (
            <div style={{ marginTop: 8 }}>
              <input
                name="capa"
                value={form.capa}
                onChange={(e) => {
                  handleChange(e);
                  setPreviewCapa(e.target.value || null);
                }}
                style={inputCls}
                placeholder="Ou cole a URL da imagem aqui..."
              />
            </div>
          )}
        </Campo>

        {erro && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#EF4444' }}>{erro}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={salvando}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
              background: 'var(--color-bark)', color: 'var(--color-cream)',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.65 : 1,
            }}
          >
            {salvando ? (eventoEdit ? 'Salvando…' : 'Criando…') : (eventoEdit ? 'Salvar alterações' : 'Criar evento')}
          </button>
          <button
            type="button" onClick={handleFechar}
            style={{
              padding: '11px 20px', borderRadius: 10,
              border: '1px solid var(--color-sand)', background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-walnut)', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Modal participantes ───────────────────────────────────────────── */
function ModalParticipantes({ evento, onClose }) {
  const [participantes, setParticipantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(null);

  useEffect(() => {
    if (!evento) return;
    setCarregando(true);
    api.get(`/eventos/${evento.id}/participantes`)
      .then(({ data }) => setParticipantes(data ?? []))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [evento]);

  async function handleCheckin(ingressoId) {
    setCheckinLoading(ingressoId);
    try {
      await api.put(`/ingressos/${ingressoId}/checkin`);
      setParticipantes(prev =>
        prev.map(p => p.ingressoId === ingressoId ? { ...p, checkInRealizado: true } : p)
      );
    } catch (err) {
      // Toast global exibe a mensagem
    } finally {
      setCheckinLoading(null);
    }
  }

  return (
    <Modal isOpen={!!evento} onClose={onClose} title={`Participantes — ${evento?.titulo ?? ''}`}>
      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-stone border-t-transparent rounded-full animate-spin" />
        </div>
      ) : participantes.length === 0 ? (
        <p className="font-body text-sm text-walnut text-center py-6">Nenhum participante ainda.</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          <p className="font-body text-xs text-walnut mb-2">{participantes.length} participante(s)</p>
          {participantes.map(p => (
            <div key={p.ingressoId} className="flex items-center justify-between bg-sand rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="font-body font-medium text-sm text-espresso truncate">{p.nomeComprador}</p>
                <p className="font-body text-xs text-walnut">
                  Código: <span className="font-mono tracking-wide">{p.codigoIngresso}</span>
                  {p.valorPago != null && <> · {formatarPreco(p.valorPago)}</>}
                </p>
              </div>
              <div className="shrink-0 ml-3">
                {p.checkInRealizado ? (
                  <span className="flex items-center gap-1 font-body text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <CheckCircle size={12} /> Check-in
                  </span>
                ) : (
                  <button
                    onClick={() => handleCheckin(p.ingressoId)}
                    disabled={checkinLoading === p.ingressoId}
                    className="font-body text-xs text-cream bg-stone px-3 py-1.5 rounded-lg hover:brightness-90 transition-all disabled:opacity-60"
                  >
                    {checkinLoading === p.ingressoId ? '...' : 'Fazer check-in'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Organizador() {
  const [eventos, setEventos]         = useState([]);
  const [carregando, setCarregando]   = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEdit, setEventoEdit]   = useState(null);
  const [eventoParticipantes, setEventoParticipantes] = useState(null);

  useEffect(() => {
    api.get('/organizador/eventos')
      .then(({ data }) => setEventos(data ?? []))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  function handleSalvo(eventoData, isEdit) {
    if (isEdit) {
      setEventos(evs => evs.map(e => e.id === eventoData.id ? eventoData : e));
    } else {
      setEventos(evs => [eventoData, ...evs]);
    }
  }

  function handleEditar(ev) {
    setEventoEdit(ev);
    setModalAberto(true);
  }

  function handleFecharModal() {
    setModalAberto(false);
    setEventoEdit(null);
  }

  async function handleCancelar(ev) {
    if (!confirm(`Tem certeza que deseja cancelar o evento "${ev.titulo}"?`)) return;
    try {
      await api.delete(`/eventos/${ev.id}`);
      setEventos(evs => evs.map(e => e.id === ev.id ? { ...e, status: 'CANCELADO' } : e));
    } catch (err) {
      // Toast global exibe a mensagem
    }
  }

  /* Estatísticas rápidas */
  const total    = eventos.length;
  const aprovados = eventos.filter(e => e.status === 'APROVADO').length;
  const pendentes = eventos.filter(e => e.status === 'PENDENTE').length;
  const totalVendidos = eventos.reduce((acc, e) => acc + (e.ingressosVendidos ?? 0), 0);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-8 px-4 md:px-8 page-enter">
        <div className="max-w-5xl mx-auto w-full">

          {/* Cabeçalho */}
          <header className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="font-display font-semibold text-3xl text-espresso">Meus Eventos</h1>
              <p className="font-body text-sm text-walnut mt-1">Gerencie os eventos que você organiza</p>
            </div>
            <button
              onClick={() => { setEventoEdit(null); setModalAberto(true); }}
              className="flex items-center gap-2 shrink-0"
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: 'var(--color-bark)', color: 'var(--color-cream)',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              Criar evento
            </button>
          </header>

          {/* Cards de métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total de eventos',     valor: total,         icone: CalendarDays, cor: 'text-stone' },
              { label: 'Aprovados',            valor: aprovados,     icone: CheckCircle,  cor: 'text-green-600' },
              { label: 'Aguardando aprovação', valor: pendentes,     icone: Clock,        cor: 'text-amber-500' },
              { label: 'Ingressos vendidos',   valor: totalVendidos, icone: Users,        cor: 'text-bark' },
            ].map(({ label, valor, icone: Icone, cor }) => (
              <div key={label} className="bg-sand rounded-2xl p-4">
                <Icone size={18} className={`${cor} mb-2`} />
                <p className="font-display font-bold text-2xl text-espresso">{carregando ? '—' : valor}</p>
                <p className="font-body text-xs text-walnut mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabela de eventos */}
          {carregando ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-sand rounded-2xl h-16 animate-pulse" />
              ))}
            </div>
          ) : eventos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 bg-sand rounded-2xl">
              <CalendarDays size={36} className="text-walnut" />
              <p className="font-body text-walnut">Você ainda não criou nenhum evento.</p>
              <button
                onClick={() => setModalAberto(true)}
                className="font-body text-sm text-stone hover:underline"
              >
                Criar primeiro evento
              </button>
            </div>
          ) : (
            <div className="bg-sand rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream">
                    <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Evento</th>
                    <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden md:table-cell">Data</th>
                    <th className="text-center p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden sm:table-cell">Vagas</th>
                    <th className="text-center p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide hidden sm:table-cell">Vendidos</th>
                    <th className="text-center p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Status</th>
                    <th className="text-right p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((ev, i) => (
                    <tr key={ev.id} className={i % 2 === 0 ? 'bg-sand' : 'bg-cream/40'}>
                      <td className="p-4">
                        <p className="font-body font-medium text-sm text-espresso truncate max-w-[200px]">{ev.titulo}</p>
                        <p className="font-body text-xs text-walnut mt-0.5">{formatarPreco(ev.preco)}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="font-body text-sm text-espresso">{formatarData(ev.dataHora ?? ev.data)}</p>
                      </td>
                      <td className="p-4 text-center hidden sm:table-cell">
                        <p className="font-body text-sm text-espresso">{ev.vagasTotais ?? '—'}</p>
                      </td>
                      <td className="p-4 text-center hidden sm:table-cell">
                        <p className="font-body text-sm font-medium text-stone">{ev.ingressosVendidos ?? 0}</p>
                      </td>
                      <td className="p-4 text-center">
                        <BadgeEvento status={ev.status} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {ev.status === 'APROVADO' && (
                            <button
                              onClick={() => setEventoParticipantes(ev)}
                              className="p-1.5 rounded-lg hover:bg-cream transition-colors"
                              title="Ver participantes"
                            >
                              <Eye size={15} className="text-stone" />
                            </button>
                          )}
                          {ev.status === 'PENDENTE' && (
                            <>
                              <button
                                onClick={() => handleEditar(ev)}
                                className="p-1.5 rounded-lg hover:bg-cream transition-colors"
                                title="Editar evento"
                              >
                                <Pencil size={15} className="text-walnut" />
                              </button>
                              <button
                                onClick={() => handleCancelar(ev)}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Cancelar evento"
                              >
                                <Trash2 size={15} className="text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Aviso sobre aprovação */}
          {pendentes > 0 && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="font-body text-sm text-amber-700">
                {pendentes} evento(s) aguardando aprovação do administrador. Você será notificado quando aprovado.
              </p>
            </div>
          )}

        </div>
      </main>

      <ModalEvento
        aberto={modalAberto}
        onFechar={handleFecharModal}
        onSalvo={handleSalvo}
        eventoEdit={eventoEdit}
      />

      <ModalParticipantes
        evento={eventoParticipantes}
        onClose={() => setEventoParticipantes(null)}
      />
    </div>
  );
}
