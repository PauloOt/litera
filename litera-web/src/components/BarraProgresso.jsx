/**
 * BarraProgresso — barra horizontal com label e percentual.
 * label: string
 * value: número atual
 * max: número máximo
 * cor: classe Tailwind para a barra (ex: 'bg-teal', 'bg-sky')
 */
export function BarraProgresso({ label, value = 0, max = 100, cor = 'bg-stone' }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-body text-espresso">{label}</span>
          <span className="text-xs font-body text-walnut">{percent}%</span>
        </div>
      )}
      <div className="w-full bg-sand rounded-full h-2">
        <div
          className={`${cor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
