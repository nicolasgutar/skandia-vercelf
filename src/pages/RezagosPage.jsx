import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, CheckCircle, Search, Database, ChevronRight, HardHat, Settings, Clock, HelpCircle, AlertCircle, Download, CreditCard, FileText } from 'lucide-react';
import Table from '../components/Table';
import { SEVERITY_CONFIG, SIAFP_RESPUESTAS } from '../utils/siafpConstants';
import EmailActionModal from '../components/EmailActionModal';
import { formatCurrency } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL;

export default function RezagosPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [estado, setEstado] = useState('ALL');

    // Action States
    const [completedTasks, setCompletedTasks] = useState(new Set());
    const [emailModalOpen, setEmailModalOpen] = useState(false); // Modal state
    const [selectedTaskForEmail, setSelectedTaskForEmail] = useState(null);

    // Plano de Pago States
    const [planoPagoData, setPlanoPagoData] = useState([]);
    const [loadingPlano, setLoadingPlano] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = new URL(`${API_URL}/rezagos-paginated`);
            url.searchParams.append('page', page);
            url.searchParams.append('page_size', pageSize);
            if (estado !== 'ALL') {
                url.searchParams.append('estado', estado);
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar corrección de errores');
            const result = await response.json();

            setData(result.data || []);
            setTotal(result.total || 0);
            setTotalPages(result.total_pages || 0);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlanoPagoData = async () => {
        setLoadingPlano(true);
        try {
            const response = await fetch(`${API_URL}/rezagos-plano-pago`);
            if (!response.ok) throw new Error('Error al cargar rezagos de plano de pago');
            const result = await response.json();
            setPlanoPagoData(result || []);
        } catch (err) {
            console.error("Error fetching piano pago data:", err);
        } finally {
            setLoadingPlano(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchPlanoPagoData();
    }, [page, estado]);

    // --- MANEJO DE COMPLETADO ---
    const completeTask = (taskId) => {
        setCompletedTasks(prev => new Set(prev).add(taskId));

        // Wait for animation then remove from list (optimistic UI)
        setTimeout(() => {
            setData(prev => prev.filter(u => u.id !== taskId));
            setCompletedTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
            setTotal(prev => prev - 1);
        }, 500);
    };

    const handleTaskCompletion = (task) => {
        const severity = task.detalles?.severidad;
        const code = task.detalles?.codigo;

        // Handle both 'A' and recorded labels like 'Externa (A)'
        if (severity === 'A' || SEVERITY_CONFIG[severity]?.label === SEVERITY_CONFIG['A'].label) {
            // Pass partial object that matches what Modal expects
            setSelectedTaskForEmail({
                siafp_codigo: code,
                siafp_severidad: severity,
                siafp_significado: task.detalles?.significado,
                _id: task.id // Use real ID for completion
            });
            setEmailModalOpen(true);
        } else {
            completeTask(task.id);
        }
    };

    const handleSendEmail = () => {
        if (selectedTaskForEmail) {
            completeTask(selectedTaskForEmail._id);
        }
        setEmailModalOpen(false);
        setSelectedTaskForEmail(null);
    };

    const handleGenerateExcel = async () => {
        try {
            window.open(`${API_URL}/generar-excel-plano-pago`, '_blank');
        } catch (err) {
            console.error("Error downloading excel:", err);
            alert("Error al generar el archivo Excel");
        }
    };

    const columns = [
        {
            header: "ID",
            key: "id",
            className: "w-12 text-slate-400 text-[10px]"
        },
        {
            header: "SIAFP / Discrepancia",
            className: "min-w-[220px] max-w-[300px]",
            render: (row) => {
                const d = row.detalles || {};
                const isDiscrepancy = row.codigoError === 'DISCREPANCIA';

                return (
                    <div className="flex flex-col gap-1 py-1">
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${isDiscrepancy ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {row.codigoError}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[220px]" title={row.mensaje}>
                                {row.mensaje}
                            </span>
                        </div>
                        {d.val1 && d.val2 && (
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded border border-slate-100 w-fit">
                                <span className="text-[9px] text-slate-400 uppercase font-bold px-1">Comparativa</span>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="text-slate-500">Puy:</span>
                                    <span className="font-bold text-blue-600">{d.val1}</span>
                                    <ChevronRight size={10} className="text-slate-300" />
                                    <span className="text-slate-500">SIAFP:</span>
                                    <span className="font-bold text-purple-600">{d.val2}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            header: "Aportante & Archivo",
            className: "min-w-[180px] max-w-[240px]",
            render: (row) => (
                <div className="flex flex-col max-w-[200px]">
                    <span className="font-medium text-slate-800 truncate text-xs" title={row.planilla?.razonSocialAportante}>
                        {row.planilla?.razonSocialAportante || 'Desconocido'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate italic">
                        {row.planilla?.filename}
                    </span>
                </div>
            )
        },
        {
            header: "Gestión Sugerida",
            className: "min-w-[120px] max-w-[180px]",
            render: (row) => {
                const d = row.detalles || {};
                const sevConfig = SEVERITY_CONFIG[d.severidad] || SEVERITY_CONFIG['MIXTA'];

                return (
                    <div className="flex flex-col gap-1 capitalize">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full border ${sevConfig.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                            <span className="text-[10px] text-slate-500 font-medium">
                                {sevConfig.label}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight font-medium bg-slate-50 p-1 rounded border border-slate-100">
                            {d.accion || 'Pendiente de análisis'}
                        </p>
                    </div>
                );
            }
        },
        {
            header: "Estado",
            className: "text-center w-24",
            render: (row) => {
                const status = row.estado || 'PENDIENTE';
                const colors = {
                    'PENDIENTE': 'bg-amber-100 text-amber-700 border-amber-200',
                    'PROCESADO': 'bg-green-100 text-green-700 border-green-200',
                    'ERROR': 'bg-red-100 text-red-700 border-red-200'
                };
                return (
                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold border ${colors[status] || 'bg-slate-100'}`}>
                        {status}
                    </span>
                );
            }
        },
        {
            header: "Completar",
            className: "text-center w-24",
            render: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTaskCompletion(row);
                        }}
                        className="p-1 rounded-full hover:bg-green-100 text-slate-400 hover:text-green-600 transition-all"
                        title="Marcar como completado"
                    >
                        <CheckCircle size={20} />
                    </button>
                </div>
            )
        }
    ];

    const planoPagoColumns = [
        {
            header: "Entidad Destino",
            className: "min-w-[150px]",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                        <CreditCard size={14} />
                    </div>
                    <span className="font-bold text-slate-700">{row.detalles?.val2 || 'Desconocida'}</span>
                </div>
            )
        },
        {
            header: "Aportante",
            className: "min-w-[200px]",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-800 text-xs">{row.planilla?.razonSocialAportante}</span>
                    <span className="text-[10px] text-slate-400 font-mono">NIT: {row.planilla?.numDocAportante}</span>
                </div>
            )
        },
        {
            header: "Archivo",
            className: "min-w-[150px]",
            render: (row) => (
                <div className="flex items-center gap-1.5 text-slate-500 italic text-[10px]">
                    <FileText size={12} />
                    <span className="truncate max-w-[140px]" title={row.planilla?.filename}>{row.planilla?.filename}</span>
                </div>
            )
        },
        {
            header: "Total Cotización",
            className: "text-right w-32",
            cellClassName: "text-right font-mono font-bold text-blue-600",
            render: (row) => formatCurrency(row.planilla?.totalCotizacion)
        }
    ];

    const totalInPlano = planoPagoData.reduce((acc, curr) => acc + (curr.planilla?.totalCotizacion || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Single Cohesive Header */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex gap-4 items-center">
                            <div className="bg-amber-500 p-3 rounded-2xl text-white shrink-0 shadow-lg shadow-amber-500/20">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Corrección de Errores</h1>
                                <p className="text-slate-500 text-sm font-medium">
                                    Bandeja de discrepancias y errores validados por SIAFP ({total} registros)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 h-[46px]">
                                <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                                    <Database size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Total</span>
                                    <span className="text-lg font-black text-slate-800 leading-none">{total}</span>
                                </div>
                            </div>

                            <div className="relative group flex-1 md:flex-none">
                                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <select
                                    value={estado}
                                    onChange={(e) => { setEstado(e.target.value); setPage(1); }}
                                    className="appearance-none bg-white border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm min-w-[140px]"
                                >
                                    <option value="ALL">Todo Estado</option>
                                    <option value="PENDIENTE">Pendientes</option>
                                    <option value="PROCESADO">Procesados</option>
                                    <option value="ERROR">Con Error</option>
                                </select>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="p-0 overflow-hidden">
                    <Table
                        data={data}
                        columns={columns}
                        loading={loading}
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={total}
                        onPageChange={setPage}
                        itemsPerPage={pageSize}
                        emptyMessage="No se encontraron correcciones de errores que coincidan con los filtros"
                        className="border-none shadow-none rounded-none"
                        rowClassName={(u) => completedTasks.has(u.id) ? "line-through opacity-40 bg-green-50 scale-[0.98] transition-all duration-500 ease-in-out" : "transition-all duration-500 ease-in-out"}
                    />
                </div>
            </div>

            {/* --- SECCIÓN: PLANO DE PAGO --- */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex gap-4 items-center">
                            <div className="bg-blue-600 p-3 rounded-2xl text-white shrink-0 shadow-lg shadow-blue-600/20">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Generar Plano de Pago</h2>
                                <p className="text-slate-500 text-sm font-medium">
                                    Pagos identificados para otras entidades (Error 009)
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateExcel}
                            disabled={planoPagoData.length === 0}
                            className="w-full md:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Download size={18} />
                            Generar plano de Pago
                        </button>
                    </div>
                </div>

                <div className="p-0 overflow-hidden">
                    <Table
                        data={planoPagoData}
                        columns={planoPagoColumns}
                        loading={loadingPlano}
                        emptyMessage="No hay rezagos pendientes de pago a otras entidades"
                        className="border-none shadow-none rounded-none"
                    />
                </div>

                {planoPagoData.length > 0 && (
                    <div className="p-4 bg-blue-50 border-t border-blue-100 flex items-center gap-3">
                        <div className="bg-blue-600 p-1.5 rounded-full text-white">
                            <FileText size={16} />
                        </div>
                        <p className="text-sm font-medium text-blue-900">
                            <span className="font-bold text-lg">{formatCurrency(totalInPlano)}</span> eran aportes a otras entidades. Se debe hacer el pago de esos aportes a la entidad.
                        </p>
                    </div>
                )}
            </div>

            <EmailActionModal
                isOpen={emailModalOpen}
                onClose={() => { setEmailModalOpen(false); setSelectedTaskForEmail(null); }}
                onSend={handleSendEmail}
                template={selectedTaskForEmail ? SIAFP_RESPUESTAS[selectedTaskForEmail.siafp_codigo]?.template : null}
                errorCode={selectedTaskForEmail?.siafp_codigo}
            />
        </div>
    );
}
