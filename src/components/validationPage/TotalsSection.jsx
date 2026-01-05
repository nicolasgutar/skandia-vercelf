import React from 'react';
import { CheckSquare, DollarSign, AlertCircle, PiggyBank } from 'lucide-react';

const TotalsSection = ({ totals }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center justify-between">
                <div>
                    <p className="text-green-600 font-medium mb-1 flex items-center gap-2">
                        <CheckSquare size={18} /> Total Acreditar
                    </p>
                    <h3 className="text-3xl font-bold text-green-700">
                        ${totals.acreditar.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                    </h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <DollarSign size={32} />
                </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between">
                <div>
                    <p className="text-amber-600 font-medium mb-1 flex items-center gap-2">
                        <AlertCircle size={18} /> Total Corrección Errores
                    </p>
                    <h3 className="text-3xl font-bold text-amber-700">
                        ${totals.rezagos.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                    </h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                    <PiggyBank size={32} />
                </div>
            </div>
        </div>
    );
};

export default TotalsSection;
