import React from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency } from './helpers';

export const transformResultsToArray = (results) => {
    if (!results) return [];
    return Object.entries(results).map(([filename, val]) => ({
        filename,
        ...val
    }));
};

export const getR04Columns = (onViewDetail) => [
    {
        header: "Archivo / Radicación",
        render: (row) => (
            <>
                <div className="font-medium text-slate-900">{row.info_planilla?.num_radicacion}</div>
                <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={row.filename}>{row.filename}</div>
            </>
        )
    },
    {
        header: "Declarado (T3)",
        className: "text-right",
        cellClassName: "text-right font-mono text-slate-600",
        render: (row) => formatCurrency(row.resultado_r04?.meta?.total_declarado_t3)
    },
    {
        header: "Calculado (T2)",
        className: "text-right",
        cellClassName: "text-right font-mono text-slate-600",
        render: (row) => formatCurrency(row.resultado_r04?.meta?.sumatoria_calculada_t2)
    },
    {
        header: "Diferencia",
        className: "text-right",
        cellClassName: "text-right font-mono",
        render: (row) => {
            const diff = row.resultado_r04?.meta?.diferencia || 0;
            return (
                <span className={`font-bold ${diff !== 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {formatCurrency(diff)}
                </span>
            );
        }
    },
    {
        header: "Estado",
        className: "text-center",
        cellClassName: "text-center",
        render: (row) => <StatusBadge valid={row.resultado_r04?.valido} />
    },
    {
        header: "Mensaje",
        cellClassName: "text-slate-600 text-[10px] max-w-xs",
        render: (row) => row.resultado_r04?.mensaje
    },
    {
        header: "Ver",
        className: "text-center",
        cellClassName: "text-center",
        render: (row) => (
            <button
                onClick={() => onViewDetail(row)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
            >
                <Eye size={16} />
            </button>
        )
    }
];

export const getNormativeColumns = (validationKey, onViewDetail) => [
    {
        header: "Archivo",
        render: (row) => (
            <>
                <div className="font-medium text-slate-900">{row.info_planilla?.num_radicacion}</div>
                <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{row.filename}</div>
            </>
        )
    },
    {
        header: "Estado",
        className: "text-center",
        cellClassName: "text-center",
        render: (row) => <StatusBadge valid={row[validationKey]?.valido} />
    },
    {
        header: "Total Errores/Alertas",
        className: "text-center",
        cellClassName: "text-center font-medium",
        render: (row) => {
            const meta = row[validationKey]?.meta || {};
            const count = meta.total_errores || meta.total_alertas || 0;
            return count > 0 ? (
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{count}</span>
            ) : (
                <span className="text-slate-400">0</span>
            );
        }
    },
    {
        header: "Mensaje Principal",
        cellClassName: "text-slate-600",
        render: (row) => row[validationKey]?.mensaje
    },
    {
        header: "Detalle",
        render: (row) => {
            const meta = row[validationKey]?.meta || {};
            const errors = meta.errores_detalle || meta.alertas_detalle || [];

            if (errors.length > 0) {
                return (
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
                );
            }
            return <span className="text-[10px] text-slate-400 italic">Sin detalles</span>;
        }
    },
    {
        header: "Ver",
        className: "text-center",
        cellClassName: "text-center",
        render: (row) => (
            <button
                onClick={() => onViewDetail(row)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
            >
                <Eye size={16} />
            </button>
        )
    }
];

export const getLogColumns = (onViewDetail) => [
    {
        header: "Archivo / Radicación",
        render: (row) => (
            <>
                <div className="font-medium text-slate-900">{row.info_planilla?.num_radicacion}</div>
                <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{row.filename}</div>
            </>
        )
    },
    {
        header: "ID Log / Banco",
        render: (row) => {
            const logMatch = row.match_log || {};
            const meta = logMatch.meta || {};

            return logMatch.valido ? (
                <>
                    <div className="font-mono text-slate-700">{meta.id_log}</div>
                    <div className="text-[10px] text-slate-500">Banco: {meta.registro_log_completo?.BANCO}</div>
                </>
            ) : (
                <span className="text-red-500 text-[10px] font-medium">No encontrado</span>
            );
        }
    },
    {
        header: "Extracto",
        className: "text-center",
        cellClassName: "text-center",
        render: (row) => {
            const logMatch = row.match_log || {};
            const meta = logMatch.meta || {};
            return logMatch.valido ? (
                <span className="font-mono text-slate-700">{meta.registro_log_completo?.extractoId}</span>
            ) : (
                <span className="text-slate-300">-</span>
            );
        }
    },
    {
        header: "Valor Log",
        className: "text-right",
        cellClassName: "text-right font-mono text-slate-600",
        render: (row) => formatCurrency(row.match_log?.meta?.valor_log)
    },
    {
        header: "Valor PILA",
        className: "text-right",
        cellClassName: "text-right font-mono text-slate-600",
        render: (row) => formatCurrency(row.match_log?.meta?.valor_pila)
    },
    {
        header: "Diferencia",
        className: "text-right",
        cellClassName: "text-right font-mono",
        render: (row) => {
            const diff = row.match_log?.meta?.diferencia || 0;
            return (
                <span className={`font-bold ${diff !== 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {formatCurrency(diff)}
                </span>
            );
        }
    },
    {
        header: "Cruce Log",
        className: "text-center",
        cellClassName: "text-center",
        render: (row) => {
            const logMatch = row.match_log || {};
            return <StatusBadge valid={logMatch.valido} text={logMatch.valido ? 'Match' : 'Sin Match'} />;
        }
    },
    {
        header: "Planilla Asoc.",
        className: "text-center",
        cellClassName: "text-center",
        render: (row) => (
            <div className="flex flex-col items-center gap-1">
                <StatusBadge
                    valid={row.planilla_asociada_encontrada?.valido}
                    text={row.planilla_asociada_encontrada?.valido ? 'Encontrada' : 'No Encontrada'}
                />
                {row.planilla_asociada_encontrada?.meta?.num_planilla_asociada && (
                    <span className="text-[10px] font-mono text-slate-500">
                        Ref: {row.planilla_asociada_encontrada.meta.num_planilla_asociada}
                    </span>
                )}
            </div>
        )
    },
    {
        header: "Ver",
        className: "text-center",
        cellClassName: "text-center",
        render: (row) => (
            <button
                onClick={() => onViewDetail(row)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
            >
                <Eye size={16} />
            </button>
        )
    }
];
