import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingBag, CalendarDays, Star, Check, ArrowUpRight } from 'lucide-react';

/* ─── Scroll reveal hook ───────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── SVG decorativo ─────────────────────────────────────────────── */
function BookStack() {
  return (
    <svg viewBox="0 0 380 440" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full anim-float" style={{ maxHeight: 400 }}>
      {/* Sombra base */}
      <ellipse cx="190" cy="400" rx="110" ry="14" fill="#011826" opacity="0.4" />

      {/* Livro fundo esquerdo */}
      <rect x="40" y="100" width="100" height="240" rx="6" fill="#024959" opacity="0.7" />
      <rect x="40" y="100" width="14" height="240" rx="4" fill="#A7E4F2" opacity="0.3" />
      <rect x="62" y="130" width="58" height="5" rx="2.5" fill="#A7E4F2" opacity="0.4" />
      <rect x="62" y="145" width="44" height="4" rx="2" fill="#A7E4F2" opacity="0.2" />

      {/* Livro principal centro */}
      <rect x="130" y="60" width="130" height="300" rx="8" fill="#011826" />
      <rect x="130" y="60"  width="20" height="300" rx="6" fill="#A7E4F2" opacity="0.45" />
      {/* spine shine */}
      <rect x="135" y="60" width="4" height="300" rx="2" fill="white" opacity="0.08" />
      <rect x="160" y="100" width="78" height="6" rx="3" fill="#A7E4F2" opacity="0.7" />
      <rect x="160" y="116" width="58" height="4" rx="2" fill="#A7E4F2" opacity="0.35" />
      <rect x="160" y="130" width="68" height="4" rx="2" fill="#A7E4F2" opacity="0.25" />
      <rect x="160" y="144" width="48" height="4" rx="2" fill="#A7E4F2" opacity="0.25" />
      {/* decoração losango */}
      <rect x="195" y="230" width="24" height="24" rx="4" fill="#024959" transform="rotate(45 195 230)" />
      <rect x="197" y="232" width="20" height="20" rx="3" fill="none" stroke="#A7E4F2" strokeWidth="1.2" strokeOpacity="0.5" transform="rotate(45 197 232)" />

      {/* Livro direita */}
      <rect x="250" y="130" width="90" height="210" rx="6" fill="#024959" opacity="0.85" />
      <rect x="250" y="130" width="13" height="210" rx="4" fill="#A7E4F2" opacity="0.35" />
      <rect x="270" y="165" width="52" height="5" rx="2.5" fill="#A7E4F2" opacity="0.55" />
      <rect x="270" y="180" width="38" height="4" rx="2" fill="#A7E4F2" opacity="0.28" />

      {/* Livro deitado embaixo */}
      <rect x="80" y="358" width="220" height="26" rx="6" fill="#A7E4F2" opacity="0.1" />
      <rect x="80" y="358" width="220" height="26" rx="6" stroke="#A7E4F2" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="80" y="358" width="30" height="26" rx="6" fill="#A7E4F2" opacity="0.12" />

      {/* Marcador de página */}
      <rect x="218" y="40" width="10" height="55" rx="5" fill="#C08552" opacity="0.7" />
      <polygon points="213,92 228,92 220.5,108" fill="#C08552" opacity="0.7" />

      {/* Partículas */}
      <circle cx="345" cy="90"  r="4" fill="#A7E4F2" opacity="0.35" />
      <circle cx="55"  cy="320" r="3" fill="#A7E4F2" opacity="0.25" />
      <circle cx="330" cy="290" r="5" fill="#024959" opacity="0.5" />
      <circle cx="100" cy="80"  r="2.5" fill="#C08552" opacity="0.45" />

      {/* Linha decorativa */}
      <line x1="40" y1="52" x2="120" y2="52" stroke="#A7E4F2" strokeWidth="1" strokeOpacity="0.2" />
    </svg>
  );
}

/* ─── Navbar ───────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-8 transition-all duration-300 ${
        scrolled
          ? 'bg-ink/90 nav-blur shadow-2xl shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      {/* Logo */}
      <span className="font-display font-bold text-2xl text-cream tracking-widest flex-1 select-none">
        LITERA
      </span>

      {/* Linha separadora vertical decorativa */}
      <div className="hidden md:block w-px h-5 bg-walnut/40 mx-6" />

      <nav className="flex items-center gap-3">
        <Link
          to="/login"
          className="px-4 py-2 text-sky text-sm font-body font-medium border border-sky/40 rounded-lg hover:border-sky hover:bg-sky/8 transition-all duration-200"
        >
          Entrar
        </Link>
        <Link
          to="/cadastro"
          className="px-4 py-2 bg-teal text-cream text-sm font-body font-medium rounded-lg hover:bg-teal/80 transition-colors duration-200"
        >
          Criar conta
        </Link>
      </nav>
    </header>
  );
}

/* ─── Marquee ──────────────────────────────────────────────────────── */
const marqueeItems = [
  'Leituras', '·', 'Eventos', '·', 'Pontos', '·', 'Mercado Livre',
  '·', 'Desafios', '·', 'Ranking', '·', 'Comunidade', '·',
];

function Marquee() {
  const doubled = [...marqueeItems, ...marqueeItems];
  return (
    <div className="overflow-hidden py-3 border-y border-sky/15" style={{ background: 'rgba(2,73,89,0.35)' }}>
      <div className="flex gap-8 marquee-track whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} className="font-body text-xs font-medium tracking-[0.2em] uppercase text-sky/60">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="relative grain min-h-screen bg-ink flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 70% 60% at 30% 50%, #013345 0%, #011826 60%)',
      }}
    >
      {/* Glow decorativo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '15%', right: '5%',
          width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(2,73,89,0.35) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />

      <div className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 pt-24 pb-16 items-center">

          {/* Copy */}
          <div>
            {/* Label */}
            <div className="anim-fade-up anim-d1 flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-sky/60" />
              <span className="font-body text-xs font-medium tracking-[0.25em] uppercase text-sky/70">
                Plataforma literária
              </span>
            </div>

            {/* Headline */}
            <h1
              className="anim-fade-up anim-d2 font-display font-bold text-cream leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(3rem, 6.5vw, 5rem)' }}
            >
              Sua jornada
              <br />
              <span className="shimmer-text">literária</span>
              <br />
              começa aqui.
            </h1>

            {/* Sub */}
            <p
              className="anim-fade-up anim-d3 font-body text-walnut leading-relaxed mb-10"
              style={{ fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', maxWidth: 480 }}
            >
              Gerencie empréstimos, descubra livros no Mercado Livre,
              participe de eventos e acumule pontos a cada leitura.
            </p>

            {/* CTAs */}
            <div className="anim-fade-up anim-d4 flex flex-wrap gap-4">
              <Link
                to="/cadastro"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-teal text-cream font-body font-medium rounded-xl hover:bg-teal/80 transition-all duration-200"
              >
                Criar conta grátis
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <a
                href="#planos"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-stone/60 text-stone font-body font-medium rounded-xl hover:border-stone hover:bg-stone/8 transition-all duration-200"
              >
                Ver planos
              </a>
            </div>

            {/* Social proof */}
            <div className="anim-fade-in anim-d4 flex items-center gap-3 mt-10">
              <div className="flex -space-x-2">
                {['E', 'M', 'R', 'L'].map((l, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-ink flex items-center justify-center font-body text-[10px] font-medium text-cream"
                    style={{ background: ['#024959', '#734226', '#C08552', '#024959'][i] }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p className="font-body text-xs text-walnut">
                <span className="text-cream font-medium">EXPOTECH 2026</span> — projeto de conclusão
              </p>
            </div>
          </div>

          {/* Ilustração */}
          <div className="hidden lg:block h-[420px]">
            <BookStack />
          </div>
        </div>
      </div>

      {/* Marquee inferior */}
      <Marquee />
    </section>
  );
}

/* ─── Pilares ────────────────────────────────────────────────────────── */
const pilares = [
  {
    num: '01',
    icon: BookOpen,
    titulo: 'Gerenciador de Leituras',
    descricao: 'Registre cada livro emprestado, monitore prazos com alertas e ganhe pontos ao devolver no prazo.',
  },
  {
    num: '02',
    icon: ShoppingBag,
    titulo: 'Descubra no Mercado Livre',
    descricao: 'Busque títulos em tempo real, favorite e compre diretamente — sem sair do Litera.',
  },
  {
    num: '03',
    icon: CalendarDays,
    titulo: 'Eventos e Comunidade',
    descricao: 'Ingressos com desconto de acordo com seu plano e pontos extras ao fazer check-in.',
  },
];

function Pilares() {
  return (
    <section className="bg-cream py-28 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="scroll-reveal mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-body text-xs font-medium tracking-[0.25em] uppercase text-walnut/60 block mb-3">
              Como funciona
            </span>
            <h2
              className="font-display font-bold text-espresso leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}
            >
              Tudo que você precisa
              <br />
              para <span style={{ color: '#024959' }}>ler mais.</span>
            </h2>
          </div>
          <Link
            to="/cadastro"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-espresso/20 text-espresso font-body text-sm font-medium rounded-xl hover:bg-sand transition-colors"
          >
            Começar grátis <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pilares.map(({ num, icon: Icon, titulo, descricao }, i) => (
            <div
              key={num}
              className="scroll-reveal card-hover relative bg-sand rounded-2xl p-7 flex flex-col gap-5 overflow-hidden group cursor-default"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {/* Número decorativo */}
              <span
                className="absolute top-4 right-5 font-display font-bold select-none pointer-events-none"
                style={{ fontSize: 72, color: '#024959', opacity: 0.06, lineHeight: 1 }}
              >
                {num}
              </span>

              {/* Ícone */}
              <div className="w-12 h-12 rounded-xl bg-teal flex items-center justify-center shrink-0">
                <Icon size={22} className="text-sky" />
              </div>

              {/* Borda hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl bg-teal origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              />

              <div>
                <h3 className="font-display font-semibold text-espresso text-lg mb-2">{titulo}</h3>
                <p className="font-body text-sm text-walnut leading-relaxed">{descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Gamificação ────────────────────────────────────────────────────── */
const niveis = [
  { emoji: '🥉', nome: 'Bronze',   faixa: '0 – 499',      cor: '#734226' },
  { emoji: '🥈', nome: 'Prata',    faixa: '500 – 1.499',   cor: '#8C8C9A' },
  { emoji: '🥇', nome: 'Ouro',     faixa: '1.500 – 3.999', cor: '#BFA030' },
  { emoji: '💎', nome: 'Platina',  faixa: '4.000 – 9.999', cor: '#A7E4F2' },
  { emoji: '👑', nome: 'Diamante', faixa: '10.000+',       cor: '#E8D5B7' },
];

const acoes = [
  { icon: BookOpen,     texto: 'Devolver no prazo',      pts: '+20' },
  { icon: Star,         texto: 'Avaliar com resenha',    pts: '+25' },
  { icon: CalendarDays, texto: 'Participar de evento',   pts: '+40' },
  { icon: ArrowUpRight, texto: 'Indicar um amigo',       pts: '+50' },
];

function Gamificacao() {
  return (
    <section className="grain relative py-28 px-8 overflow-hidden" style={{ background: '#013240' }}>
      {/* glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10%', right: '-5%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(167,228,242,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="scroll-reveal text-center mb-16">
          <span className="font-body text-xs font-medium tracking-[0.25em] uppercase text-sky/50 block mb-3">
            Gamificação
          </span>
          <h2
            className="font-display font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#A7E4F2' }}
          >
            Leia mais, ganhe mais.
          </h2>
          <p className="font-body text-cream/60 max-w-md mx-auto text-base">
            Cada ação gera pontos. Suba de nível e desbloqueie benefícios exclusivos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Níveis */}
          <div className="scroll-reveal">
            <p className="font-body text-xs font-medium tracking-[0.2em] uppercase text-sky/50 mb-5">Níveis</p>
            <div className="flex flex-col gap-3">
              {niveis.map(({ emoji, nome, faixa, cor }, i) => (
                <div
                  key={nome}
                  className="level-badge flex items-center gap-4 rounded-xl px-4 py-3.5 cursor-default"
                  style={{
                    background: 'rgba(1,24,38,0.45)',
                    border: '1px solid rgba(167,228,242,0.08)',
                    transitionDelay: `${i * 0.07}s`,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-sm" style={{ color: cor }}>{nome}</p>
                    <p className="font-body font-light text-xs text-cream/40">{faixa} pts</p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: cor, boxShadow: `0 0 8px ${cor}` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="scroll-reveal" style={{ transitionDelay: '0.15s' }}>
            <p className="font-body text-xs font-medium tracking-[0.2em] uppercase text-sky/50 mb-5">
              Como ganhar pontos
            </p>
            <div className="flex flex-col gap-3">
              {acoes.map(({ icon: Icon, texto, pts }) => (
                <div
                  key={texto}
                  className="flex items-center gap-4 rounded-xl px-4 py-4"
                  style={{
                    background: 'rgba(1,24,38,0.45)',
                    border: '1px solid rgba(167,228,242,0.08)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(2,73,89,0.6)' }}
                  >
                    <Icon size={16} className="text-sky" />
                  </div>
                  <p className="font-body text-sm text-cream/80 flex-1">{texto}</p>
                  <span
                    className="font-body font-medium text-sm px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(167,228,242,0.12)', color: '#A7E4F2' }}
                  >
                    {pts} pts
                  </span>
                </div>
              ))}
            </div>

            {/* Multiplicadores */}
            <div
              className="mt-5 rounded-xl p-4"
              style={{
                background: 'rgba(2,73,89,0.3)',
                border: '1px solid rgba(167,228,242,0.12)',
              }}
            >
              <p className="font-body text-xs text-sky/70 mb-3 uppercase tracking-widest">Multiplicadores por plano</p>
              <div className="flex gap-4">
                {[['Gratuito', '1×'], ['Pro', '1.5×'], ['Premium', '2×']].map(([p, m]) => (
                  <div key={p} className="flex-1 text-center">
                    <p className="font-display font-bold text-lg text-cream">{m}</p>
                    <p className="font-body text-xs text-cream/40">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Planos ─────────────────────────────────────────────────────────── */
const planos = [
  {
    nome: 'Gratuito',
    preco: 'R$ 0',
    sub: 'para sempre',
    popular: false,
    esquema: {
      wrapper: { background: '#F5EFE6', border: '1px solid #E0D5C8' },
      titulo: '#8C5A3C',
      preco: '#2A1917',
      sub: '#8C5A3C',
      btn: 'border border-teal text-teal hover:bg-teal hover:text-cream',
      check: '#024959',
      item: '#4B2E2B',
    },
    beneficios: ['Leituras ilimitadas', 'Favoritos ilimitados', 'Lista de desejos', 'Sem desconto em eventos', 'Multiplicador 1×'],
    cta: 'Começar grátis',
  },
  {
    nome: 'Pro',
    preco: 'R$ 19,90',
    sub: '/mês',
    popular: true,
    esquema: {
      wrapper: { background: '#011826' },
      titulo: '#A7E4F2',
      preco: '#ffffff',
      sub: '#A7E4F2',
      btn: 'bg-teal text-cream hover:bg-teal/80',
      check: '#A7E4F2',
      item: 'rgba(255,255,255,0.75)',
    },
    beneficios: ['Tudo do Gratuito', '10% de desconto em eventos', 'Multiplicador 1.5× de pontos', 'Badge Pro exclusivo'],
    cta: 'Assinar Pro',
  },
  {
    nome: 'Premium',
    preco: 'R$ 39,90',
    sub: '/mês',
    popular: false,
    esquema: {
      wrapper: { background: '#024959', border: '1px solid rgba(167,228,242,0.2)' },
      titulo: '#A7E4F2',
      preco: '#ffffff',
      sub: '#A7E4F2',
      btn: 'bg-cream text-teal font-medium hover:bg-cream/90',
      check: '#A7E4F2',
      item: 'rgba(255,255,255,0.75)',
    },
    beneficios: ['Tudo do Pro', '25% de desconto em eventos', 'Multiplicador 2× de pontos', 'Badge Premium exclusivo', 'Suporte prioritário'],
    cta: 'Assinar Premium',
  },
];

function Planos() {
  return (
    <section id="planos" className="bg-cream py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="scroll-reveal text-center mb-16">
          <span className="font-body text-xs font-medium tracking-[0.25em] uppercase text-walnut/60 block mb-3">
            Planos
          </span>
          <h2
            className="font-display font-bold text-espresso leading-tight mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}
          >
            Escolha seu plano
          </h2>
          <p className="font-body text-walnut text-base max-w-sm mx-auto">
            Leituras, favoritos e lista de desejos são ilimitados em todos os planos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {planos.map((p, i) => (
            <div
              key={p.nome}
              className={`scroll-reveal relative flex flex-col rounded-2xl p-7 card-hover ${p.popular ? 'plan-popular' : ''}`}
              style={{
                ...p.esquema.wrapper,
                transitionDelay: `${i * 0.1}s`,
                transform: p.popular ? 'translateY(-8px)' : undefined,
              }}
            >
              {p.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-body text-xs font-medium"
                  style={{ background: '#A7E4F2', color: '#011826' }}
                >
                  Mais popular
                </div>
              )}

              {/* Cabeçalho */}
              <div className="mb-6">
                <p className="font-body text-xs font-medium tracking-widest uppercase mb-4" style={{ color: p.esquema.titulo, opacity: 0.7 }}>
                  {p.nome}
                </p>
                <div className="flex items-end gap-1">
                  <span className="font-display font-bold text-4xl leading-none" style={{ color: p.esquema.preco }}>
                    {p.preco}
                  </span>
                  <span className="font-body font-light text-sm mb-1" style={{ color: p.esquema.sub, opacity: 0.6 }}>
                    {p.sub}
                  </span>
                </div>
              </div>

              {/* Separador */}
              <div className="w-full h-px mb-6" style={{ background: 'currentColor', opacity: 0.08 }} />

              {/* Benefícios */}
              <ul className="flex flex-col gap-3 flex-1 mb-8">
                {p.beneficios.map(b => (
                  <li key={b} className="flex items-start gap-2.5">
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: p.esquema.check }} />
                    <span className="font-body text-sm leading-snug" style={{ color: p.esquema.item }}>{b}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/cadastro"
                className={`w-full py-3 rounded-xl text-sm font-body text-center transition-all duration-200 ${p.esquema.btn}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Final ──────────────────────────────────────────────────────── */
function CTAFinal() {
  return (
    <section className="grain relative bg-ink py-32 px-8 text-center overflow-hidden">
      {/* glow central */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(2,73,89,0.4) 0%, transparent 70%)',
        }}
      />
      <div className="relative scroll-reveal">
        <span className="font-body text-xs font-medium tracking-[0.25em] uppercase text-sky/50 block mb-4">
          Comece hoje
        </span>
        <h2
          className="font-display font-bold text-cream leading-tight mb-4"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}
        >
          Pronto para começar?
        </h2>
        <p className="font-body text-walnut text-base mb-10">
          Crie sua conta gratuitamente. Sem cartão de crédito.
        </p>
        <Link
          to="/cadastro"
          className="group inline-flex items-center gap-2 px-9 py-4 bg-teal text-cream font-body font-medium rounded-xl hover:bg-teal/80 transition-all duration-200 text-base"
        >
          Criar conta grátis
          <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

/* ─── Rodapé ─────────────────────────────────────────────────────────── */
function Rodape() {
  return (
    <footer className="bg-espresso py-8 px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-display font-bold text-cream text-xl tracking-widest">LITERA</span>
          <span className="w-px h-4 bg-walnut/40" />
          <span className="font-body font-light text-walnut text-sm">EXPOTECH 2026</span>
        </div>
        <a
          href="https://github.com/PauloOt/litera"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-body text-sm text-walnut hover:text-cream transition-colors"
        >
          GitHub <ArrowUpRight size={13} />
        </a>
      </div>
    </footer>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Landing() {
  useReveal();

  return (
    <>
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
