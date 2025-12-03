import React from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/helpers';

const LogTable = ({ results, onViewDetail }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                    <th className="px-6 py-3">Archivo / Radicación</th>
                    <th className="px-6 py-3">ID Log / Banco</th>
                    <th className="px-6 py-3 text-right">Valor Log</th>
                    <th className="px-6 py-3 text-right">Valor PILA</th>
                    <th className="px-6 py-3 text-right">Diferencia</th>
                    <th className="px-6 py-3 text-center">Cruce Log</th>
                    <th className="px-6 py-3 text-center">Planilla Asoc.</th>
                    <th className="px-6 py-3 text-center">Ver</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {Object.entries(results).map(([filename, data]) => {
                    const logMatch = data.match_log || {};
                    const meta = logMatch.meta || {};
                    return (
                        <tr key={filename} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{data.info_planilla?.num_radicacion}</div>
                                <div className="text-xs text-slate-500 truncate max-w-[200px]">{filename}</div>
                            </td>
                            <td className="px-6 py-4">
                                {logMatch.valido ? (
                                    <>
                                        <div className="font-mono text-slate-700">{meta.id_log}</div>
                                        <div className="text-xs text-slate-500">Banco: {meta.registro_log_completo?.BANCO}</div>
                                    </>
                                ) : (
                                    <span className="text-red-500 text-xs font-medium">No encontrado</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {formatCurrency(meta.valor_log)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {formatCurrency(meta.valor_pila)}
                            </td>
                            <td className={`px-6 py-4 text-right font-mono font-bold ${meta.diferencia !== 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                {formatCurrency(meta.diferencia)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge valid={logMatch.valido} text={logMatch.valido ? 'Match' : 'Sin Match'} />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <StatusBadge
                                        valid={data.planilla_asociada_encontrada?.valido}
                                        text={data.planilla_asociada_encontrada?.valido ? 'Encontrada' : 'No Encontrada'}
                                    />
                                    {data.planilla_asociada_encontrada?.meta?.num_planilla_asociada && (
                                        <span className="text-[10px] font-mono text-slate-500">
                                            Ref: {data.planilla_asociada_encontrada.meta.num_planilla_asociada}
                                        </span>
                                    )}
                                </div>
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

export default LogTable;
