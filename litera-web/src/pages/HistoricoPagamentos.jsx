import { useEffect, useState } from 'react';
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import api from '../services/api';

function formatarDataHora(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatarPreco(v) {
  if (v == null) return '—';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function BadgeStatus({ status }) {
  const map = {
    PAGO:         { bg: 'bg-green-100', texto: 'text-green-700', label: 'Pago' },
    REEMBOLSADO:  { bg: 'bg-amber-100', texto: 'text-amber-700', label: 'Reembolsado' },
    FALHOU:       { bg: 'bg-red-100',   texto: 'text-red-600',   label: 'Falhou' },
  };
  const { bg, texto, label } = map[status] ?? { bg: 'bg-sand', texto: 'text-walnut', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${bg} ${texto}`}>
      {label}
    </span>
  );
}

function BadgeTipo({ tipo }) {
  const map = {
    ASSINATURA: { bg: 'bg-stone/15', texto: 'text-stone',  label: 'Assinatura' },
    INGRESSO:   { bg: 'bg-bark/10',  texto: 'text-bark',   label: 'Ingresso' },
  };
  const { bg, texto, label } = map[tipo] ?? { bg: 'bg-sand', texto: 'text-walnut', label: tipo };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-body font-medium ${bg} ${texto}`}>
      {label}
    </span>
  );
}

export default function HistoricoPagamentos() {
  const [itens, setItens] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarreg] = useState(true);

  useEffect(() => {
    let cancelado = false;
    api.get('/pagamentos/historico', { params: { pagina, tamanho: 20 } })
      .then(({ data }) => {
        if (cancelado) return;
        setItens(data.itens ?? []);
        setTotalPaginas(data.totalPaginas ?? 0);
      })
      .catch(() => { if (!cancelado) setItens([]); })
      .finally(() => { if (!cancelado) setCarreg(false); });
    return () => { cancelado = true; };
  }, [pagina]);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 ml-[72px] py-6 md:py-10 px-4 md:px-8 page-enter">
        <div className="max-w-5xl mx-auto w-full">

          <header className="mb-8 flex items-center gap-3">
            <Receipt size={24} className="text-bark" />
            <div>
              <h1 className="font-display font-semibold text-3xl text-espresso">Histórico de pagamentos</h1>
              <p className="font-body text-sm text-walnut">Todas as suas compras de ingresso e assinaturas</p>
            </div>
          </header>

          {carregando ? (
            <p className="font-body text-sm text-walnut">Carregando…</p>
          ) : itens.length === 0 ? (
            <div className="bg-sand rounded-2xl p-10 text-center">
              <Receipt size={32} className="text-walnut mx-auto mb-3 opacity-50" />
              <p className="font-body text-sm text-walnut">Você ainda não realizou nenhum pagamento.</p>
            </div>
          ) : (
            <>
              <div className="bg-sand rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cream">
                      <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Data</th>
                      <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Tipo</th>
                      <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Descrição</th>
                      <th className="text-right p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Valor</th>
                      <th className="text-left p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Cupom</th>
                      <th className="text-center p-4 font-body text-xs font-medium text-walnut uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-sand' : 'bg-cream/40'}>
                        <td className="p-4 font-body text-sm text-espresso whitespace-nowrap">{formatarDataHora(p.data)}</td>
                        <td className="p-4"><BadgeTipo tipo={p.tipo} /></td>
                        <td className="p-4 font-body text-sm text-espresso">{p.descricao || '—'}</td>
                        <td className="p-4 font-body text-sm text-espresso text-right whitespace-nowrap">
                          <div>{formatarPreco(p.valorLiquido)}</div>
                          {p.valorBruto && p.valorLiquido != null
                            && Number(p.valorBruto) !== Number(p.valorLiquido) && (
                            <div className="text-xs text-walnut line-through">{formatarPreco(p.valorBruto)}</div>
                          )}
                        </td>
                        <td className="p-4 font-body text-xs text-walnut">{p.cupomCodigo || '—'}</td>
                        <td className="p-4 text-center"><BadgeStatus status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    disabled={pagina <= 0}
                    onClick={() => setPagina(p => Math.max(0, p - 1))}
                    className="flex items-center gap-1 text-sm font-body text-bark disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span className="font-body text-sm text-walnut">
                    Página {pagina + 1} de {totalPaginas}
                  </span>
                  <button
                    disabled={pagina >= totalPaginas - 1}
                    onClick={() => setPagina(p => p + 1)}
                    className="flex items-center gap-1 text-sm font-body text-bark disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
