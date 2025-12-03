import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/helpers';
import Pagination from './Pagination';

const LogTable = ({ results, onViewDetail }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const entries = Object.entries(results);
    const totalItems = entries.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const currentEntries = entries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2">Archivo / Radicación</th>
                            <th className="px-4 py-2">ID Log / Banco</th>
                            <th className="px-4 py-2 text-center">Extracto</th>
                            <th className="px-4 py-2 text-right">Valor Log</th>
                            <th className="px-4 py-2 text-right">Valor PILA</th>
                            <th className="px-4 py-2 text-right">Diferencia</th>
                            <th className="px-4 py-2 text-center">Cruce Log</th>
                            <th className="px-4 py-2 text-center">Planilla Asoc.</th>
                            <th className="px-4 py-2 text-center">Ver</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentEntries.map(([filename, data]) => {
                            const logMatch = data.match_log || {};
                            const meta = logMatch.meta || {};
                            return (
                                <tr key={filename} className="hover:bg-slate-50">
                                    <td className="px-4 py-2">
                                        <div className="font-medium text-slate-900">{data.info_planilla?.num_radicacion}</div>
                                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{filename}</div>
                                    </td>
                                    <td className="px-4 py-2">
                                        {logMatch.valido ? (
                                            <>
                                                <div className="font-mono text-slate-700">{meta.id_log}</div>
                                                <div className="text-[10px] text-slate-500">Banco: {meta.registro_log_completo?.BANCO}</div>
                                            </>
                                        ) : (
                                            <span className="text-red-500 text-[10px] font-medium">No encontrado</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {logMatch.valido ? (
                                            <span className="font-mono text-slate-700">{meta.registro_log_completo?.extractoId}</span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-600">
                                        {formatCurrency(meta.valor_log)}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-600">
                                        {formatCurrency(meta.valor_pila)}
                                    </td>
                                    <td className={`px-4 py-2 text-right font-mono font-bold ${meta.diferencia !== 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                        {formatCurrency(meta.diferencia)}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <StatusBadge valid={logMatch.valido} text={logMatch.valido ? 'Match' : 'Sin Match'} />
                                    </td>
                                    <td className="px-4 py-2 text-center">
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
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => onViewDetail(data)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-full transition-colors">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
            />
        </div>
    );
};

export default LogTable;
