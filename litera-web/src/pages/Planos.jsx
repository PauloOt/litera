import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, BookOpen } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { BadgePlano } from '../components/BadgePlano';
import api from '../services/api';

/* ─── Definição dos planos ───────────────────────────────────────────── */
const PLANOS = [
  {
    id: 'Gratuito',
    icone: BookOpen,
    preco: 'R$ 0',
    periodo: 'para sempre',
    descricao: 'Para quem quer começar a organizar suas leituras.',
    beneficios: [
      'Leituras, favoritos e lista de desejos ilimitados',
      'Participação em todos os desafios',
      'Acesso a eventos gratuitos',
      'Pontos padrão (1×)',
    ],
    cor: 'var(--color-sand)',
    textoCor: 'var(--color-espresso)',
    btnBg: 'transparent',
    btnBorde: '1px solid var(--color-sand)',
    btnCor: 'var(--color-walnut)',
    btnTexto: (planoAtual) => planoAtual === 'Gratuito' ? 'Plano atual' : 'Fazer downgrade',
    popular: false,
  },
  {
    id: 'Pro',
    icone: Zap,
    preco: 'R$ 19,90',
    periodo: 'por mês',
    descricao: 'Para leitores que querem aproveitar ao máximo.',
    beneficios: [
      'Tudo do plano Gratuito',
      '10% de desconto em eventos',
      'Multiplicador de pontos 1.5×',
      'Suporte prioritário',
    ],
    cor: 'var(--color-espresso)',
    textoCor: 'var(--color-cream)',
    btnBg: 'var(--color-stone)',
    btnBorde: 'none',
    btnCor: 'var(--color-cream)',
    btnTexto: (planoAtual) => planoAtual === 'Pro' ? 'Plano atual' : 'Assinar Pro',
    popular: true,
  },
  {
    id: 'Premium',
    icone: Crown,
    preco: 'R$ 39,90',
    periodo: 'por mês',
    descricao: 'A experiência completa para o leitor apaixonado.',
    beneficios: [
      'Tudo do plano Pro',
      '25% de desconto em eventos',
      'Multiplicador de pontos 2×',
      'Acesso antecipado a eventos',
      'Suporte VIP',
    ],
    cor: 'var(--color-bark)',
    textoCor: 'var(--color-cream)',
    btnBg: 'var(--color-stone)',
    btnBorde: 'none',
    btnCor: 'var(--color-cream)',
    btnTexto: (planoAtual) => planoAtual === 'Premium' ? 'Plano atual' : 'Assinar Premium',
    popular: false,
  },
];

/* ─── Card de plano ──────────────────────────────────────────────────── */
function CardPlano({ plano, planoAtual, onAssinar, assinando }) {
  const ehAtual = planoAtual === plano.id;
  const Icone   = plano.icone;

  return (
    <div
      className={plano.popular ? 'plan-popular' : ''}
      style={{
        position: 'relative',
        borderRadius: 20,
        padding: 28,
        backgroundColor: plano.cor,
        color: plano.textoCor,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Badge "Mais popular" */}
      {plano.popular && (
        <div style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-stone)',
          color: 'var(--color-cream)',
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 500,
          padding: '3px 12px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
        }}>
          Mais popular
        </div>
      )}

      {/* Ícone + nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icone size={20} style={{ color: plano.id === 'Gratuito' ? 'var(--color-stone)' : 'var(--color-cream)' }} />
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, lineHeight: 1, margin: 0 }}>
            {plano.id}
          </p>
          {ehAtual && (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 11,
              color: plano.id === 'Gratuito' ? 'var(--color-stone)' : 'var(--color-stone)',
            }}>
              ← plano atual
            </span>
          )}
        </div>
      </div>

      {/* Preço */}
      <div>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, lineHeight: 1,
          margin: 0,
          color: plano.id === 'Gratuito' ? 'var(--color-espresso)' : 'var(--color-cream)',
        }}>
          {plano.preco}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, opacity: 0.7, marginTop: 2 }}>
          {plano.periodo}
        </p>
      </div>

      {/* Descrição */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, opacity: 0.8, lineHeight: 1.5, margin: 0 }}>
        {plano.descricao}
      </p>

      {/* Benefícios */}
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', margin: 0, padding: 0 }}>
        {plano.beneficios.map(b => (
          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Check size={14} style={{ color: 'var(--color-stone)', marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, opacity: 0.9, lineHeight: 1.4 }}>{b}</span>
          </li>
        ))}
      </ul>

      {/* Botão */}
      <button
        onClick={() => !ehAtual && onAssinar(plano.id)}
        disabled={ehAtual || assinando === plano.id}
        style={{
          marginTop: 'auto',
          width: '100%',
          padding: '12px 0',
          borderRadius: 12,
          border: plano.btnBorde,
          background: ehAtual ? 'rgba(255,255,255,0.1)' : plano.btnBg,
          color: ehAtual ? (plano.id === 'Gratuito' ? 'var(--color-walnut)' : 'rgba(255,255,255,0.5)') : plano.btnCor,
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 500,
          cursor: ehAtual ? 'default' : assinando === plano.id ? 'not-allowed' : 'pointer',
          opacity: assinando === plano.id ? 0.65 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {assinando === plano.id ? 'Redirecionando…' : plano.btnTexto(planoAtual)}
      </button>
    </div>
  );
}

/* ─── Comparativo de benefícios ──────────────────────────────────────── */
const COMPARATIVO = [
  { item: 'Leituras ilimitadas',       gratuito: true,  pro: true,  premium: true  },
  { item: 'Favoritos e lista de desejos', gratuito: true, pro: true, premium: true },
  { item: 'Participação em desafios',  gratuito: true,  pro: true,  premium: true  },
  { item: 'Acesso a eventos gratuitos',gratuito: true,  pro: true,  premium: true  },
  { item: 'Desconto em eventos',       gratuito: false, pro: '10%', premium: '25%' },
  { item: 'Multiplicador de pontos',   gratuito: '1×',  pro: '1.5×',premium: '2×' },
  { item: 'Suporte prioritário',       gratuito: false, pro: true,  premium: true  },
  { item: 'Acesso antecipado a eventos',gratuito: false,pro: false, premium: true  },
  { item: 'Suporte VIP',              gratuito: false, pro: false,  premium: true  },
];

function CelulaComparativo({ valor }) {
  if (valor === false) return <span className="text-walnut/40">—</span>;
  if (valor === true)  return <Check size={16} className="text-stone mx-auto" />;
  return <span className="font-body text-sm font-medium text-stone">{valor}</span>;
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Planos() {
  const navigate = useNavigate();
  const [planoAtual, setPlanoAtual] = useState('Gratuito');
  const [carregando, setCarregando] = useState(true);
  const [assinando, setAssinando]   = useState(null);

  useEffect(() => {
    api.get('/perfil')
      .then(({ data }) => setPlanoAtual(data.plano ?? 'Gratuito'))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  async function handleAssinar(id) {
    if (id === 'Gratuito') {
      /* downgrade — vai para perfil para cancelar assinatura */
      navigate('/perfil');
      return;
    }
    setAssinando(id);
    try {
      const { data } = await api.post('/pagamentos/assinar', { plano: id });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      /* silencia — mostra estado normal novamente */
    } finally {
      setAssinando(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-10 px-4 md:px-8 page-enter">
        <div className="max-w-5xl mx-auto w-full">

          {/* Cabeçalho */}
          <header className="mb-10 text-center">
            <h1 className="font-display font-bold text-4xl text-espresso mb-3">
              Escolha seu plano
            </h1>
            <p className="font-body text-walnut text-base max-w-lg mx-auto leading-relaxed">
              Os planos afetam descontos em eventos e multiplicador de pontos.
              Leituras, favoritos e lista de desejos são{' '}
              <strong className="text-espresso font-medium">ilimitados para todos</strong>.
            </p>
            {!carregando && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="font-body text-sm text-walnut">Seu plano:</span>
                <BadgePlano plano={planoAtual} />
              </div>
            )}
          </header>

          {/* Cards de planos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {PLANOS.map(p => (
              <CardPlano
                key={p.id}
                plano={p}
                planoAtual={planoAtual}
                onAssinar={handleAssinar}
                assinando={assinando}
              />
            ))}
          </div>

          {/* Tabela comparativa */}
          <section>
            <h2 className="font-display font-semibold text-2xl text-espresso mb-6 text-center">
              Comparativo completo
            </h2>
            <div className="bg-sand rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream">
                    <th className="text-left p-4 font-body text-sm font-medium text-walnut w-1/2">Recurso</th>
                    <th className="text-center p-4 font-body text-sm font-medium text-walnut">Gratuito</th>
                    <th className="text-center p-4 font-body text-sm font-medium text-espresso">Pro</th>
                    <th className="text-center p-4 font-body text-sm font-medium text-stone">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIVO.map((row, i) => (
                    <tr
                      key={row.item}
                      className={i % 2 === 0 ? 'bg-sand' : 'bg-cream/50'}
                    >
                      <td className="p-4 font-body text-sm text-espresso">{row.item}</td>
                      <td className="p-4 text-center"><CelulaComparativo valor={row.gratuito} /></td>
                      <td className="p-4 text-center"><CelulaComparativo valor={row.pro} /></td>
                      <td className="p-4 text-center"><CelulaComparativo valor={row.premium} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ rápido */}
          <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                p: 'Posso cancelar a qualquer momento?',
                r: 'Sim. O cancelamento é imediato e você mantém os benefícios até o fim do período pago.',
              },
              {
                p: 'Meu progresso de leituras é preservado?',
                r: 'Sempre. Leituras, histórico e pontos nunca são perdidos, independente do plano.',
              },
              {
                p: 'O pagamento é seguro?',
                r: 'Usamos o Stripe, processador líder mundial em pagamentos online, com certificação PCI DSS.',
              },
              {
                p: 'Posso mudar de plano depois?',
                r: 'Sim. Você pode fazer upgrade ou downgrade a qualquer momento pelo seu perfil.',
              },
            ].map(({ p, r }) => (
              <div key={p} className="bg-sand rounded-2xl p-5">
                <p className="font-body font-medium text-sm text-espresso mb-1">{p}</p>
                <p className="font-body text-sm text-walnut leading-relaxed">{r}</p>
              </div>
            ))}
          </section>

        </div>
      </main>
    </div>
  );
}
