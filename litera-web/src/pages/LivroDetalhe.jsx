import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, BookOpen, ExternalLink, ShoppingCart,
  Heart, BookMarked, Calendar, Building2, FileText, Hash
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import api from '../services/api';

function BadgeGenero({ children }) {
  return (
    <span className="font-body text-xs bg-stone/15 text-stone px-2.5 py-1 rounded-full">
      {children}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon size={15} className="text-walnut mt-0.5 shrink-0" />
      <div>
        <p className="font-body text-xs text-walnut">{label}</p>
        <p className="font-body text-sm text-espresso">{value}</p>
      </div>
    </div>
  );
}

export default function LivroDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [livro, setLivro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [isDesejo, setIsDesejo] = useState(false);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const [resLivro, resFav, resDesejo] = await Promise.all([
          api.get(`/livros/${id}`),
          api.get('/ml/favoritos'),
          api.get('/ml/desejos'),
        ]);
        setLivro(resLivro.data);
        setIsFav(resFav.data.some(l => l.id === id));
        setIsDesejo(resDesejo.data.some(l => l.id === id));
      } catch {
        // mantém vazio
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id]);

  async function toggleFav() {
    if (!livro) return;
    try {
      if (isFav) {
        await api.delete(`/ml/favoritos/${id}`);
        setIsFav(false);
      } else {
        await api.post(`/ml/favoritos/${id}`, livroParaBody(livro));
        setIsFav(true);
      }
    } catch { /* silencia */ }
  }

  async function toggleDesejo() {
    if (!livro) return;
    try {
      if (isDesejo) {
        await api.delete(`/ml/desejos/${id}`);
        setIsDesejo(false);
      } else {
        await api.post(`/ml/desejos/${id}`, livroParaBody(livro));
        setIsDesejo(true);
      }
    } catch { /* silencia */ }
  }

  function livroParaBody(l) {
    return { titulo: l.titulo, autor: l.autor, capa: l.capa, link: l.link };
  }

  function formatarData(data) {
    if (!data) return null;
    // "2001-09-01" ou "2001" → formata
    const partes = data.split('-');
    if (partes.length === 3) {
      return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    return partes[0]; // só o ano
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 ml-[72px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-walnut">
            <BookOpen size={40} className="animate-pulse text-sand" />
            <p className="font-body text-sm">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!livro) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 ml-[72px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-walnut">
            <BookOpen size={40} className="text-sand" />
            <p className="font-body text-sm">Livro não encontrado.</p>
            <button onClick={() => navigate(-1)} className="font-body text-sm text-bark underline">
              Voltar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-8 px-4 md:px-8 page-enter">
        <div className="max-w-4xl mx-auto w-full">

          {/* Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 font-body text-sm text-walnut hover:text-espresso mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          <div className="flex flex-col md:flex-row gap-8">

            {/* Capa + ações */}
            <div className="flex flex-col items-center gap-4 md:w-56 shrink-0">
              <div className="w-44 md:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-sand flex items-center justify-center">
                {livro.capa
                  ? <img src={livro.capa} alt={livro.titulo} className="w-full h-full object-cover" />
                  : <BookOpen size={40} className="text-walnut" />
                }
              </div>

              {/* Nota */}
              {livro.nota != null && (
                <div className="flex items-center gap-1.5 bg-espresso text-cream px-3 py-1.5 rounded-full">
                  <Star size={14} className="fill-stone text-stone" />
                  <span className="font-body font-medium text-sm">{livro.nota.toFixed(1)}</span>
                  {livro.totalAvaliacoes && (
                    <span className="font-body text-xs text-cream/70">({livro.totalAvaliacoes})</span>
                  )}
                </div>
              )}

              {/* Botões favorito/desejo */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={toggleFav}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-body text-sm transition-colors ${
                    isFav ? 'bg-red-500 text-white' : 'bg-sand text-walnut hover:text-red-500 border border-sand'
                  }`}
                >
                  <Heart size={15} className={isFav ? 'fill-white' : ''} />
                  {isFav ? 'Favoritado' : 'Favoritar'}
                </button>
                <button
                  onClick={toggleDesejo}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-body text-sm transition-colors ${
                    isDesejo ? 'bg-stone text-white' : 'bg-sand text-walnut hover:text-stone border border-sand'
                  }`}
                >
                  <BookMarked size={15} />
                  {isDesejo ? 'Na lista' : 'Desejos'}
                </button>
              </div>

              {/* Links de compra */}
              <div className="flex flex-col gap-2 w-full">
                {livro.link && (
                  <a
                    href={livro.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full font-body text-sm text-cream bg-bark py-2.5 rounded-xl hover:brightness-90 transition-all"
                  >
                    <ExternalLink size={14} />
                    Ver no Google Books
                  </a>
                )}
                <a
                  href={`https://www.amazon.com.br/s?k=${encodeURIComponent((livro.titulo || '') + ' ' + (livro.autor || ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full font-body text-sm text-espresso bg-sand border border-stone/30 py-2.5 rounded-xl hover:bg-stone/20 transition-all"
                >
                  <ShoppingCart size={14} />
                  Buscar na Amazon
                </a>
              </div>
            </div>

            {/* Info do livro */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-3xl text-espresso leading-tight">{livro.titulo}</h1>
              {livro.autor && (
                <p className="font-body text-lg text-walnut mt-1">{livro.autor}</p>
              )}

              {/* Gêneros */}
              {livro.generos?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {livro.generos.map(g => <BadgeGenero key={g}>{g}</BadgeGenero>)}
                </div>
              )}

              {/* Metadados */}
              <div className="grid grid-cols-2 gap-3 mt-6 p-4 bg-sand rounded-2xl">
                <InfoItem icon={Calendar} label="Publicação" value={formatarData(livro.dataPublicacao)} />
                <InfoItem icon={Building2} label="Editora" value={livro.editora} />
                <InfoItem icon={FileText} label="Páginas" value={livro.paginas ? `${livro.paginas} páginas` : null} />
                <InfoItem icon={Hash} label="ISBN" value={livro.isbn} />
              </div>

              {/* Sinopse */}
              {livro.descricao && (
                <div className="mt-6">
                  <h2 className="font-display font-semibold text-lg text-espresso mb-2">Sinopse</h2>
                  <p className="font-body text-sm text-walnut leading-relaxed whitespace-pre-line">
                    {livro.descricao}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
