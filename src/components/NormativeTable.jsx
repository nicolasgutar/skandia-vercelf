import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';

const NormativeTable = ({ results, validationKey, onViewDetail }) => {
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
                            <th className="px-4 py-2">Archivo</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                            <th className="px-4 py-2 text-center">Total Errores/Alertas</th>
                            <th className="px-4 py-2">Mensaje Principal</th>
                            <th className="px-4 py-2">Detalle</th>
                            <th className="px-4 py-2 text-center">Ver</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentEntries.map(([filename, data]) => {
                            const validation = data[validationKey] || {};
                            const meta = validation.meta || {};
                            const errors = meta.errores_detalle || meta.alertas_detalle || [];
                            const count = meta.total_errores || meta.total_alertas || 0;

                            return (
                                <tr key={filename} className="hover:bg-slate-50 align-top">
                                    <td className="px-4 py-2">
                                        <div className="font-medium text-slate-900">{data.info_planilla?.num_radicacion}</div>
                                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{filename}</div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <StatusBadge valid={validation.valido} />
                                    </td>
                                    <td className="px-4 py-2 text-center font-medium">
                                        {count > 0 ? (
                                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{count}</span>
                                        ) : (
                                            <span className="text-slate-400">0</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-slate-600">
                                        {validation.mensaje}
                                    </td>
                                    <td className="px-4 py-2">
                                        {errors.length > 0 ? (
                                            <div className="text-[10px] space-y-1">
                                                {errors.slice(0, 3).map((err, idx) => (
                                                    <div key={idx} className="flex gap-2 text-red-600">
                                                        <span className="shrink-0">•</span>
                                                        <span>{typeof err === 'string' ? err : JSON.stringify(err)}</span>
                                                    </div>
                                                ))}
                                                {errors.length > 3 && (
                                                    <div className="text-slate-500 italic pt-1">
                                                        + {errors.length - 3} errores más...
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 italic">Sin detalles</span>
                                        )}
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

export default NormativeTable;
