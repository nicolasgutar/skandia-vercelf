import React from 'react';

const TabButton = ({ active, onClick, icon: Icon, label, alertCount = 0 }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${active
            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
    >
        <Icon size={18} />
        {label}
        {alertCount > 0 && (
            <span className="ml-1 bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {alertCount}
            </span>
        )}
    </button>
);

export default TabButton;
