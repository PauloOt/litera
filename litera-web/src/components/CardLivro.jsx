import { BookOpen } from 'lucide-react';
import { BadgeStatus } from './BadgeStatus';

/**
 * CardLivro — variantes: 'vertical' | 'horizontal' | 'compacto'
 *
 * Props comuns:
 *   titulo, autor, capa (URL), badge (variante BadgeStatus), badgeTexto
 *
 * Variante vertical:   preco, condicao, vendedor, botao (node)
 * Variante horizontal: ondePegou, prazo, statusVariant, botao (node)
 * Variante compacto:   sem extras
 */
export function CardLivro({ variante = 'vertical', titulo, autor, capa, badge, badgeTexto, ...props }) {
  if (variante === 'compacto') {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-8 h-8 bg-sand rounded flex items-center justify-center shrink-0">
          <BookOpen size={14} className="text-walnut" />
        </div>
        <div className="min-w-0">
          <p className="font-body text-sm text-espresso truncate">{titulo}</p>
          {autor && <p className="font-body text-xs text-walnut truncate">{autor}</p>}
        </div>
      </div>
    );
  }

  if (variante === 'horizontal') {
    const { ondePegou, prazo, statusVariant = 'no-prazo', botao } = props;
    return (
      <div className="flex gap-4 bg-sand rounded-2xl p-4 hover:brightness-95 transition-all">
        {/* Capa 64x64 */}
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-cream flex items-center justify-center">
          {capa
            ? <img src={capa} alt={titulo} className="w-full h-full object-cover" />
            : <BookOpen size={20} className="text-walnut" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-body font-medium text-espresso truncate">{titulo}</p>
          {autor && <p className="font-body text-sm text-walnut truncate">{autor}</p>}
          {ondePegou && <p className="font-body text-xs text-walnut mt-0.5">{ondePegou}</p>}
          {prazo && <p className="font-body text-xs text-walnut">Prazo: {prazo}</p>}
          {badge && (
            <div className="mt-1">
              <BadgeStatus variant={statusVariant}>{badgeTexto}</BadgeStatus>
            </div>
          )}
        </div>

        {botao && <div className="shrink-0 self-center">{botao}</div>}
      </div>
    );
  }

  /* variante === 'vertical' (padrão) */
  const { preco, condicao, vendedor, botao } = props;
  return (
    <div className="bg-sand rounded-2xl overflow-hidden hover:shadow-md hover:brightness-95 transition-all relative">
      {/* Capa 3:4 */}
      <div className="w-full aspect-[3/4] bg-cream flex items-center justify-center overflow-hidden">
        {capa
          ? <img src={capa} alt={titulo} className="w-full h-full object-cover" />
          : <BookOpen size={32} className="text-walnut" />
        }
      </div>

      <div className="p-3">
        <p className="font-body font-medium text-espresso line-clamp-2 text-sm leading-snug">{titulo}</p>
        {autor && <p className="font-body text-xs text-walnut mt-0.5 truncate">{autor}</p>}

        {preco && (
          <p className="font-body font-medium text-stone text-sm mt-1">
            {preco}
            {condicao && (
              <span className="ml-1 bg-sand text-bark text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                {condicao}
              </span>
            )}
          </p>
        )}
        {vendedor && <p className="font-body font-light text-xs text-walnut">{vendedor}</p>}

        {botao && <div className="mt-2">{botao}</div>}
      </div>
    </div>
  );
}
