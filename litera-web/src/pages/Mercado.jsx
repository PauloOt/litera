import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, BookMarked, BookX, ExternalLink, Star, ShoppingCart } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { CardLivro } from '../components/CardLivro';
import api from '../services/api';

/* ─── Abas ───────────────────────────────────────────────────────────── */
const ABAS = ['Resultados', 'Favoritos', 'Lista de Desejos'];

/* ─── Skeleton card ──────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-sand rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full aspect-[3/4] bg-stone/20" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-stone/20 rounded w-3/4" />
        <div className="h-3 bg-stone/20 rounded w-1/2" />
        <div className="h-3 bg-stone/20 rounded w-1/3" />
      </div>
    </div>
  );
}

/* ─── Botões de ação do card ─────────────────────────────────────────── */
function BotoesAcao({ livro, favoritados, desejos, onToggleFav, onToggleDesejo }) {
  const isFav = favoritados.has(livro.id);
  const isDesejo = desejos.has(livro.id);

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1">
      <button
        onClick={e => { e.stopPropagation(); onToggleFav(livro); }}
        className={`w-7 h-7 rounded-full flex items-center justify-center shadow transition-colors ${
          isFav ? 'bg-red-500 text-white' : 'bg-cream/90 text-walnut hover:text-red-500'
        }`}
        title="Favoritar"
      >
        <Heart size={14} className={isFav ? 'fill-white' : ''} />
      </button>
      <button
        onClick={e => { e.stopPropagation(); onToggleDesejo(livro); }}
        className={`w-7 h-7 rounded-full flex items-center justify-center shadow transition-colors ${
          isDesejo ? 'bg-stone text-white' : 'bg-cream/90 text-walnut hover:text-stone'
        }`}
        title="Lista de desejos"
      >
        <BookMarked size={14} />
      </button>
    </div>
  );
}

/* ─── Badge de nota Google Books ─────────────────────────────────────── */
function NotaBadge({ nota }) {
  if (nota == null) return null;
  return (
    <div className="absolute top-2 left-2 flex items-center gap-1 bg-espresso/90 text-cream text-xs font-body font-medium px-2 py-0.5 rounded-full">
      <Star size={10} className="text-stone fill-stone" />
      {nota.toFixed(1)}
    </div>
  );
}

/* ─── Grid de livros ─────────────────────────────────────────────────── */
function GridLivros({ livros, favoritados, desejos, onToggleFav, onToggleDesejo, modoRemover, onRemover, onClickLivro }) {
  if (livros.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {livros.map(l => (
        <div key={l.id} className="relative cursor-pointer" onClick={() => onClickLivro(l.id)}>
          <NotaBadge nota={l.nota ?? l.notaGoogle} />
          <BotoesAcao
            livro={l}
            favoritados={favoritados}
            desejos={desejos}
            onToggleFav={onToggleFav}
            onToggleDesejo={onToggleDesejo}
          />
          <CardLivro
            variante="vertical"
            titulo={l.titulo}
            autor={l.autor}
            capa={l.capa}
            preco={l.preco}
            condicao={l.condicao}
            vendedor={l.vendedor}
            botao={
              modoRemover ? (
                <button
                  onClick={() => onRemover(l)}
                  className="w-full font-body text-xs text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remover
                </button>
              ) : (
                <div className="flex gap-1.5">
                  {l.link && (
                    <a
                      href={l.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 flex-1 font-body text-xs text-cream bg-bark px-2 py-1.5 rounded-lg hover:brightness-90 transition-all"
                    >
                      <ExternalLink size={11} />
                      Google Books
                    </a>
                  )}
                  <a
                    href={`https://www.amazon.com.br/s?k=${encodeURIComponent((l.titulo || '') + ' ' + (l.autor || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 flex-1 font-body text-xs text-espresso bg-sand border border-stone/30 px-2 py-1.5 rounded-lg hover:bg-stone/20 transition-all"
                  >
                    <ShoppingCart size={11} />
                    Amazon
                  </a>
                </div>
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function Mercado() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('Resultados');
  const [resultados, setResultados] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [desejos, setDesejos] = useState([]);
  const [favoritados, setFavoritados] = useState(new Set());
  const [desejados, setDesejados] = useState(new Set());
  const [buscando, setBuscando] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);
  const [ultimaBusca, setUltimaBusca] = useState('');

  async function carregarFavoritos() {
    try {
      const res = await api.get('/ml/favoritos');
      setFavoritos(res.data);
      setFavoritados(new Set(res.data.map(l => l.id)));
    } catch { /* mantém vazio */ }
  }

  async function carregarDesejos() {
    try {
      const res = await api.get('/ml/desejos');
      setDesejos(res.data);
      setDesejados(new Set(res.data.map(l => l.id)));
    } catch { /* mantém vazio */ }
  }

  useEffect(() => {
    carregarFavoritos();
    carregarDesejos();
  }, []);

  async function handleBuscar() {
    if (!busca.trim()) return;
    setBuscando(true);
    setBuscaFeita(true);
    setUltimaBusca(busca.trim());
    try {
      const res = await api.get('/livros/busca', { params: { titulo: busca.trim() } });
      setResultados(res.data);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleBuscar();
  }

  async function toggleFavorito(livro) {
    const jaFav = favoritados.has(livro.id);
    try {
      if (jaFav) {
        await api.delete(`/ml/favoritos/${livro.id}`);
        setFavoritados(prev => { const s = new Set(prev); s.delete(livro.id); return s; });
        setFavoritos(prev => prev.filter(l => l.id !== livro.id));
      } else {
        await api.post(`/ml/favoritos/${livro.id}`, livro);
        setFavoritados(prev => new Set([...prev, livro.id]));
        setFavoritos(prev => [...prev, livro]);
      }
    } catch { /* silencia */ }
  }

  async function toggleDesejo(livro) {
    const jaDesejo = desejados.has(livro.id);
    try {
      if (jaDesejo) {
        await api.delete(`/ml/desejos/${livro.id}`);
        setDesejados(prev => { const s = new Set(prev); s.delete(livro.id); return s; });
        setDesejos(prev => prev.filter(l => l.id !== livro.id));
      } else {
        await api.post(`/ml/desejos/${livro.id}`, livro);
        setDesejados(prev => new Set([...prev, livro.id]));
        setDesejos(prev => [...prev, livro]);
      }
    } catch { /* silencia */ }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-8 px-4 md:px-8 page-enter">
        <div className="max-w-5xl mx-auto w-full">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-espresso">Livros</h1>
          <p className="font-body text-sm text-walnut mt-1">
            Busque livros com notas e informações do Google Books
          </p>
        </div>

        {/* Barra de busca */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-sand border border-sand rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-stone transition-all">
            <Search size={18} className="text-walnut shrink-0" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Busque por título, autor ou ISBN..."
              className="flex-1 bg-transparent font-body text-sm text-espresso placeholder-walnut focus:outline-none"
            />
          </div>
          <button
            onClick={handleBuscar}
            disabled={buscando}
            className="font-body text-sm text-cream bg-bark px-5 py-2.5 rounded-xl hover:brightness-90 transition-all disabled:opacity-60"
          >
            {buscando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-1 bg-sand rounded-xl p-1 mb-6 w-fit">
          {ABAS.map(aba => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`font-body text-sm px-4 py-2 rounded-lg transition-all ${
                abaAtiva === aba
                  ? 'bg-cream text-espresso font-medium shadow-sm'
                  : 'text-walnut hover:text-espresso'
              }`}
            >
              {aba}
              {aba === 'Favoritos' && favoritos.length > 0 && (
                <span className="ml-1.5 bg-stone/20 text-stone text-xs px-1.5 py-0.5 rounded-full">
                  {favoritos.length}
                </span>
              )}
              {aba === 'Lista de Desejos' && desejos.length > 0 && (
                <span className="ml-1.5 bg-stone/20 text-stone text-xs px-1.5 py-0.5 rounded-full">
                  {desejos.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo das abas */}

        {abaAtiva === 'Resultados' && (
          <>
            {/* Estado inicial */}
            {!buscaFeita && !buscando && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-walnut">
                <Search size={40} className="text-sand" />
                <p className="font-body text-sm">Digite o título de um livro para começar</p>
              </div>
            )}

            {/* Loading */}
            {buscando && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Sem resultados */}
            {buscaFeita && !buscando && resultados.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-walnut">
                <BookX size={40} className="text-sand" />
                <p className="font-body text-sm">Nenhum livro encontrado para "{ultimaBusca}"</p>
              </div>
            )}

            {/* Grid de resultados */}
            {!buscando && resultados.length > 0 && (
              <GridLivros
                livros={resultados}
                favoritados={favoritados}
                desejos={desejados}
                onToggleFav={toggleFavorito}
                onToggleDesejo={toggleDesejo}
                modoRemover={false}
                onClickLivro={id => navigate(`/livros/${id}`)}
              />
            )}
          </>
        )}

        {abaAtiva === 'Favoritos' && (
          <>
            {favoritos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-walnut">
                <Heart size={40} className="text-sand" />
                <p className="font-body text-sm">Você ainda não tem livros favoritos.</p>
              </div>
            ) : (
              <GridLivros
                livros={favoritos}
                favoritados={favoritados}
                desejos={desejados}
                onToggleFav={toggleFavorito}
                onToggleDesejo={toggleDesejo}
                modoRemover
                onRemover={toggleFavorito}
                onClickLivro={id => navigate(`/livros/${id}`)}
              />
            )}
          </>
        )}

        {abaAtiva === 'Lista de Desejos' && (
          <>
            {desejos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-walnut">
                <BookMarked size={40} className="text-sand" />
                <p className="font-body text-sm">Sua lista de desejos está vazia.</p>
              </div>
            ) : (
              <GridLivros
                livros={desejos}
                favoritados={favoritados}
                desejos={desejados}
                onToggleFav={toggleFavorito}
                onToggleDesejo={toggleDesejo}
                modoRemover
                onRemover={toggleDesejo}
                onClickLivro={id => navigate(`/livros/${id}`)}
              />
            )}
          </>
        )}
        </div>
      </main>
    </div>
  );
}
