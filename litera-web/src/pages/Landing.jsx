import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingBag, CalendarDays, Star, Check, ArrowRight } from 'lucide-react';

/* ─── SVG decorativo de livros ─────────────────────────────────────── */
function LivrosSVG() {
  return (
    <svg viewBox="0 0 420 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Livro grande de trás */}
      <rect x="160" y="80" width="120" height="160" rx="6" fill="#024959" />
      <rect x="160" y="80" width="18" height="160" rx="4" fill="#A7E4F2" opacity="0.5" />
      <rect x="185" y="110" width="75" height="6" rx="3" fill="#A7E4F2" opacity="0.6" />
      <rect x="185" y="126" width="55" height="4" rx="2" fill="#A7E4F2" opacity="0.35" />
      <rect x="185" y="138" width="65" height="4" rx="2" fill="#A7E4F2" opacity="0.35" />

      {/* Livro médio centro */}
      <rect x="110" y="150" width="100" height="140" rx="6" fill="#011826" stroke="#A7E4F2" strokeWidth="1.5" />
      <rect x="110" y="150" width="16" height="140" rx="4" fill="#A7E4F2" opacity="0.4" />
      <rect x="134" y="178" width="56" height="5" rx="2.5" fill="#A7E4F2" opacity="0.7" />
      <rect x="134" y="192" width="42" height="4" rx="2" fill="#A7E4F2" opacity="0.4" />
      <rect x="134" y="204" width="50" height="4" rx="2" fill="#A7E4F2" opacity="0.4" />

      {/* Livro fino direita */}
      <rect x="230" y="140" width="70" height="130" rx="5" fill="#024959" opacity="0.8" />
      <rect x="230" y="140" width="12" height="130" rx="3" fill="#A7E4F2" opacity="0.45" />
      <rect x="248" y="165" width="38" height="4" rx="2" fill="#A7E4F2" opacity="0.6" />
      <rect x="248" y="177" width="28" height="4" rx="2" fill="#A7E4F2" opacity="0.35" />

      {/* Livro deitado embaixo */}
      <rect x="90" y="295" width="220" height="28" rx="5" fill="#A7E4F2" opacity="0.15" />
      <rect x="90" y="295" width="220" height="28" rx="5" stroke="#A7E4F2" strokeWidth="1" strokeOpacity="0.3" />

      {/* Marcador */}
      <rect x="194" y="60" width="8" height="50" rx="4" fill="#A7E4F2" opacity="0.5" />
      <polygon points="194,108 202,108 198,120" fill="#A7E4F2" opacity="0.5" />

      {/* Brilhos */}
      <circle cx="320" cy="120" r="4" fill="#A7E4F2" opacity="0.4" />
      <circle cx="80"  cy="200" r="3" fill="#A7E4F2" opacity="0.3" />
      <circle cx="350" cy="260" r="5" fill="#024959" opacity="0.6" />
    </svg>
  );
}

/* ─── Dados ─────────────────────────────────────────────────────────── */
const pilares = [
  {
    icon: BookOpen,
    titulo: 'Gerenciador de Leituras',
    descricao: 'Registre todos os livros que você pegou emprestado, acompanhe prazos e ganhe pontos ao devolver no tempo certo.',
  },
  {
    icon: ShoppingBag,
    titulo: 'Descubra no Mercado Livre',
    descricao: 'Busque livros em tempo real, favorite os que quiser e compre diretamente com um clique, sem sair do Litera.',
  },
  {
    icon: CalendarDays,
    titulo: 'Eventos e Comunidade',
    descricao: 'Participe de eventos culturais com desconto exclusivo de acordo com o seu plano e acumule ainda mais pontos.',
  },
];

const niveis = [
  { nome: 'Bronze',   faixa: '0 – 499 pts',      emoji: '🥉' },
  { nome: 'Prata',    faixa: '500 – 1.499 pts',   emoji: '🥈' },
  { nome: 'Ouro',     faixa: '1.500 – 3.999 pts', emoji: '🥇' },
  { nome: 'Platina',  faixa: '4.000 – 9.999 pts', emoji: '💎' },
  { nome: 'Diamante', faixa: '10.000+ pts',        emoji: '👑' },
];

const acoesGeram = [
  { icon: BookOpen,     texto: 'Devolver livro no prazo',      pts: '+20 pts' },
  { icon: Star,         texto: 'Avaliar livro com resenha',     pts: '+25 pts' },
  { icon: CalendarDays, texto: 'Participar de um evento',       pts: '+40 pts' },
  { icon: ArrowRight,   texto: 'Indicar um amigo',              pts: '+50 pts' },
];

const planos = [
  {
    nome: 'Gratuito',
    preco: 'R$ 0,00',
    periodo: 'para sempre',
    destaque: false,
    popular: false,
    cor: 'bg-sand',
    textoCor: 'text-espresso',
    precoGor: 'text-espresso',
    btnClasse: 'bg-teal text-white hover:bg-teal/90',
    btnTexto: 'Começar grátis',
    beneficios: [
      'Leituras ilimitadas',
      'Favoritos ilimitados',
      'Lista de desejos ilimitada',
      'Busca no Mercado Livre',
      '0% de desconto em eventos',
      'Multiplicador 1× de pontos',
    ],
  },
  {
    nome: 'Pro',
    preco: 'R$ 19,90',
    periodo: '/mês',
    destaque: true,
    popular: true,
    cor: 'bg-ink',
    textoCor: 'text-cream',
    precoGor: 'text-sky',
    btnClasse: 'bg-teal text-white hover:bg-teal/90',
    btnTexto: 'Assinar Pro',
    beneficios: [
      'Tudo do Gratuito',
      '10% de desconto em eventos',
      'Multiplicador 1.5× de pontos',
      'Badge Pro exclusivo',
    ],
  },
  {
    nome: 'Premium',
    preco: 'R$ 39,90',
    periodo: '/mês',
    destaque: false,
    popular: false,
    cor: 'bg-teal',
    textoCor: 'text-cream',
    precoGor: 'text-sky',
    btnClasse: 'bg-cream text-teal hover:bg-cream/90 font-medium',
    btnTexto: 'Assinar Premium',
    beneficios: [
      'Tudo do Pro',
      '25% de desconto em eventos',
      'Multiplicador 2× de pontos',
      'Badge Premium exclusivo',
      'Suporte prioritário',
    ],
  },
];

/* ─── Navbar ─────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 bg-ink flex items-center px-8 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-black/40' : ''
      }`}
    >
      <span className="font-display font-bold text-2xl text-cream tracking-wide flex-1">
        Litera
      </span>
      <nav className="flex items-center gap-3">
        <Link
          to="/login"
          className="px-4 py-1.5 rounded-lg border border-sky text-sky text-sm font-body font-medium hover:bg-sky/10 transition-colors"
        >
          Entrar
        </Link>
        <Link
          to="/cadastro"
          className="px-4 py-1.5 rounded-lg bg-teal text-white text-sm font-body font-medium hover:bg-teal/90 transition-colors"
        >
          Criar conta
        </Link>
      </nav>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="relative min-h-screen bg-ink flex items-center overflow-hidden pt-16"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
        {/* Texto */}
        <div className="animate-fade-in-up">
          <h1
            className="font-display font-bold text-cream leading-tight mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)' }}
          >
            Sua jornada
            <br />
            <span className="text-sky">literária</span>
            <br />
            começa aqui.
          </h1>
          <p className="font-body text-walnut text-lg mb-8 max-w-md leading-relaxed">
            Gerencie suas leituras, descubra livros no Mercado Livre, participe
            de eventos culturais e acumule pontos a cada página virada.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/cadastro"
              className="px-6 py-3 bg-teal text-white font-body font-medium rounded-xl hover:bg-teal/90 transition-colors"
            >
              Criar conta grátis
            </Link>
            <a
              href="#planos"
              className="px-6 py-3 border border-stone text-stone font-body font-medium rounded-xl hover:bg-stone/10 transition-colors"
            >
              Conhecer planos
            </a>
          </div>
        </div>

        {/* Ilustração */}
        <div className="hidden lg:flex items-center justify-center h-80 opacity-90">
          <LivrosSVG />
        </div>
      </div>
    </section>
  );
}

/* ─── Pilares ─────────────────────────────────────────────────────────── */
function Pilares() {
  return (
    <section className="bg-cream py-24 px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-semibold text-3xl text-espresso text-center mb-12">
          Tudo que você precisa para ler mais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pilares.map(({ icon: Icon, titulo, descricao }) => (
            <div
              key={titulo}
              className="bg-sand rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md hover:bg-blush/40 transition-all duration-200 cursor-default"
            >
              <div className="w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center">
                <Icon size={22} className="text-teal" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-espresso mb-1">{titulo}</h3>
                <p className="font-body text-sm text-walnut leading-relaxed">{descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Gamificação ─────────────────────────────────────────────────────── */
function Gamificacao() {
  return (
    <section className="bg-teal py-24 px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-bold text-sky text-3xl text-center mb-3">
          Leia mais, ganhe mais
        </h2>
        <p className="font-body text-cream/80 text-center mb-12 text-base">
          Cada ação dentro do Litera gera pontos que sobem o seu nível e desbloqueiam benefícios.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Tabela de níveis */}
          <div>
            <h3 className="font-body font-medium text-sky mb-4 uppercase tracking-wider text-xs">
              Níveis
            </h3>
            <div className="flex flex-col gap-2">
              {niveis.map(({ nome, faixa, emoji }) => (
                <div key={nome} className="flex items-center gap-3 bg-ink/20 rounded-xl px-4 py-3">
                  <span className="text-xl">{emoji}</span>
                  <div className="flex-1">
                    <p className="font-body font-medium text-cream text-sm">{nome}</p>
                    <p className="font-body font-light text-cream/60 text-xs">{faixa}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações que geram pontos */}
          <div>
            <h3 className="font-body font-medium text-sky mb-4 uppercase tracking-wider text-xs">
              Como ganhar pontos
            </h3>
            <div className="flex flex-col gap-3">
              {acoesGeram.map(({ icon: Icon, texto, pts }) => (
                <div key={texto} className="flex items-center gap-3 bg-ink/20 rounded-xl px-4 py-3">
                  <Icon size={18} className="text-sky shrink-0" />
                  <p className="font-body text-cream text-sm flex-1">{texto}</p>
                  <span className="font-body font-medium text-sky text-sm">{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Planos ──────────────────────────────────────────────────────────── */
function Planos() {
  return (
    <section id="planos" className="bg-cream py-24 px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-semibold text-3xl text-espresso text-center mb-12">
          Escolha seu plano
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {planos.map((p) => (
            <div
              key={p.nome}
              className={`relative rounded-2xl p-6 flex flex-col gap-5 ${p.cor} ${
                p.destaque ? 'shadow-2xl scale-105' : ''
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky text-ink text-xs font-body font-medium px-3 py-1 rounded-full">
                  Mais popular
                </span>
              )}

              <div>
                <p className={`font-body font-medium text-sm mb-1 ${p.textoCor} opacity-70`}>{p.nome}</p>
                <p className={`font-display font-bold text-3xl ${p.precoGor}`}>
                  {p.preco}
                  <span className={`text-sm font-body font-light ml-1 ${p.textoCor} opacity-60`}>{p.periodo}</span>
                </p>
              </div>

              <ul className="flex flex-col gap-2 flex-1">
                {p.beneficios.map((b) => (
                  <li key={b} className={`flex items-start gap-2 font-body text-sm ${p.textoCor}`}>
                    <Check size={14} className="mt-0.5 shrink-0 text-sky" />
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                to="/cadastro"
                className={`w-full py-2.5 rounded-xl text-sm font-body text-center transition-colors ${p.btnClasse}`}
              >
                {p.btnTexto}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Final ───────────────────────────────────────────────────────── */
function CTAFinal() {
  return (
    <section className="bg-ink py-24 px-8 text-center">
      <h2 className="font-display font-bold text-cream text-4xl mb-3">
        Pronto para começar?
      </h2>
      <p className="font-body text-walnut text-base mb-8">
        Crie sua conta gratuitamente.
      </p>
      <Link
        to="/cadastro"
        className="inline-block px-8 py-3 bg-teal text-white font-body font-medium rounded-xl hover:bg-teal/90 transition-colors text-base"
      >
        Criar conta
      </Link>
    </section>
  );
}

/* ─── Rodapé ──────────────────────────────────────────────────────────── */
function Rodape() {
  return (
    <footer className="bg-espresso py-8 px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <span className="font-display font-bold text-cream text-xl">Litera</span>
        <span className="font-body font-light text-walnut text-sm ml-3">EXPOTECH 2026</span>
      </div>
      <a
        href="https://github.com/PauloOt/litera"
        target="_blank"
        rel="noopener noreferrer"
        className="font-body text-sm text-walnut hover:text-cream transition-colors"
      >
        GitHub do projeto ↗
      </a>
    </footer>
  );
}

/* ─── Animação (keyframes via style tag) ──────────────────────────────── */
const fadeStyle = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease both;
  }
`;

/* ─── Página ──────────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <>
      <style>{fadeStyle}</style>
      <Navbar />
      <main>
        <Hero />
        <Pilares />
        <Gamificacao />
        <Planos />
        <CTAFinal />
      </main>
      <Rodape />
    </>
  );
}
