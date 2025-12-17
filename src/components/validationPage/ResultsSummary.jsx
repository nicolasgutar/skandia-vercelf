import React from 'react';
import { CheckCircle, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';

const ResultsSummary = ({
    validCount,
    totalCount,
    onExportExcel,
    onExportJSON,
    loading
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">
                            Resultados de Conciliación
                        </h3>
                        <p className="text-slate-600">
                            <span className="font-semibold text-green-700">{validCount}</span> de <span className="font-medium">{totalCount}</span> transacciones han pasado todas las validaciones.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {onExportJSON && (
                        <button
                            onClick={onExportJSON}
                            disabled={loading}
                            title="Solo transacciones válidas"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <FileJson size={18} />}
                            Exportar JSON
                        </button>
                    )}
                    <button
                        onClick={onExportExcel}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                        Exportar Excel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultsSummary;
