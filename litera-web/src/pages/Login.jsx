import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

/* ─── SVG decorativo ─────────────────────────────────────────────────── */
function DecoSVG() {
  return (
    <svg viewBox="0 0 400 500" className="w-full max-w-xs opacity-20" aria-hidden="true">
      <rect x="40"  y="60"  width="80"  height="110" rx="6" fill="#C08552" transform="rotate(-8,80,115)" />
      <rect x="150" y="30"  width="80"  height="110" rx="6" fill="#4B2E2B" transform="rotate(5,190,85)" />
      <rect x="260" y="80"  width="80"  height="110" rx="6" fill="#E6E0D8" transform="rotate(-4,300,135)" />
      <rect x="80"  y="220" width="80"  height="110" rx="6" fill="#4B2E2B" transform="rotate(6,120,275)" />
      <rect x="200" y="200" width="80"  height="110" rx="6" fill="#C08552" transform="rotate(-5,240,255)" />
      <rect x="310" y="250" width="80"  height="110" rx="6" fill="#8C5A3C" transform="rotate(3,350,305)" />
      <line x1="20"  y1="400" x2="380" y2="400" stroke="#C08552" strokeWidth="2" opacity="0.4" />
      <line x1="20"  y1="420" x2="280" y2="420" stroke="#C08552" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

/* ─── Campo de formulário ────────────────────────────────────────────── */
function Campo({ label, id, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--color-bark)',
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#EF4444' }}>{error}</p>
      )}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMsg = location.state?.success ?? null;

  const [form, setForm]           = useState({ email: '', senha: '' });
  const [errors, setErrors]       = useState({});
  const [globalError, setGlobal]  = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading]     = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
    setGlobal('');
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
        setGlobal('E-mail ou senha incorretos');
      } else {
        setGlobal('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  /* ── Estilos reutilizáveis ─────────────────────────────────────────── */
  const inputBase = {
    width: '100%',
    border: '1px solid var(--color-sand)',
    borderRadius: 12,
    padding: '12px 16px',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--color-espresso)',
    backgroundColor: '#fff',
    outline: 'none',
    lineHeight: 1.5,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const inputError = { ...inputBase, borderColor: '#EF4444' };
  const inputFocus = {
    borderColor: 'var(--color-stone)',
    boxShadow: '0 0 0 3px rgba(192,133,82,0.2)',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Painel esquerdo (decorativo) ── */}
      <div
        className="hidden md:flex"
        style={{
          width: '45%',
          flexShrink: 0,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: '40px',
          background: 'var(--color-espresso)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            fontWeight: 700,
            color: 'var(--color-cream)',
            letterSpacing: '0.05em',
            userSelect: 'none',
          }}>
            Litera
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 300,
            color: 'var(--color-walnut)',
            marginTop: 8,
          }}>
            Sua jornada literária começa aqui
          </p>
        </div>

        <DecoSVG />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={16} style={{ color: 'var(--color-stone)' }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-walnut)',
          }}>
            Gerencie leituras, eventos e pontos em um só lugar
          </span>
        </div>
      </div>

      {/* ── Painel direito (formulário) ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-cream)',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mensagem de sucesso vinda do cadastro */}
          {successMsg && (
            <div style={{
              marginBottom: 24,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #bbf7d0',
              backgroundColor: '#f0fdf4',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#15803d' }}>
                {successMsg}
              </p>
            </div>
          )}

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 600,
            color: 'var(--color-espresso)',
            marginBottom: 4,
          }}>
            Bem-vindo de volta
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-walnut)',
            marginBottom: 32,
          }}>
            Entre na sua conta
          </p>

          {/* Erro global */}
          {globalError && (
            <div style={{
              marginBottom: 20,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#dc2626' }}>
                {globalError}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* E-mail */}
            <Campo label="E-mail" id="email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                style={errors.email ? inputError : inputBase}
                onFocus={e => Object.assign(e.target.style, inputFocus)}
                onBlur={e => {
                  e.target.style.boxShadow = '';
                  e.target.style.borderColor = errors.email ? '#EF4444' : 'var(--color-sand)';
                }}
              />
            </Campo>

            {/* Senha */}
            <Campo label="Senha" id="senha" error={errors.senha}>
              <div style={{ position: 'relative' }}>
                <input
                  id="senha"
                  name="senha"
                  type={showSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ ...(errors.senha ? inputError : inputBase), paddingRight: 44 }}
                  onFocus={e => Object.assign(e.target.style, inputFocus)}
                  onBlur={e => {
                    e.target.style.boxShadow = '';
                    e.target.style.borderColor = errors.senha ? '#EF4444' : 'var(--color-sand)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(s => !s)}
                  tabIndex={-1}
                  aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-walnut)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                  }}
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Campo>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '13px 0',
                borderRadius: 12,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: 'var(--color-bark)',
                color: 'var(--color-cream)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.01em',
                opacity: loading ? 0.65 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p style={{
            marginTop: 24,
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-walnut)',
          }}>
            Não tem conta?{' '}
            <Link
              to="/cadastro"
              style={{
                fontWeight: 500,
                color: 'var(--color-stone)',
                textDecoration: 'underline',
              }}
            >
              Criar conta
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
