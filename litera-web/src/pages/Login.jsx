import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

/* ─── SVG decorativo ─────────────────────────────────────────────────── */
function DecoSVG() {
  return (
    <svg viewBox="0 0 400 500" className="w-full max-w-xs opacity-20" aria-hidden="true">
      <rect x="40"  y="60"  width="80"  height="110" rx="6" fill="#A7E4F2" transform="rotate(-8,80,115)" />
      <rect x="150" y="30"  width="80"  height="110" rx="6" fill="#024959" transform="rotate(5,190,85)" />
      <rect x="260" y="80"  width="80"  height="110" rx="6" fill="#A7E4F2" transform="rotate(-4,300,135)" />
      <rect x="80"  y="220" width="80"  height="110" rx="6" fill="#024959" transform="rotate(6,120,275)" />
      <rect x="200" y="200" width="80"  height="110" rx="6" fill="#A7E4F2" transform="rotate(-5,240,255)" />
      <rect x="310" y="250" width="80"  height="110" rx="6" fill="#024959" transform="rotate(3,350,305)" />
      <line x1="20"  y1="400" x2="380" y2="400" stroke="#A7E4F2" strokeWidth="2" opacity="0.4" />
      <line x1="20"  y1="420" x2="280" y2="420" stroke="#A7E4F2" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

/* ─── Campo de formulário ────────────────────────────────────────────── */
function Campo({ label, id, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-body text-sm font-medium text-bark">
        {label}
      </label>
      {children}
      {error && (
        <p className="font-body text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMsg = location.state?.success ?? null;

  const [form, setForm] = useState({ email: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
    setGlobalError('');
  }

  function validate() {
    const errs = {};
    if (!form.email) {
      errs.email = 'E-mail obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Formato de e-mail inválido';
    }
    if (!form.senha) errs.senha = 'Senha obrigatória';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: form.email, senha: form.senha });
      login(data.token, data.usuario ?? null);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setGlobalError('E-mail ou senha incorretos');
      } else {
        setGlobalError('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Metade esquerda (decorativa) ── */}
      <div
        className="hidden md:flex flex-col items-center justify-center gap-8 px-10"
        style={{ width: '45%', background: '#011826' }}
      >
        <div className="text-center">
          <p className="font-display text-5xl font-bold text-cream tracking-wide select-none">Litera</p>
          <p className="font-body text-sm font-light mt-2" style={{ color: '#8C5A3C' }}>
            Sua jornada literária começa aqui
          </p>
        </div>
        <DecoSVG />
        <div className="flex items-center gap-2" style={{ color: '#024959' }}>
          <BookOpen size={18} />
          <span className="font-body text-xs" style={{ color: '#8C5A3C' }}>
            Gerencie leituras, eventos e pontos em um só lugar
          </span>
        </div>
      </div>

      {/* ── Metade direita (formulário) ── */}
      <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mensagem de sucesso do cadastro */}
          {successMsg && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="font-body text-sm text-green-700">{successMsg}</p>
            </div>
          )}

          <h1 className="font-display text-3xl font-semibold text-espresso mb-1">
            Bem-vindo de volta
          </h1>
          <p className="font-body text-sm text-walnut mb-8">Entre na sua conta</p>

          {/* Erro global */}
          {globalError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="font-body text-sm text-red-600">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Campo label="E-mail" id="email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className={`rounded-xl border px-4 py-3 font-body text-sm text-espresso bg-white outline-none transition focus:ring-2 focus:ring-teal/40 ${
                  errors.email ? 'border-red-400' : 'border-sand'
                }`}
              />
            </Campo>

            <Campo label="Senha" id="senha" error={errors.senha}>
              <div className="relative">
                <input
                  id="senha"
                  name="senha"
                  type={showSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 font-body text-sm text-espresso bg-white outline-none transition focus:ring-2 focus:ring-teal/40 ${
                    errors.senha ? 'border-red-400' : 'border-sand'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-walnut hover:text-espresso transition"
                  tabIndex={-1}
                  aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Campo>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl py-3 font-body text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ background: '#024959' }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-walnut">
            Não tem conta?{' '}
            <Link to="/cadastro" className="font-medium underline" style={{ color: '#024959' }}>
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
