import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/helpers';
import Pagination from './Pagination';

const R04Table = ({ results, onViewDetail }) => {
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
                            <th className="px-4 py-2 text-right">Declarado (T3)</th>
                            <th className="px-4 py-2 text-right">Calculado (T2)</th>
                            <th className="px-4 py-2 text-right">Diferencia</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                            <th className="px-4 py-2">Mensaje</th>
                            <th className="px-4 py-2 text-center">Ver</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentEntries.map(([filename, data]) => {
                            const r04 = data.resultado_r04 || {};
                            const meta = r04.meta || {};
                            return (
                                <tr key={filename} className="hover:bg-slate-50">
                                    <td className="px-4 py-2">
                                        <div className="font-medium text-slate-900">{data.info_planilla?.num_radicacion}</div>
                                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={filename}>{filename}</div>
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-600">
                                        {formatCurrency(meta.total_declarado_t3)}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-600">
                                        {formatCurrency(meta.sumatoria_calculada_t2)}
                                    </td>
                                    <td className={`px-4 py-2 text-right font-mono font-bold ${meta.diferencia !== 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                        {formatCurrency(meta.diferencia)}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <StatusBadge valid={r04.valido} />
                                    </td>
                                    <td className="px-4 py-2 text-slate-600 text-[10px] max-w-xs">
                                        {r04.mensaje}
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

export default R04Table;
