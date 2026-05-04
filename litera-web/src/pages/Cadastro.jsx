import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import api from '../services/api';

/* ─── SVG decorativo (mesmo do Login) ───────────────────────────────── */
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
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    const novo = name === 'cpf' ? mascaraCPF(value) : value;
    setForm(f => ({ ...f, [name]: novo }));
    setErrors(err => ({ ...err, [name]: '' }));
    setGlobalError('');
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
      errs.senha = 'Senha deve ter no mínimo 8 caracteres';
    }

    if (!form.confirmarSenha) {
      errs.confirmarSenha = 'Confirmação de senha obrigatória';
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
          setGlobalError('Este CPF já está cadastrado');
        } else {
          setGlobalError('Este e-mail já está em uso');
        }
      } else {
        setGlobalError('Erro ao criar conta. Tente novamente.');
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
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color: '#024959' }} />
          <span className="font-body text-xs" style={{ color: '#8C5A3C' }}>
            É gratuito para sempre
          </span>
        </div>
      </div>

      {/* ── Metade direita (formulário) ── */}
      <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-md">

          <h1 className="font-display text-3xl font-semibold text-espresso mb-1">
            Criar sua conta
          </h1>
          <p className="font-body text-sm text-walnut mb-8">É gratuito para sempre</p>

          {/* Erro global */}
          {globalError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="font-body text-sm text-red-600">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Campo label="Nome completo" id="nomeCompleto" error={errors.nomeCompleto}>
              <input
                id="nomeCompleto"
                name="nomeCompleto"
                type="text"
                autoComplete="name"
                value={form.nomeCompleto}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className={`rounded-xl border px-4 py-3 font-body text-sm text-espresso bg-white outline-none transition focus:ring-2 focus:ring-teal/40 ${
                  errors.nomeCompleto ? 'border-red-400' : 'border-sand'
                }`}
              />
            </Campo>

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
                className={`rounded-xl border px-4 py-3 font-body text-sm text-espresso bg-white outline-none transition focus:ring-2 focus:ring-teal/40 ${
                  errors.cpf ? 'border-red-400' : 'border-sand'
                }`}
              />
            </Campo>

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
                  autoComplete="new-password"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
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

            <Campo label="Confirmar senha" id="confirmarSenha" error={errors.confirmarSenha}>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={showConfirmar ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 font-body text-sm text-espresso bg-white outline-none transition focus:ring-2 focus:ring-teal/40 ${
                    errors.confirmarSenha ? 'border-red-400' : 'border-sand'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-walnut hover:text-espresso transition"
                  tabIndex={-1}
                  aria-label={showConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Campo>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl py-3 font-body text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ background: '#024959' }}
            >
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-walnut">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium underline" style={{ color: '#024959' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
