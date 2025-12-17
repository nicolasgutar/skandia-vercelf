import React from 'react';
import { FileText, User, CreditCard, Layers } from 'lucide-react';
import Modal from './Modal';

const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
        <Icon className="text-blue-600" size={20} />
        <h3 className="font-semibold text-slate-800">{title}</h3>
    </div>
);

const KeyValueGrid = ({ data }) => {
    if (!data) return <p className="text-slate-500 italic">No hay datos disponibles</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 break-words">
                        {key.replace(/_/g, ' ')}
                    </div>
                    <div className="font-medium text-slate-900 break-words font-mono text-sm">
                        {value !== null && value !== undefined ? String(value) : '-'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function DetallePlanilla({ planilla, onClose }) {
    if (!planilla) return null;

    const { raw_parser_output } = planilla;
    const { tipo1, tipo2, tipo3 } = raw_parser_output || {};

    const headerContent = (
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <FileText size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">Detalle de Planilla</h2>
                <p className="text-xs text-slate-500 font-mono">{planilla.archivo}</p>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={true} // Always true as parent controls rendering
            onClose={onClose}
            title={headerContent}
            size="xl"
        >
            <div className="space-y-8">
                {/* Tipo 1 */}
                <section>
                    <SectionHeader icon={Layers} title="Encabezado (Tipo 1)" />
                    <KeyValueGrid data={tipo1} />
                </section>

                {/* Tipo 2 */}
                <section>
                    <SectionHeader icon={User} title={`Afiliados (Tipo 2) - ${tipo2?.length || 0} registros`} />
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    {tipo2 && tipo2.length > 0 && Object.keys(tipo2[0]).map(key => (
                                        <th key={key} className="px-4 py-3">{key.replace(/_/g, ' ')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tipo2?.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        {Object.values(row).map((val, i) => (
                                            <td key={i} className="px-4 py-2 text-slate-700 font-mono text-xs">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Tipo 3 */}
                <section>
                    <SectionHeader icon={CreditCard} title="Totales (Tipo 3)" />
                    <div className="space-y-6">
                        {tipo3 && Object.entries(tipo3).map(([subKey, subData]) => (
                            <div key={subKey}>
                                <h4 className="text-sm font-semibold text-slate-700 mb-3 capitalize border-l-4 border-blue-500 pl-2">
                                    {subKey.replace(/_/g, ' ')}
                                </h4>
                                <KeyValueGrid data={subData} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </Modal>
    );
}
