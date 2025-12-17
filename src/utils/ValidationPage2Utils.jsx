import React from 'react';

export const getFoundUsersColumns = () => [
    {
        header: "Documento",
        render: u => <span className="font-mono text-slate-600">{u.tipo_documento} {u.num_documento}</span>
    },
    {
        header: "Razón Social / Nombre",
        render: u => <span className="font-medium text-slate-800">{u.nombre}</span>
    },
    {
        header: "Archivo Origen",
        render: u => <span className="text-slate-500 text-xs">{u.archivo_origen}</span>
    },
    {
        header: "En Puy",
        className: "text-center",
        cellClassName: "text-center",
        render: u => (
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${u.en_puy === 'Skandia' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {u.en_puy || 'N/A'}
            </span>
        )
    },
    {
        header: "En SIAFP",
        className: "text-center",
        cellClassName: "text-center",
        render: u => (
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${u.en_siafp === 'Skandia' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {u.en_siafp || 'N/A'}
            </span>
        )
    }
];
