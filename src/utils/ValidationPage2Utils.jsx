import React from 'react';

export const exportToJSON = async (files, results, setLoading, setError, EXTRACT_400_URL) => {
    if (files.length === 0 || !results) return;
    setLoading(true); setError(null);

    // Filter files that passed ALL validations
    const validFilenames = Object.entries(results).filter(([filename, val]) => {
        const keysToCheck = [
            'resultado_r04',
            'resultado_matriz',
            'match_log',
            'resultado_r05',
            'resultado_r06',
            'resultado_r07',
            'resultado_r08'
        ];

        return keysToCheck.every(key => {
            if (!val[key]) return true;
            return val[key].valido === true;
        });
    }).map(([filename]) => filename);

    const filesToExport = files.filter(f => validFilenames.includes(f.name));

    if (filesToExport.length === 0) {
        setError("No hay archivos que hayan pasado todas las validaciones para exportar.");
        setLoading(false);
        return;
    }

    const formData = new FormData();
    filesToExport.forEach(file => formData.append('archivos', file));

    try {
        const response = await fetch(EXTRACT_400_URL, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);
        const data = await response.json();

        // Generate timestamp in format yyyy#mm#dd-hh#mm#ss
        const now = new Date();
        const timestamp = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        // Download each CSV file separately
        const csvKeys = ["A6AKCPP", "A6AMCPP", "A6ALCPP"];
        for (const key of csvKeys) {
            if (data[key]) {
                const blob = new Blob([data[key]], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${key}_${timestamp}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        }
    } catch (err) {
        console.error(err);
        setError(err.message || "Error al exportar JSON");
    } finally {
        setLoading(false);
    }
};

export const exportToExcel = async (files, setLoading, setError, EXPORT_URL) => {
    if (files.length === 0) return;
    setLoading(true); setError(null);
    const formData = new FormData();
    files.forEach(file => formData.append('archivos', file));
    try {
        const response = await fetch(EXPORT_URL, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "reporte_validacion.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        console.error(err);
        setError(err.message || "Error al exportar Excel");
    } finally {
        setLoading(false);
    }
};


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