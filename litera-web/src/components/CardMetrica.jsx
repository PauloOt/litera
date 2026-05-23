/**
 * CardMetrica — número grande + rótulo, usado no dashboard.
 * icon: componente Lucide
 * valor: string | number
 * rotulo: string
 * corIcone: classe Tailwind de cor (ex: 'text-teal')
 */
export function CardMetrica({ icon: Icon, valor, rotulo, corIcone = 'text-stone' }) {
  return (
    <div className="bg-sand rounded-2xl p-5 flex flex-col gap-3">
      <div className={`${corIcone}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p className="font-display font-bold text-3xl text-espresso leading-none">
          {valor ?? '—'}
        </p>
        <p className="font-body font-light text-sm text-walnut mt-1">{rotulo}</p>
      </div>
    </div>
  );
}
