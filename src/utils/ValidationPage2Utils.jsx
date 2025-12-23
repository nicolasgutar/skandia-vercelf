import React from 'react';

// --- CONFIGURACIÓN DE ESTILOS POR SEVERIDAD ---
const SEVERITY_STYLES = {
    'A': 'bg-red-100 text-red-700 border-red-200',
    'B': 'bg-amber-100 text-amber-700 border-amber-200',
    'S': 'bg-purple-100 text-purple-700 border-purple-200',
    'W': 'bg-blue-100 text-blue-700 border-blue-200',
};

const SEVERITY_LABELS = {
    'A': 'Externa',
    'B': 'Interna',
    'S': 'Sistema',
    'W': 'Espera',
};

export const getFoundUsersColumns = () => [
    {
        header: "Documento",
        render: u => <span className="font-mono text-slate-600">{u.tipo_documento} {u.num_documento}</span>
    },
    {
        header: "Razón Social / Nombre",
        render: u => <span className="font-medium text-slate-800 line-clamp-1">{u.nombre}</span>
    },
    {
        header: "Cod. SIAFP",
        className: "text-center",
        render: u => (
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-bold border border-slate-200 text-xs">
                {u.siafp_codigo}
            </code>
        )
    },
    {
        header: "Severidad",
        className: "text-center",
        render: u => {
            const style = SEVERITY_STYLES[u.siafp_severidad] || 'bg-slate-100 text-slate-600';
            const label = SEVERITY_LABELS[u.siafp_severidad] || u.siafp_severidad;
            return (
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${style}`}>
                    {label}
                </span>
            );
        }
    },
    {
        header: "Significado",
        render: u => <span className="text-xs text-slate-600 leading-tight block max-w-[200px]">{u.siafp_significado}</span>
    },
    {
        header: "Acción Requerida",
        render: u => <span className="text-xs font-semibold text-slate-700 italic">{u.siafp_accion}</span>
    },
    {
        header: "En Puy",
        className: "text-center",
        render: u => (
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.en_puy === 'Skandia' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {u.en_puy || 'N/A'}
            </span>
        )
    },
    {
        header: "En SIAFP",
        className: "text-center",
        render: u => (
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.en_siafp === 'Skandia' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {u.en_siafp || 'N/A'}
            </span>
        )
    },
    {
        header: "Archivo Origen",
        render: u => <span className="text-slate-400 text-[10px] block max-w-[120px] truncate" title={u.archivo_origen}>{u.archivo_origen}</span>
    }
];