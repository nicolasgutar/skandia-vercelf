import React from 'react';
import { DollarSign, Loader2, CheckSquare, Square } from 'lucide-react';

const ExtractSection = ({
    extracts = [],
    selectedExtracts = [],
    loading = false,
    onToggleExtract,
    onToggleAll
}) => {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <DollarSign size={20} className="text-blue-600" />
                    Seleccionar Extractos
                </h2>
                <button
                    onClick={onToggleAll}
                    disabled={extracts.length === 0}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {extracts.length > 0 && selectedExtracts.length === extracts.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 flex justify-center text-slate-400">
                        <Loader2 size={24} className="animate-spin" />
                    </div>
                ) : extracts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        No hay extractos disponibles.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {extracts.map(extract => (
                            <div
                                key={extract.id}
                                onClick={() => onToggleExtract(extract.id)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3
                                    ${selectedExtracts.includes(extract.id)
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <div className={`mt-0.5 ${selectedExtracts.includes(extract.id) ? 'text-blue-600' : 'text-slate-300'}`}>
                                    {selectedExtracts.includes(extract.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-base text-slate-900 truncate">{extract.nombre}</div>
                                    <div className="text-sm text-slate-500 truncate">{extract.descripcion || 'Sin descripción'}</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {new Date(extract.fecha_creacion).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-sm text-center text-slate-500 font-medium">
                {selectedExtracts.length} extractos seleccionados
            </div>
        </section>
    );
};

export default ExtractSection;
