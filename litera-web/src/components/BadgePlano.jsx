/**
 * BadgePlano — exibe o plano do usuário.
 * plano: 'Gratuito' | 'Pro' | 'Premium'
 */
export function BadgePlano({ plano = 'Gratuito' }) {
  const styles = {
    Gratuito: 'bg-sand text-walnut',
    Pro:      'bg-stone text-cream',
    Premium:  'bg-bark text-cream',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${styles[plano] || styles.Gratuito}`}>
      {plano}
    </span>
  );
}
