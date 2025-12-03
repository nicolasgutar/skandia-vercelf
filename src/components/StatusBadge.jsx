import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ valid, text }) => {
    if (valid) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle size={14} />
                {text || 'Válido'}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={14} />
            {text || 'Error'}
        </span>
    );
};

export default StatusBadge;
