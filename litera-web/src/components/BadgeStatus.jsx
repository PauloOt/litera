/**
 * BadgeStatus — indica prazo de devolução.
 * variant: 'no-prazo' | 'atencao' | 'vencido'
 */
export function BadgeStatus({ variant = 'no-prazo', children }) {
  const styles = {
    'no-prazo': 'bg-green-100 text-green-800',
    'atencao':  'bg-yellow-100 text-yellow-700',
    'vencido':  'bg-red-100 text-red-700',
  };

  const labels = {
    'no-prazo': children || 'No prazo',
    'atencao':  children || 'Atenção',
    'vencido':  children || 'Vencido',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium ${styles[variant]}`}>
      {labels[variant]}
    </span>
  );
}
