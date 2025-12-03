import React from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

const NormativeTable = ({ results, validationKey, onViewDetail }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                    <th className="px-6 py-3">Archivo</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                    <th className="px-6 py-3 text-center">Total Errores/Alertas</th>
                    <th className="px-6 py-3">Mensaje Principal</th>
                    <th className="px-6 py-3">Detalle</th>
                    <th className="px-6 py-3 text-center">Ver</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {Object.entries(results).map(([filename, data]) => {
                    const validation = data[validationKey] || {};
                    const meta = validation.meta || {};
                    const errors = meta.errores_detalle || meta.alertas_detalle || [];
                    const count = meta.total_errores || meta.total_alertas || 0;

                    return (
                        <tr key={filename} className="hover:bg-slate-50 align-top">
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{data.info_planilla?.num_radicacion}</div>
                                <div className="text-xs text-slate-500 truncate max-w-[200px]">{filename}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge valid={validation.valido} />
                            </td>
                            <td className="px-6 py-4 text-center font-medium">
                                {count > 0 ? (
                                    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{count}</span>
                                ) : (
                                    <span className="text-slate-400">0</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {validation.mensaje}
                            </td>
                            <td className="px-6 py-4">
                                {errors.length > 0 ? (
                                    <div className="text-xs space-y-1">
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
                                    <span className="text-xs text-slate-400 italic">Sin detalles</span>
                                )}
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

export default NormativeTable;
