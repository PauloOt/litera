import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pencil, X, Check, AlertTriangle,
  BookOpen, ChevronDown, ChevronUp, ImageOff, Crop,
} from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

/* ─── Ícones de redes sociais (SVG inline) ───────────────────────────── */
function IgIcon({ size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
function XIcon({ size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function GrIcon({ size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M19.525 15.977H4.475A.476.476 0 0 1 4 15.5V5.5c0-.262.213-.475.475-.475h15.05c.262 0 .475.213.475.475v10c0 .262-.213.477-.475.477zM12 17.572c-2.873 0-4.986-1.044-6.085-1.896H4.475A.476.476 0 0 0 4 16.152v.872c0 .262.213.476.475.476H7.09A8.073 8.073 0 0 0 12 19.226c1.796 0 3.455-.6 4.91-1.726h2.615c.262 0 .475-.214.475-.476v-.872a.476.476 0 0 0-.475-.476h-1.44c-1.1.852-3.212 1.896-6.085 1.896z" />
    </svg>
  );
}
import { Sidebar } from '../components/Sidebar';
import { BadgePlano } from '../components/BadgePlano';
import api from '../services/api';

/* ─── Utilitários ────────────────────────────────────────────────────── */
function iniciais(nome = '') {
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function formatarData(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Avatar ─────────────────────────────────────────────────────────── */
function Avatar({ nome, foto, tamanho = 80 }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={nome}
        style={{ width: tamanho, height: tamanho, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return (
    <div style={{
      width: tamanho, height: tamanho, borderRadius: '50%',
      backgroundColor: 'var(--color-bark)', color: 'var(--color-cream)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontSize: tamanho * 0.35,
      fontWeight: 700, userSelect: 'none', flexShrink: 0,
    }}>
      {iniciais(nome)}
    </div>
  );
}

/* ─── Circular Rating ─────────────────────────────────────────────────── */
function CircularRating({ label, valor, cor = '#22c55e' }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = Math.min(Math.max((valor / 10) * circ, 0), circ);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={r} fill="none"
            stroke={cor} strokeWidth="5"
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 17, color: 'var(--color-cream)',
          }}>
            {valor ?? '—'}
          </span>
        </div>
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,248,240,0.6)', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Badge de gênero ─────────────────────────────────────────────────── */
function GenreBadge({ texto, variante = 'dark' }) {
  const styles = variante === 'dark'
    ? { background: 'var(--color-espresso)', color: 'var(--color-cream)', border: '1px solid rgba(255,255,255,0.15)' }
    : { background: 'rgba(255,248,240,0.15)', color: 'var(--color-cream)', border: '1px solid rgba(255,248,240,0.2)' };
  return (
    <span style={{
      ...styles, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
      padding: '3px 10px', borderRadius: 20, flexShrink: 0,
    }}>
      {texto}
    </span>
  );
}

/* ─── Resenha expansível ──────────────────────────────────────────────── */
function ResenhaCard({ perfil, resenha }) {
  const [aberta, setAberta] = useState(false);
  if (!resenha?.texto) return null;
  const preview = resenha.texto.slice(0, 160);
  const longa = resenha.texto.length > 160;
  return (
    <div style={{
      background: 'rgba(255,248,240,0.06)', border: '1px solid rgba(255,248,240,0.12)',
      borderRadius: 14, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Avatar nome={perfil?.nomeCompleto ?? ''} foto={perfil?.foto} tamanho={28} />
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,248,240,0.5)', margin: 0 }}>
            {perfil?.nomeCompleto?.split(' ')[0] ?? 'Você'}
          </p>
          {resenha.titulo && (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontStyle: 'italic', color: 'var(--color-cream)', margin: 0 }}>
              "{resenha.titulo}"
            </p>
          )}
        </div>
      </div>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,248,240,0.75)',
        lineHeight: 1.6, margin: 0,
        display: '-webkit-box', WebkitLineClamp: aberta ? 'unset' : 4,
        WebkitBoxOrient: 'vertical', overflow: aberta ? 'visible' : 'hidden',
      }}>
        {aberta ? resenha.texto : preview}{longa && !aberta ? '…' : ''}
      </p>
      {longa && (
        <button
          onClick={() => setAberta(a => !a)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, marginTop: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-stone)',
          }}
        >
          {aberta ? <><ChevronUp size={14} /> Mostrar menos</> : <><ChevronDown size={14} /> Mostrar mais</>}
        </button>
      )}
    </div>
  );
}

/* ─── Painel do livro em destaque ─────────────────────────────────────── */
function PainelLivro({ livro, perfil, onEditar }) {
  if (!livro) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-sand)', borderRadius: 20,
        padding: 40, gap: 12, minHeight: 300,
      }}>
        <BookOpen size={36} style={{ color: 'var(--color-walnut)', opacity: 0.5 }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-walnut)', textAlign: 'center', margin: 0 }}>
          Nenhum livro em destaque.<br />Edite seu perfil para fixar um.
        </p>
        <button
          onClick={onEditar}
          style={{
            padding: '9px 20px', borderRadius: 10, border: '1px solid var(--color-walnut)',
            background: 'transparent', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-walnut)',
          }}
        >
          Fixar livro
        </button>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, background: 'var(--color-bark)', borderRadius: 20, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Título */}
      <div style={{
        background: 'var(--color-espresso)', padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--color-cream)', margin: 0,
        }}>
          {livro.titulo}
        </h2>
        {livro.autor && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,248,240,0.55)', margin: '2px 0 0' }}>
            {livro.autor}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Metadados */}
        <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Gêneros */}
          {(livro.generos?.length > 0 || livro.classificacaoEtaria) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(livro.generos ?? []).map(g => <GenreBadge key={g} texto={g} variante="dark" />)}
              {livro.classificacaoEtaria && <GenreBadge texto={livro.classificacaoEtaria} variante="light" />}
            </div>
          )}

          {/* Notas */}
          {(livro.notaGoodreads != null || livro.notaPessoal != null) && (
            <div style={{ display: 'flex', gap: 24 }}>
              {livro.notaGoodreads != null && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,248,240,0.5)', margin: 0 }}>
                    Nota Goodreads
                  </p>
                  <CircularRating valor={livro.notaGoodreads} cor="#22c55e" />
                </div>
              )}
              {livro.notaPessoal != null && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,248,240,0.5)', margin: 0 }}>
                    Nota Pessoal
                  </p>
                  <CircularRating valor={livro.notaPessoal} cor="#22c55e" />
                </div>
              )}
            </div>
          )}

          {/* Resenha */}
          <ResenhaCard perfil={perfil} resenha={livro.resenhaUsuario} />

          {/* Descrição */}
          {livro.descricao && (
            <div style={{
              background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '12px 16px',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'rgba(255,248,240,0.65)', lineHeight: 1.6, margin: 0,
              }}>
                {livro.descricao}
              </p>
            </div>
          )}
        </div>

        {/* Capa */}
        <div style={{
          width: 180, flexShrink: 0, background: 'rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {livro.capa
            ? <img src={livro.capa} alt={livro.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.3 }}>
                <ImageOff size={32} style={{ color: 'var(--color-cream)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-cream)' }}>Sem capa</span>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Modal cancelar assinatura ──────────────────────────────────────── */
function ModalCancelar({ onConfirmar, onFechar, carregando }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div style={{
        background: 'var(--color-cream)', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <AlertTriangle size={22} style={{ color: '#EF4444', flexShrink: 0 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-espresso)', margin: 0 }}>
            Cancelar assinatura?
          </h3>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-walnut)', marginBottom: 24, lineHeight: 1.6 }}>
          Você perderá os benefícios do seu plano ao final do período pago.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onFechar} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid var(--color-sand)',
            background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-walnut)',
          }}>
            Manter plano
          </button>
          <button onClick={onConfirmar} disabled={carregando} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #EF4444',
            background: 'transparent', cursor: carregando ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14, color: '#EF4444', opacity: carregando ? 0.65 : 1,
          }}>
            {carregando ? 'Cancelando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal de recorte de foto ────────────────────────────────────────── */
function ModalCrop({ srcImagem, onAplicar, onFechar }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const c = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
      width, height,
    );
    setCrop(c);
  }

  const aplicar = useCallback(() => {
    const img = imgRef.current;
    if (!img || !completedCrop?.width) return;

    const canvas = document.createElement('canvas');
    const scaleX = img.naturalWidth  / img.width;
    const scaleY = img.naturalHeight / img.height;
    const size = 256;
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width  * scaleX,
      completedCrop.height * scaleY,
      0, 0, size, size,
    );

    onAplicar(canvas.toDataURL('image/jpeg', 0.9));
  }, [completedCrop, onAplicar]);

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, padding: '20px 16px',
    }}>
      <div style={{
        background: 'var(--color-espresso)', borderRadius: 20, padding: 24,
        width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Crop size={16} style={{ color: 'var(--color-stone)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-cream)', margin: 0 }}>
              Recortar foto
            </h3>
          </div>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} style={{ color: 'rgba(255,248,240,0.5)' }} />
          </button>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,248,240,0.5)', margin: 0 }}>
          Arraste e redimensione para ajustar o recorte circular.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 12, overflow: 'hidden', maxHeight: 380 }}>
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            onComplete={c => setCompletedCrop(c)}
            aspect={1}
            circularCrop
            keepSelection
          >
            <img
              ref={imgRef}
              src={srcImagem}
              onLoad={onImageLoad}
              alt="recortar"
              style={{ maxHeight: 360, maxWidth: '100%', objectFit: 'contain' }}
            />
          </ReactCrop>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={aplicar}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
              background: 'var(--color-stone)', color: 'var(--color-cream)',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Aplicar recorte
          </button>
          <button
            onClick={onFechar}
            style={{
              padding: '11px 20px', borderRadius: 10,
              border: '1px solid rgba(255,248,240,0.2)', background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,248,240,0.6)', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal editar perfil ─────────────────────────────────────────────── */
function ModalEditar({ perfil, leituras, onSalvar, onFechar, salvando }) {
  const [form, setForm] = useState({
    nomeCompleto: perfil?.nomeCompleto ?? '',
    foto: perfil?.foto ?? '',
    bio: perfil?.bio ?? '',
    instagram: perfil?.conexoes?.instagram ?? '',
    x: perfil?.conexoes?.x ?? '',
    goodreads: perfil?.conexoes?.goodreads ?? '',
    livroDestaqueId: perfil?.livroDestaque?.id ?? '',
  });
  const [erro, setErro] = useState('');
  const [srcCrop, setSrcCrop] = useState(null);
  const fileInputRef = useRef(null);

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErro('');
  }

  function handleArquivo(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = ev => setSrcCrop(ev.target.result);
    reader.readAsDataURL(arquivo);
  }

  function handleCropAplicado(dataUrl) {
    setForm(f => ({ ...f, foto: dataUrl }));
    setSrcCrop(null);
  }

  function removerFoto() {
    setForm(f => ({ ...f, foto: '' }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.nomeCompleto.trim()) { setErro('Nome obrigatório'); return; }
    onSalvar(form);
  }

  const inputSt = {
    width: '100%', border: '1px solid var(--color-sand)', borderRadius: 10,
    padding: '9px 13px', fontFamily: 'var(--font-body)', fontSize: 14,
    color: 'var(--color-espresso)', background: '#fff', outline: 'none', boxSizing: 'border-box',
  };

  const labelSt = { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--color-walnut)', marginBottom: 4, display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
      padding: '20px 16px',
    }}>
      <div style={{
        background: 'var(--color-cream)', borderRadius: 20, padding: 28,
        width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--color-espresso)', margin: 0 }}>
            Editar perfil
          </h3>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} style={{ color: 'var(--color-walnut)' }} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelSt}>Nome completo</label>
            <input name="nomeCompleto" value={form.nomeCompleto} onChange={handle} style={inputSt} />
          </div>

          {/* Foto de perfil */}
          <div>
            <label style={labelSt}>Foto de perfil</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Preview */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: 'var(--color-sand)', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--color-sand)',
              }}>
                {form.foto
                  ? <img src={form.foto} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-walnut)' }}>
                      {iniciais(form.nomeCompleto)}
                    </span>
                }
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {/* Botão escolher arquivo */}
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid var(--color-bark)', background: 'transparent',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                  color: 'var(--color-bark)', width: 'fit-content',
                }}>
                  <Pencil size={13} />
                  Escolher foto
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleArquivo}
                    style={{ display: 'none' }}
                  />
                </label>

                {form.foto && (
                  <button
                    type="button"
                    onClick={removerFoto}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: 12, color: '#EF4444',
                      padding: 0,
                    }}
                  >
                    <X size={12} /> Remover foto
                  </button>
                )}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-walnut)', margin: 0 }}>
                  JPG, PNG ou GIF · máx. 5 MB
                </p>
              </div>
            </div>
          </div>
          <div>
            <label style={labelSt}>Bio (opcional)</label>
            <textarea
              name="bio" value={form.bio} onChange={handle}
              placeholder='ex: "Leitora voraz e eterna otimista"'
              rows={2}
              style={{ ...inputSt, resize: 'vertical' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--color-sand)', paddingTop: 14 }}>
            <p style={{ ...labelSt, marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--color-walnut)' }}>
              Conexões
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IgIcon size={16} style={{ color: 'var(--color-walnut)', flexShrink: 0 }} />
                <input name="instagram" value={form.instagram} onChange={handle} placeholder="@usuario" style={{ ...inputSt }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <XIcon size={16} style={{ color: 'var(--color-walnut)', flexShrink: 0 }} />
                <input name="x" value={form.x} onChange={handle} placeholder="@usuario" style={{ ...inputSt }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GrIcon size={16} style={{ color: 'var(--color-walnut)', flexShrink: 0 }} />
                <input name="goodreads" value={form.goodreads} onChange={handle} placeholder="perfil Goodreads" style={{ ...inputSt }} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-sand)', paddingTop: 14 }}>
            <label style={labelSt}>Livro em destaque</label>
            <select name="livroDestaqueId" value={form.livroDestaqueId} onChange={handle} style={{ ...inputSt }}>
              <option value="">— Nenhum —</option>
              {leituras.map(l => (
                <option key={l.livroId ?? l.id} value={l.livroId ?? l.id}>
                  {l.tituloLivro ?? l.titulo}
                </option>
              ))}
            </select>
          </div>

          {erro && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#EF4444' }}>{erro}</p>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="submit" disabled={salvando} style={{
              flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
              background: 'var(--color-bark)', color: 'var(--color-cream)',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.65 : 1,
            }}>
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>
            <button type="button" onClick={onFechar} style={{
              padding: '11px 20px', borderRadius: 10, border: '1px solid var(--color-sand)',
              background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-walnut)',
            }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {srcCrop && (
        <ModalCrop
          srcImagem={srcCrop}
          onAplicar={handleCropAplicado}
          onFechar={() => setSrcCrop(null)}
        />
      )}
    </div>
  );
}

/* ─── Ícone de conexão ────────────────────────────────────────────────── */
function ConexaoItem({ Icone, label }) {
  if (!label) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: 'rgba(255,248,240,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: 'rgba(255,248,240,0.7)',
      }}>
        <Icone size={16} />
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,248,240,0.7)' }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Perfil() {
  const [perfil,    setPerfil]    = useState(null);
  const [leituras,  setLeituras]  = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [modalEditar, setModalEditar]   = useState(false);
  const [salvando,    setSalvando]      = useState(false);
  const [feedbackSalvo, setFeedbackSalvo] = useState(false);

  const [modalCancelar, setModalCancelar] = useState(false);
  const [cancelando,    setCancelando]    = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const [rPerfil, rLeituras] = await Promise.allSettled([
          api.get('/perfil'),
          api.get('/leituras'),
        ]);
        if (rPerfil.status === 'fulfilled') setPerfil(rPerfil.value.data);
        if (rLeituras.status === 'fulfilled') setLeituras(rLeituras.value.data ?? []);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function handleSalvar(form) {
    setSalvando(true);
    try {
      const payload = {
        nomeCompleto: form.nomeCompleto,
        foto: form.foto || null,
        bio: form.bio || null,
        conexoes: {
          instagram: form.instagram || null,
          x: form.x || null,
          goodreads: form.goodreads || null,
        },
        livroDestaqueId: form.livroDestaqueId ? Number(form.livroDestaqueId) : null,
      };
      const { data } = await api.put('/perfil', payload);
      setPerfil(p => ({ ...p, ...data }));
      setModalEditar(false);
      setFeedbackSalvo(true);
      setTimeout(() => setFeedbackSalvo(false), 3000);
    } catch {
      /* erro é tratado no modal via throw — por ora mantém modal aberto */
    } finally {
      setSalvando(false);
    }
  }

  async function handleCancelarAssinatura() {
    setCancelando(true);
    try {
      await api.post('/pagamentos/cancelar');
      setPerfil(p => ({ ...p, plano: 'Gratuito' }));
      setModalCancelar(false);
    } catch { /* silencia */ } finally {
      setCancelando(false);
    }
  }

  const plano = perfil?.plano ?? 'Gratuito';
  const temAssinatura = plano !== 'Gratuito';
  const conexoes = perfil?.conexoes ?? {};

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 ml-[72px] flex items-center justify-center">
          <p className="font-body text-walnut animate-pulse">Carregando perfil…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 px-4 md:px-6 page-enter">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* ── Card de perfil (esquerda) ── */}
          <aside style={{
            width: 270, flexShrink: 0, background: 'var(--color-espresso)',
            borderRadius: 20, padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: 0,
          }}>
            {/* Avatar + nome */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <Avatar nome={perfil?.nomeCompleto ?? ''} foto={perfil?.foto} tamanho={80} />
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 600, color: 'var(--color-cream)', margin: 0 }}>
                {perfil?.nomeCompleto ?? '—'}
              </p>
              <div style={{ marginTop: 6 }}>
                <BadgePlano plano={plano} />
              </div>
            </div>

            {/* Botão editar */}
            <button
              onClick={() => setModalEditar(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '8px 0', borderRadius: 10,
                border: '1px solid rgba(255,248,240,0.2)', background: 'transparent',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'rgba(255,248,240,0.7)', marginBottom: 20,
              }}
            >
              <Pencil size={13} />
              Editar perfil
            </button>

            {/* Bio */}
            {perfil?.bio && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(255,248,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Bio
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,248,240,0.65)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                  "{perfil.bio}"
                </p>
              </div>
            )}

            {/* Membro desde */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(255,248,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Membro desde
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,248,240,0.65)', margin: 0 }}>
                {formatarData(perfil?.criadoEm)}
              </p>
            </div>

            {/* Conexões */}
            {(conexoes.instagram || conexoes.x || conexoes.goodreads) && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(255,248,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Conexões
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ConexaoItem Icone={IgIcon}   label={conexoes.instagram} />
                  <ConexaoItem Icone={XIcon}    label={conexoes.x} />
                  <ConexaoItem Icone={GrIcon}   label={conexoes.goodreads} />
                </div>
              </div>
            )}

            {/* Assinatura */}
            <div style={{ borderTop: '1px solid rgba(255,248,240,0.1)', paddingTop: 16, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {temAssinatura ? (
                <>
                  <Link to="/planos">
                    <button style={{
                      width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
                      background: 'var(--color-stone)', color: 'var(--color-cream)',
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}>
                      Alterar plano
                    </button>
                  </Link>
                  <button onClick={() => setModalCancelar(true)} style={{
                    width: '100%', padding: '9px 0', borderRadius: 10,
                    border: '1px solid rgba(239,68,68,0.5)', background: 'transparent',
                    fontFamily: 'var(--font-body)', fontSize: 13, color: '#EF4444', cursor: 'pointer',
                  }}>
                    Cancelar assinatura
                  </button>
                </>
              ) : (
                <Link to="/planos">
                  <button style={{
                    width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
                    background: 'var(--color-stone)', color: 'var(--color-cream)',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}>
                    Fazer upgrade
                  </button>
                </Link>
              )}
            </div>

            {/* Feedback salvo */}
            {feedbackSalvo && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
                padding: '8px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
              }}>
                <Check size={13} style={{ color: '#22c55e' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#86efac' }}>
                  Perfil atualizado!
                </span>
              </div>
            )}
          </aside>

          {/* ── Painel do livro em destaque (direita) ── */}
          <PainelLivro
            livro={perfil?.livroDestaque ?? null}
            perfil={perfil}
            onEditar={() => setModalEditar(true)}
          />
        </div>
      </main>

      {modalEditar && (
        <ModalEditar
          perfil={perfil}
          leituras={leituras}
          onSalvar={handleSalvar}
          onFechar={() => setModalEditar(false)}
          salvando={salvando}
        />
      )}

      {modalCancelar && (
        <ModalCancelar
          onConfirmar={handleCancelarAssinatura}
          onFechar={() => setModalCancelar(false)}
          carregando={cancelando}
        />
      )}
    </div>
  );
}
