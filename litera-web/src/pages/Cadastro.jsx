import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
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

/* ─── Validação de CPF ───────────────────────────────────────────────── */
function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(nums)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += +nums[i] * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== +nums[9]) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += +nums[i] * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === +nums[10];
}

/* ─── Máscara CPF ────────────────────────────────────────────────────── */
function mascaraCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nomeCompleto: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [errors, setErrors]      = useState({});
  const [globalError, setGlobal] = useState('');
  const [showSenha, setShowSenha]         = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading]    = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    const novo = name === 'cpf' ? mascaraCPF(value) : value;
    setForm(f => ({ ...f, [name]: novo }));
    setErrors(err => ({ ...err, [name]: '' }));
    setGlobal('');
  }

  function validate() {
    const errs = {};
    if (!form.nomeCompleto.trim()) errs.nomeCompleto = 'Nome obrigatório';

    if (!form.cpf) {
      errs.cpf = 'CPF obrigatório';
    } else if (!validarCPF(form.cpf)) {
      errs.cpf = 'CPF inválido';
    }

    if (!form.email) {
      errs.email = 'E-mail obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Formato de e-mail inválido';
    }

    if (!form.senha) {
      errs.senha = 'Senha obrigatória';
    } else if (form.senha.length < 8) {
      errs.senha = 'Mínimo de 8 caracteres';
    }

    if (!form.confirmarSenha) {
      errs.confirmarSenha = 'Confirme a senha';
    } else if (form.senha !== form.confirmarSenha) {
      errs.confirmarSenha = 'As senhas não coincidem';
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.post('/auth/cadastro', {
        nomeCompleto: form.nomeCompleto.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        email: form.email,
        senha: form.senha,
      });
      navigate('/login', { state: { success: 'Conta criada! Faça login para continuar.' } });
    } catch (err) {
      const msg = err.response?.data?.message ?? '';
      if (err.response?.status === 409) {
        if (msg.toLowerCase().includes('cpf')) {
          setGlobal('Este CPF já está cadastrado');
        } else {
          setGlobal('Este e-mail já está em uso');
        }
      } else {
        setGlobal('Erro ao criar conta. Tente novamente.');
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
    borderColor: 'var(--color-teal)',
    boxShadow: '0 0 0 3px rgba(2,73,89,0.15)',
  };

  function makeInputHandlers(name) {
    return {
      onFocus: e => Object.assign(e.target.style, inputFocus),
      onBlur:  e => {
        e.target.style.boxShadow = '';
        e.target.style.borderColor = errors[name] ? '#EF4444' : 'var(--color-sand)';
      },
    };
  }

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
          background: 'var(--color-ink)',
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
            É gratuito para sempre
          </p>
        </div>

        <DecoSVG />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={16} style={{ color: 'var(--color-teal)' }} />
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

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 600,
            color: 'var(--color-espresso)',
            marginBottom: 4,
          }}>
            Criar sua conta
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-walnut)',
            marginBottom: 32,
          }}>
            É gratuito para sempre
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
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Nome */}
            <Campo label="Nome completo" id="nomeCompleto" error={errors.nomeCompleto}>
              <input
                id="nomeCompleto"
                name="nomeCompleto"
                type="text"
                autoComplete="name"
                value={form.nomeCompleto}
                onChange={handleChange}
                placeholder="Seu nome completo"
                style={errors.nomeCompleto ? inputError : inputBase}
                {...makeInputHandlers('nomeCompleto')}
              />
            </Campo>

            {/* CPF */}
            <Campo label="CPF" id="cpf" error={errors.cpf}>
              <input
                id="cpf"
                name="cpf"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                maxLength={14}
                style={errors.cpf ? inputError : inputBase}
                {...makeInputHandlers('cpf')}
              />
            </Campo>

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
                {...makeInputHandlers('email')}
              />
            </Campo>

            {/* Senha */}
            <Campo label="Senha" id="senha" error={errors.senha}>
              <div style={{ position: 'relative' }}>
                <input
                  id="senha"
                  name="senha"
                  type={showSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  style={{ ...(errors.senha ? inputError : inputBase), paddingRight: 44 }}
                  {...makeInputHandlers('senha')}
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

            {/* Confirmar senha */}
            <Campo label="Confirmar senha" id="confirmarSenha" error={errors.confirmarSenha}>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={showConfirmar ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  style={{ ...(errors.confirmarSenha ? inputError : inputBase), paddingRight: 44 }}
                  {...makeInputHandlers('confirmarSenha')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(s => !s)}
                  tabIndex={-1}
                  aria-label={showConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
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
                  {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
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
                background: 'var(--color-teal)',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.01em',
                opacity: loading ? 0.65 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p style={{
            marginTop: 24,
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-walnut)',
          }}>
            Já tem conta?{' '}
            <Link
              to="/login"
              style={{
                fontWeight: 500,
                color: 'var(--color-teal)',
                textDecoration: 'underline',
              }}
            >
              Entrar
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
