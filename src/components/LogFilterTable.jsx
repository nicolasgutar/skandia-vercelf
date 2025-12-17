import React, { useState, useEffect, useCallback } from 'react';
import { Filter, Search, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import Table from './Table';

const API_URL = `${import.meta.env.VITE_API_URL}/query-log`;

const FilterInput = ({ value, onChange, type = "text", placeholder }) => (
    <div className="absolute top-full left-0 mt-0 w-48 bg-white p-2 rounded-lg shadow-xl border border-slate-200 z-20">
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            autoFocus
        />
    </div>
);

const RangeFilterInput = ({ min, max, onMinChange, onMaxChange, placeholderMin, placeholderMax, type = "number" }) => (
    <div className="absolute top-full left-0 mt-0 w-48 bg-white p-2 rounded-lg shadow-xl border border-slate-200 z-20 flex flex-col gap-2">
        <input
            type={type}
            value={min || ''}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder={placeholderMin || "Min"}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            autoFocus
        />
        <input
            type={type}
            value={max || ''}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder={placeholderMax || "Max"}
            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500"
        />
    </div>
);

export default function LogFilterTable({ extracts = [], loadingExtracts = false }) {
    // const [extracts, setExtracts] = useState([]); // REMOVED: Received as prop
    const [selectedExtractId, setSelectedExtractId] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [loadingExtracts, setLoadingExtracts] = useState(false); // REMOVED
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total_records: 0,
        total_pages: 0
    });

    const [filters, setFilters] = useState({
        banco: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_aportante: '',
        razon_social: '',
        planilla: '',
        periodo: '',
        tipo: '',
        oper: '',
        valor_min: '',
        valor_max: ''
    });

    const [activeFilter, setActiveFilter] = useState(null);
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    // Auto-select first extract when available
    useEffect(() => {
        if (extracts.length > 0 && !selectedExtractId) {
            setSelectedExtractId(extracts[0].id);
        }
    }, [extracts, selectedExtractId]);

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchLogs = useCallback(async () => {
        if (!selectedExtractId) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                page_size: pagination.page_size
            });

            const body = {};
            Object.entries(debouncedFilters).forEach(([key, value]) => {
                if (value !== '' && value !== null) {
                    const strVal = value.toString();
                    if (['banco', 'periodo', 'tipo', 'oper'].includes(key)) {
                        const cleanVal = strVal.replace(/\D/g, '');
                        const parsed = parseInt(cleanVal);
                        if (!isNaN(parsed)) body[key] = parsed;
                    } else if (['valor_min', 'valor_max'].includes(key)) {
                        const cleanVal = strVal.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(',', '.');
                        const parsed = parseFloat(cleanVal);
                        if (!isNaN(parsed)) body[key] = parsed;
                    } else if (['fecha_inicio', 'fecha_fin'].includes(key)) {
                        const cleanVal = strVal.replace(/[-/]/g, '');
                        const parsed = parseInt(cleanVal);
                        if (!isNaN(parsed)) body[key] = parsed;
                    } else {
                        body[key] = value;
                    }
                }
            });

            // New Endpoint: POST /extractos/:id/registros
            const response = await fetch(`${import.meta.env.VITE_API_URL}/extractos/${selectedExtractId}/registros?${params.toString()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error('Error fetching logs');

            const result = await response.json();
            setData(result.data);
            setPagination(prev => ({
                ...prev,
                total_records: result.total_records,
                total_pages: result.total_pages
            }));

        } catch (error) {
            console.error("Error fetching logs:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedExtractId, pagination.page, pagination.page_size, debouncedFilters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            banco: '', fecha_inicio: '', fecha_fin: '', id_aportante: '', razon_social: '',
            planilla: '', periodo: '', tipo: '', oper: '', valor_min: '', valor_max: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const columns = [
        { key: 'banco', label: 'Banco', type: 'text' },
        { key: 'fecha', label: 'Fecha', isRange: true, minKey: 'fecha_inicio', maxKey: 'fecha_fin', placeholderMin: 'YYYYMMDD', placeholderMax: 'YYYYMMDD', type: 'text' },
        { key: 'id', label: 'ID Aportante', filterKey: 'id_aportante' },
        { key: 'razon_social', label: 'Razón Social' },
        { key: 'planilla', label: 'Planilla' },
        { key: 'periodo', label: 'Periodo', type: 'text' },
        { key: 'tipo', label: 'Tipo', type: 'text' },
        { key: 'oper', label: 'Oper', type: 'text' },
        { key: 'valor', label: 'Valor', type: 'text', isCurrency: true, isRange: true, minKey: 'valor_min', maxKey: 'valor_max' }
    ];

    const isFilterActive = (col) => {
        if (col.isRange) return filters[col.minKey] || filters[col.maxKey];
        return filters[col.filterKey || col.key];
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                        <Search size={20} className="text-blue-600" />
                        Consulta Log Financiero
                    </h2>
                    <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Limpiar Filtros
                    </button>
                </div>

                {/* Extract Selector */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Extracto</label>
                    {loadingExtracts ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 size={16} className="animate-spin" /> Cargando extractos...
                        </div>
                    ) : (
                        <select
                            value={selectedExtractId}
                            onChange={(e) => {
                                setSelectedExtractId(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full md:w-1/2 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="" disabled>-- Seleccione un extracto --</option>
                            {extracts.map(extract => (
                                <option key={extract.id} value={extract.id}>
                                    {extract.nombre} ({new Date(extract.fecha_creacion).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Refactored Table */}
            <div className="flex-1 flex flex-col min-h-[400px]">
                <Table
                    columns={columns.map(col => ({
                        key: col.key,
                        header: (
                            <div className="flex items-center gap-1">
                                {col.label}
                                <Filter size={12} className={`text-slate-400 ${isFilterActive(col) ? 'text-blue-600' : 'opacity-0 group-hover:opacity-100'}`} />
                                {activeFilter === col.key && (
                                    col.isRange ? (
                                        <RangeFilterInput
                                            min={filters[col.minKey]}
                                            max={filters[col.maxKey]}
                                            onMinChange={(val) => handleFilterChange(col.minKey, val)}
                                            onMaxChange={(val) => handleFilterChange(col.maxKey, val)}
                                            placeholderMin={col.placeholderMin}
                                            placeholderMax={col.placeholderMax}
                                            type={col.type || 'number'}
                                        />
                                    ) : (
                                        <FilterInput
                                            value={filters[col.filterKey || col.key]}
                                            onChange={(val) => handleFilterChange(col.filterKey || col.key, val)}
                                            placeholder={`Filtrar ${col.label}...`}
                                            type={col.type || 'text'}
                                        />
                                    )
                                )}
                            </div>
                        ),
                        headerProps: {
                            onMouseEnter: () => setActiveFilter(col.key),
                            onMouseLeave: () => setActiveFilter(null)
                        },
                        className: "relative group cursor-pointer hover:bg-slate-100 transition-colors",
                        cellClassName: "font-mono text-slate-600",
                        render: (row) => col.isCurrency ? formatCurrency(row[col.key]) : row[col.key]
                    }))}
                    data={data}
                    loading={loading}
                    currentPage={pagination.page}
                    totalPages={pagination.total_pages}
                    totalItems={pagination.total_records}
                    onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
                    itemsPerPage={pagination.page_size}
                    className="border-none shadow-none"
                    emptyMessage={!selectedExtractId ? "Seleccione un extracto para ver los registros." : "No se encontraron registros"}
                />
            </div>
        </section>
    );
}
