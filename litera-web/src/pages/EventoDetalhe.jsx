import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, ArrowLeft } from 'lucide-react';
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
  const [cupom, setCupom] = useState('');
  const [comprando, setComprando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleComprar() {
    setComprando(true);
    setErro('');
    try {
      const body = cupom.trim() ? { codigoCupom: cupom.trim() } : {};
      const res = await api.post(`/eventos/${evento.id}/comprar`, body);
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      setErro(err.response?.data?.mensagem ?? 'Erro ao processar compra. Tente novamente.');
      setComprando(false);
    }
  }

  const precoFinal = evento.descontoPlano?.precoFinal ?? evento.preco;
  const desconto = evento.descontoPlano?.percentual ?? 0;

  return (
    <Modal isOpen={!!evento} onClose={onClose} title="Confirmar compra">
      <div className="flex flex-col gap-4">
        <p className="font-body text-sm text-walnut">
          Você está comprando um ingresso para{' '}
          <span className="font-medium text-espresso">"{evento.titulo}"</span>
        </p>

        {/* Preço */}
        <div className="bg-sand rounded-xl p-4 flex flex-col gap-1">
          {desconto > 0 && (
            <div className="flex justify-between font-body text-sm text-walnut">
              <span>Preço original</span>
              <span className="line-through">{formatarPreco(evento.preco)}</span>
            </div>
          )}
          {desconto > 0 && (
            <div className="flex justify-between font-body text-sm text-stone">
              <span>Desconto do plano ({desconto}%)</span>
              <span>-{formatarPreco(evento.preco - precoFinal)}</span>
            </div>
          )}
          <div className="flex justify-between font-display font-bold text-lg text-bark pt-1">
            <span>Total</span>
            <span>{formatarPreco(precoFinal)}</span>
          </div>
        </div>

        {/* Cupom */}
        <div>
          <label className="font-body text-sm text-walnut block mb-1">Cupom de pontos (opcional)</label>
          <input
            value={cupom}
            onChange={e => setCupom(e.target.value)}
            placeholder="Ex: LITERA-ABC123"
            className="w-full border border-sand rounded-lg px-3 py-2 font-body text-sm text-espresso bg-cream focus:outline-none focus:ring-2 focus:ring-stone"
          />
        </div>

        <p className="font-body text-xs text-walnut bg-stone/10 rounded-lg px-3 py-2">
          +40 pontos ao realizar o check-in no evento
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
            {comprando ? 'Redirecionando…' : 'Comprar ingresso'}
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
        <main className="flex-1 flex items-center justify-center ml-0 md:ml-64">
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

      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
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
