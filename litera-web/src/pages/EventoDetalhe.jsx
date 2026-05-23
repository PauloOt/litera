import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, ArrowLeft, Minus, Plus } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Modal } from '../components/Modal';
import api from '../services/api';

/* ─── Utilitários ────────────────────────────────────────────────────── */
function formatarData(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
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

/* ─── Modal de confirmação de compra ─────────────────────────────────── */
function ModalCompra({ evento, onClose }) {
  const navigate = useNavigate();
  const [quantidade, setQuantidade] = useState(1);
  const [cupom, setCupom] = useState('');
  const [cupomStatus, setCupomStatus] = useState(null);
  const [comprando, setComprando] = useState(false);
  const [erro, setErro] = useState('');

  const maxIngressos = Math.min(evento.vagasRestantes ?? 10, 10);

  async function validarCupom(codigo) {
    if (!codigo.trim()) { setCupomStatus(null); return; }
    setCupomStatus('validando');
    try {
      const res = await api.get(`/pontos/cupom/${codigo.trim()}`, { _silencioso: true });
      setCupomStatus(res.data);
    } catch {
      setCupomStatus({ valido: false, percentualDesconto: null });
    }
  }

  async function handleComprar() {
    setComprando(true);
    setErro('');
    try {
      const body = { eventoId: evento.id, quantidade };
      if (cupom.trim()) body.codigoCupom = cupom.trim();
      const res = await api.post('/pagamentos/ingresso', body, { _silencioso: true });
      window.location.href = res.data.url;
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.erro ?? (typeof data === 'string' ? data : 'Erro ao processar compra. Tente novamente.');
      setErro(typeof msg === 'string' ? msg : 'Erro ao processar compra. Tente novamente.');
      setComprando(false);
    }
  }

  const precoUnitario = evento.descontoPlano?.precoFinal ?? evento.preco;
  const desconto = evento.descontoPlano?.percentual ?? 0;
  const totalOriginal = (evento.preco ?? 0) * quantidade;
  const totalFinal = (precoUnitario ?? 0) * quantidade;

  return (
    <Modal isOpen={!!evento} onClose={onClose} title="Confirmar compra">
      <div className="flex flex-col gap-4">
        <p className="font-body text-sm text-walnut">
          Você está comprando ingresso(s) para{' '}
          <span className="font-medium text-espresso">"{evento.titulo}"</span>
        </p>

        {/* Quantidade */}
        <div>
          <label className="font-body text-sm text-walnut block mb-2">Quantidade</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantidade(q => Math.max(1, q - 1))}
              disabled={quantidade <= 1}
              className="w-9 h-9 rounded-lg border border-sand flex items-center justify-center hover:bg-sand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus size={16} className="text-espresso" />
            </button>
            <span className="font-display font-bold text-xl text-espresso w-8 text-center">{quantidade}</span>
            <button
              type="button"
              onClick={() => setQuantidade(q => Math.min(maxIngressos, q + 1))}
              disabled={quantidade >= maxIngressos}
              className="w-9 h-9 rounded-lg border border-sand flex items-center justify-center hover:bg-sand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} className="text-espresso" />
            </button>
            <span className="font-body text-xs text-walnut">máx. {maxIngressos}</span>
          </div>
        </div>

        {/* Preço */}
        <div className="bg-sand rounded-xl p-4 flex flex-col gap-1">
          <div className="flex justify-between font-body text-sm text-walnut">
            <span>{quantidade}x ingresso</span>
            <span>{formatarPreco(precoUnitario)} cada</span>
          </div>
          {desconto > 0 && (
            <div className="flex justify-between font-body text-sm text-walnut">
              <span>Subtotal original</span>
              <span className="line-through">{formatarPreco(totalOriginal)}</span>
            </div>
          )}
          {desconto > 0 && (
            <div className="flex justify-between font-body text-sm text-stone">
              <span>Desconto do plano ({desconto}%)</span>
              <span>-{formatarPreco(totalOriginal - totalFinal)}</span>
            </div>
          )}
          <div className="flex justify-between font-display font-bold text-lg text-bark pt-1 border-t border-walnut/10 mt-1">
            <span>Total</span>
            <span>{formatarPreco(totalFinal)}</span>
          </div>
        </div>

        {/* Cupom */}
        <div>
          <label className="font-body text-sm text-walnut block mb-1">Cupom de pontos (opcional)</label>
          <input
            value={cupom}
            onChange={e => { setCupom(e.target.value); setCupomStatus(null); }}
            onBlur={() => validarCupom(cupom)}
            placeholder="Ex: LITERA-ABC123"
            className={`w-full border rounded-lg px-3 py-2 font-body text-sm text-espresso bg-cream focus:outline-none focus:ring-2 focus:ring-stone ${
              cupomStatus && cupomStatus !== 'validando'
                ? cupomStatus.valido ? 'border-green-400' : 'border-red-400'
                : 'border-sand'
            }`}
          />
          {cupomStatus === 'validando' && (
            <p className="font-body text-xs text-walnut mt-1">Validando cupom...</p>
          )}
          {cupomStatus && cupomStatus !== 'validando' && cupomStatus.valido && (
            <p className="font-body text-xs text-green-700 mt-1">
              Cupom válido — {cupomStatus.percentualDesconto}% de desconto
            </p>
          )}
          {cupomStatus && cupomStatus !== 'validando' && !cupomStatus.valido && (
            <p className="font-body text-xs text-red-600 mt-1">Cupom inválido ou já utilizado</p>
          )}
        </div>

        <p className="font-body text-xs text-walnut bg-stone/10 rounded-lg px-3 py-2">
          +40 pontos por ingresso ao realizar o check-in no evento
        </p>

        {erro && <p className="font-body text-sm text-red-600">{erro}</p>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="font-body text-sm text-walnut px-4 py-2 rounded-lg border border-sand hover:bg-sand transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleComprar}
            disabled={comprando}
            className="font-body text-sm text-cream bg-bark px-4 py-2 rounded-lg hover:brightness-90 transition-all disabled:opacity-60"
          >
            {comprando ? 'Redirecionando…' : `Comprar ${quantidade} ingresso${quantidade > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function EventoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get(`/eventos/${id}`);
        setEvento(res.data);
      } catch {
        navigate('/eventos');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id, navigate]);

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

  if (!evento) return null;

  const precoFinal = evento.descontoPlano?.precoFinal ?? evento.preco;
  const desconto = evento.descontoPlano?.percentual ?? 0;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-8 px-4 md:px-8 page-enter">
        <div className="max-w-5xl mx-auto w-full">
        {/* Voltar */}
        <button
          onClick={() => navigate('/eventos')}
          className="flex items-center gap-1.5 font-body text-sm text-walnut hover:text-espresso mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Todos os eventos
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Coluna principal */}
          <div className="flex-1 min-w-0">
            {/* Capa */}
            <div className="w-full h-80 bg-sand rounded-2xl overflow-hidden mb-6">
              {evento.capa
                ? <img src={evento.capa} alt={evento.titulo} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <CalendarDays size={48} className="text-walnut" />
                  </div>
              }
            </div>

            {/* Título */}
            <h1 className="font-display font-bold text-3xl text-espresso mb-4">{evento.titulo}</h1>

            {/* Badges de info */}
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2 font-body text-sm text-walnut">
                <CalendarDays size={16} className="text-stone shrink-0" />
                <span>{formatarData(evento.dataHora)} às {formatarHora(evento.dataHora)}</span>
              </div>
              <div className="flex items-center gap-2 font-body text-sm text-walnut">
                <MapPin size={16} className="text-stone shrink-0" />
                <span>{evento.local}</span>
              </div>
              {evento.vagasRestantes !== undefined && (
                <div className="flex items-center gap-2 font-body text-sm text-walnut">
                  <Users size={16} className="text-stone shrink-0" />
                  <span>{evento.vagasRestantes} vagas restantes</span>
                </div>
              )}
            </div>

            {/* Descrição */}
            {evento.descricao && (
              <div className="mb-6">
                <h2 className="font-display font-semibold text-lg text-espresso mb-2">Sobre o evento</h2>
                <p className="font-body text-sm text-walnut leading-relaxed whitespace-pre-line">
                  {evento.descricao}
                </p>
              </div>
            )}

            {/* Organizador */}
            {evento.organizador && (
              <div className="flex items-center gap-3 bg-sand rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-bark flex items-center justify-center shrink-0">
                  {evento.organizador.foto
                    ? <img src={evento.organizador.foto} alt={evento.organizador.nome} className="w-full h-full rounded-full object-cover" />
                    : <span className="font-body font-bold text-cream text-sm">
                        {evento.organizador.nome?.[0]?.toUpperCase()}
                      </span>
                  }
                </div>
                <div>
                  <p className="font-body text-xs text-walnut">Organizado por</p>
                  <p className="font-body font-medium text-sm text-espresso">{evento.organizador.nome}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar de compra */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-8 bg-sand rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="font-display font-semibold text-lg text-espresso">Ingresso</h2>

              {/* Preços */}
              <div className="flex flex-col gap-1">
                {desconto > 0 && (
                  <div className="flex justify-between font-body text-sm text-walnut">
                    <span>Preço original</span>
                    <span className="line-through">{formatarPreco(evento.preco)}</span>
                  </div>
                )}
                {desconto > 0 && (
                  <div className="flex justify-between font-body text-sm text-stone">
                    <span>Desconto do seu plano</span>
                    <span>-{desconto}%</span>
                  </div>
                )}
                <div className="flex justify-between font-display font-bold text-2xl text-bark pt-1">
                  <span>{formatarPreco(precoFinal)}</span>
                </div>
              </div>

              {/* Vagas */}
              {evento.vagasRestantes !== undefined && (
                <p className="font-body text-xs text-walnut">
                  {evento.vagasRestantes} vagas restantes
                </p>
              )}

              {/* Pontos */}
              <p className="font-body text-xs text-stone bg-stone/10 rounded-lg px-3 py-2">
                Você ganhará +40 pontos ao fazer check-in
              </p>

              <button
                onClick={() => setModalAberto(true)}
                disabled={evento.vagasRestantes === 0}
                className="w-full font-body font-medium text-cream bg-bark py-3 rounded-xl hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {evento.vagasRestantes === 0 ? 'Esgotado' : 'Comprar ingresso'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </main>

      {modalAberto && (
        <ModalCompra
          evento={evento}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}
