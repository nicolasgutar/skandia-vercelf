import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, FileText, CheckCircle, AlertCircle, FileBarChart, Download, ArrowRight, Search, X } from 'lucide-react';
import Table from '../components/Table';
import { formatCurrency } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL;

export default function ConciliacionesPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totAcred, setTotAcred] = useState(0);

    // Cierre Contable State
    const [selectedMonth, setSelectedMonth] = useState('ALL');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Aportante Filter State
    const [razonSocial, setRazonSocial] = useState('');
    const [aportanteSearch, setAportanteSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = new URL(`${API_URL}/conciliaciones-paginated`);
            url.searchParams.append('page', page);
            url.searchParams.append('page_size', pageSize);

            // Add period filter from the selected month/year if not 'ALL'
            if (selectedMonth !== 'ALL') {
                const periodo = `${selectedYear}-${String(Number(selectedMonth) + 1).padStart(2, '0')}`;
                url.searchParams.append('periodo', periodo);
            }

            if (razonSocial) {
                url.searchParams.append('razon_social', razonSocial);
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar conciliaciones');
            const result = await response.json();

            setData(result.data || []);
            setTotal(result.total || 0);
            setTotalPages(result.total_pages || 0);
            setTotAcred(result.tot_acred || 0);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, selectedMonth, selectedYear, razonSocial]);

    // Fetch suggestions for aportantes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!aportanteSearch.trim()) {
                setSuggestions([]);
                return;
            }
            try {
                const response = await fetch(`${API_URL}/afiliados?search=${encodeURIComponent(aportanteSearch)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                }
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [aportanteSearch]);

    const columns = [
        {
            header: "ID Match",
            key: "id",
            className: "w-20"
        },
        {
            header: "Nivel de Coincidencia",
            render: (row) => (
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${row.tipoMatch === 'EXACTO'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                    {row.tipoMatch}
                </span>
            )
        },
        {
            header: "Información de Planilla",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-800 leading-none">{row.planilla?.razonSocialAportante || 'N/A'}</span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <FileText size={12} />
                        <span className="text-[10px] truncate max-w-[150px]">{row.planilla?.filename}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Registro Bancario",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-700 leading-none">
                        {formatCurrency(row.registroExtracto?.valor)}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px]">{row.registroExtracto?.fecha}</span>
                    </div>
                </div>
            )
        }
    ];

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Conciliaciones</h1>
                    <p className="text-slate-500 font-medium mt-1">Gobernanza y cuadre financiero entre recaudos y reportes</p>
                </div>
            </div>

            {/* Premium Cierre Contable Card */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="max-w-md">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
                            Fase de Cierre Mensual
                        </div>
                        <h2 className="text-4xl font-black mb-3">Generar Cierre Contable</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Consolida todos los movimientos del periodo seleccionado y genera el asiento contable definitivo.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md w-full lg:w-auto">
                        <div className="grid grid-cols-2 gap-3 flex-grow">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mes</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">Todos los Periodos</option>
                                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Año</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => { setSelectedYear(Number(e.target.value)); setPage(1); }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <button className="sm:mt-5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group">
                            Procesar Cierre
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Analytics Dashboard Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                            <CheckCircle size={22} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">92.4%</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Conciliados</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{total.toLocaleString()} <span className="text-sm font-medium text-slate-400">registros</span></p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
                            <AlertCircle size={22} />
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">7.6%</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Diferencias</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{Math.round(total * 0.076).toLocaleString()}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                            <DollarSign size={22} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-tight">Total a acreditar para los periodos seleccionados</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                        {formatCurrency(totAcred)}
                    </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
                            <FileBarChart size={22} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Planillas</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">128 <span className="text-sm font-medium text-slate-400">archivos</span></p>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-none">Detalle de Conciliaciones</h3>
                            <p className="text-xs text-slate-400 mt-1">Auditoría transaccional de cruce financiero</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow justify-end">
                        <div className="relative w-full sm:max-w-xs">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por aportante..."
                                    value={aportanteSearch}
                                    onChange={(e) => {
                                        setAportanteSearch(e.target.value);
                                        setShowSuggestions(true);
                                        if (e.target.value === '') setRazonSocial('');
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                                {aportanteSearch && (
                                    <button
                                        onClick={() => { setAportanteSearch(''); setRazonSocial(''); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setAportanteSearch(s);
                                                setRazonSocial(s);
                                                setShowSuggestions(false);
                                                setPage(1);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 transition-colors border-b border-slate-50 last:border-0 font-medium truncate"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    <Table
                        data={data}
                        columns={columns}
                        loading={loading}
                        currentPage={page}
                        totalItems={total}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        itemsPerPage={pageSize}
                        className="border-none shadow-none rounded-none"
                    />
                </div>
            </div>
        </div>
    );
}
