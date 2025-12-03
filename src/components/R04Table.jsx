import React from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/helpers';

const R04Table = ({ results, onViewDetail }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                    <th className="px-6 py-3">Archivo / Radicación</th>
                    <th className="px-6 py-3 text-right">Declarado (T3)</th>
                    <th className="px-6 py-3 text-right">Calculado (T2)</th>
                    <th className="px-6 py-3 text-right">Diferencia</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                    <th className="px-6 py-3">Mensaje</th>
                    <th className="px-6 py-3 text-center">Ver</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {Object.entries(results).map(([filename, data]) => {
                    const r04 = data.resultado_r04 || {};
                    const meta = r04.meta || {};
                    return (
                        <tr key={filename} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{data.info_planilla?.num_radicacion}</div>
                                <div className="text-xs text-slate-500 truncate max-w-[200px]" title={filename}>{filename}</div>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {formatCurrency(meta.total_declarado_t3)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {formatCurrency(meta.sumatoria_calculada_t2)}
                            </td>
                            <td className={`px-6 py-4 text-right font-mono font-bold ${meta.diferencia !== 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                {formatCurrency(meta.diferencia)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge valid={r04.valido} />
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs max-w-xs">
                                {r04.mensaje}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => onViewDetail(data)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition-colors">
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default R04Table;
