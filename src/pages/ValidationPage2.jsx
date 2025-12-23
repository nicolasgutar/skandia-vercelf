import React, { useState, useCallback, useEffect } from 'react';
import {
    AlertTriangle, LayoutList, DollarSign, AlertCircle, Grid, Filter, Clock, HardHat, Settings
} from 'lucide-react';
import TabButton from '../components/TabButton';
import Table from '../components/Table';
import LogFilterTable from '../components/LogFilterTable';
import {
    transformResultsToArray,
    getR04Columns,
    getNormativeColumns,
    getLogColumns
} from '../utils/ValidationPageUtils';
// Importamos la función de columnas actualizada
import { getFoundUsersColumns } from '../utils/ValidationPage2Utils';
import ExtractSection from '../components/validationPage/ExtractSection';
import UploadSection from '../components/validationPage/UploadSection';
import TotalsSection from '../components/validationPage/TotalsSection';

import DetallePlanilla from '../components/DetallePlanilla';
import ResultsSummary from '../components/validationPage/ResultsSummary';

// --- CONFIGURACIÓN DE SEVERIDAD SIAFP ---
const SEVERITY_CONFIG = {
    'A': { color: 'bg-red-100 text-red-700 border-red-200', label: 'Externa (A)', icon: AlertCircle, desc: 'Requiere gestión con terceros' },
    'B': { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Interna (B)', icon: HardHat, desc: 'Gestión operativa de la AFP' },
    'S': { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Sistema (S)', icon: Settings, desc: 'Error técnico/lógico' },
    'W': { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Espera (W)', icon: Clock, desc: 'En proceso automático' },
};

// --- ENDPOINTS ---
const PROCESS_URL = `${import.meta.env.VITE_API_URL}/procesar-planilla-2`;
const EXPORT_URL = `${import.meta.env.VITE_API_URL}/exportar-excel`;
const EXTRACTS_URL = `${import.meta.env.VITE_API_URL}/extractos/`;
const EXTRACT_400_URL = `${import.meta.env.VITE_API_URL}/extraer-cuatrocientos`;
const BLOCKCHAIN_UPLOAD_URL = "https://blockchain.validator.puygroup.com/api/v1/transactions/files/upload";

export default function ValidationPage() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [activeTab, setActiveTab] = useState('R04');
    const [selectedPlanilla, setSelectedPlanilla] = useState(null);

    // Extract Selection State
    const [extracts, setExtracts] = useState([]);
    const [selectedExtracts, setSelectedExtracts] = useState([]);
    const [loadingExtracts, setLoadingExtracts] = useState(true);

    // --- STATE: Rezagos & Totals ---
    const [foundUsers, setFoundUsers] = useState([]);
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const [totals, setTotals] = useState({ acreditar: 0, rezagos: 0 });

    useEffect(() => {
        fetchExtracts();
    }, []);

    const fetchExtracts = async () => {
        try {
            setLoadingExtracts(true);
            const response = await fetch(EXTRACTS_URL);
            if (!response.ok) throw new Error('Error al cargar extractos');
            const data = await response.json();
            setExtracts(data);
        } catch (err) {
            console.error("Error fetching extracts:", err);
        } finally {
            setLoadingExtracts(false);
        }
    };

    // --- FILTRADO DE REZAGOS ---
    const filteredUsers = foundUsers.filter(user =>
        severityFilter === 'ALL' || user.siafp_severidad === severityFilter
    );

    const toggleExtract = (id) => {
        setSelectedExtracts(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const toggleAllExtracts = () => {
        if (selectedExtracts.length === extracts.length) {
            setSelectedExtracts([]);
        } else {
            setSelectedExtracts(extracts.map(e => e.id));
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const newFiles = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.txt'));
            setFiles(prev => [...prev, ...newFiles]);
        }
    }, []);

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const newFiles = Array.from(e.target.files).filter(f => f.name.toLowerCase().endsWith('.txt'));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    const processFiles = async () => {
        if (files.length === 0) return;
        if (selectedExtracts.length === 0) {
            setError("Debes seleccionar al menos un extracto para la conciliación.");
            return;
        }
        setLoading(true);
        setError(null);
        setResults(null);
        setFoundUsers([]);
        setTotals({ acreditar: 0, rezagos: 0 });

        const formDataProcess = new FormData();
        files.forEach(file => formDataProcess.append('archivos', file));
        formDataProcess.append('extractoIds', JSON.stringify(selectedExtracts));

        try {
            const processResponse = await fetch(PROCESS_URL, { method: 'POST', body: formDataProcess });
            if (!processResponse.ok) throw new Error(`Error en validación: ${processResponse.statusText}`);

            const processDataRaw = await processResponse.json();

            setTotals({
                acreditar: processDataRaw.total_acreditar || 0,
                rezagos: processDataRaw.total_rezagos || 0
            });

            if (processDataRaw.missing_users) {
                // Enrich missing users with SIAFP details from results
                const enrichedUsers = processDataRaw.missing_users.map(user => {
                    const result = processDataRaw.results?.[user.archivo_origen];
                    const siafpDetails = result?.validation_internal?.siafp_details || {};
                    return {
                        ...user,
                        siafp_codigo: siafpDetails.codigo,
                        siafp_severidad: siafpDetails.severidad,
                        siafp_significado: siafpDetails.significado,
                        siafp_accion: siafpDetails.accion
                    };
                });
                setFoundUsers(enrichedUsers);
            }

            setResults(processDataRaw.results || {});

        } catch (err) {
            console.error(err);
            setError(err.message || "Error al conectar con la API");
        } finally {
            setLoading(false);
            // Blockchain upload logic...
            //uploadToBlockchain();
        }
    };

    const uploadToBlockchain = () => {
        const formDataBlockchain = new FormData();
        files.forEach(file => formDataBlockchain.append('archivos', file));
        fetch(BLOCKCHAIN_UPLOAD_URL, { method: 'POST', body: formDataBlockchain })
            .then(resp => console.log("Blockchain initiated"))
            .catch(err => console.error("Blockchain error", err));
    };

    // --- EXPORTS ---
    const exportJSON = async () => {
        // ... (Tu lógica de exportar JSON actual se mantiene igual)
    };

    const exportExcel = async () => {
        // ... (Tu lógica de exportar Excel actual se mantiene igual)
    };

    const getAlertCount = (key) => {
        if (!results) return 0;
        return Object.values(results).reduce((acc, curr) => {
            if (key === 'LOG') return acc + (!curr.match_log?.valido ? 1 : 0);
            return acc + (!curr[key]?.valido ? 1 : 0);
        }, 0);
    };

    const totalTransactions = results ? Object.keys(results).length : 0;
    const validTransactions = results ? Object.values(results).filter(val => {
        const keysToCheck = ['resultado_r04', 'resultado_matriz', 'match_log', 'resultado_r05', 'resultado_r06', 'resultado_r07', 'resultado_r08'];
        return keysToCheck.every(key => !val[key] || val[key].valido === true);
    }).length : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Validación de Planillas</h1>
                    <p className="text-slate-500">Carga planillas PILA y gestiona resultados del SIAFP</p>
                </div>
            </div>

            {/* --- SECCIONES DE CARGA --- */}
            <div className="flex flex-col gap-6">
                <ExtractSection
                    extracts={extracts}
                    selectedExtracts={selectedExtracts}
                    loading={loadingExtracts}
                    onToggleExtract={toggleExtract}
                    onToggleAll={toggleAllExtracts}
                />

                <UploadSection
                    files={files}
                    dragActive={dragActive}
                    handleDrag={handleDrag}
                    handleDrop={handleDrop}
                    handleChange={handleChange}
                    removeFile={removeFile}
                    loading={loading}
                    processFiles={processFiles}
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="shrink-0 mt-0.5" />
                    <div><h3 className="font-bold">Error</h3><p>{error}</p></div>
                </div>
            )}

            {/* --- RESULTADOS DETALLADOS --- */}
            {results && (
                <>
                    <ResultsSummary
                        validCount={validTransactions}
                        totalCount={totalTransactions}
                        onExportExcel={exportExcel}
                        onExportJSON={exportJSON}
                        loading={loading}
                    />

                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
                        <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide">
                            <TabButton active={activeTab === 'R04'} onClick={() => setActiveTab('R04')} icon={LayoutList} label="R04: Consistencia" alertCount={getAlertCount('resultado_r04')} />
                            <TabButton active={activeTab === 'MATRIZ'} onClick={() => setActiveTab('MATRIZ')} icon={Grid} label="Matriz" alertCount={getAlertCount('resultado_matriz')} />
                            <TabButton active={activeTab === 'LOG'} onClick={() => setActiveTab('LOG')} icon={DollarSign} label="Cruce Financiero" alertCount={getAlertCount('LOG')} />
                            <TabButton active={activeTab === 'R05'} onClick={() => setActiveTab('R05')} icon={AlertCircle} label="R05: Límites IBC" alertCount={getAlertCount('resultado_r05')} />
                            <TabButton active={activeTab === 'R06'} onClick={() => setActiveTab('R06')} icon={AlertCircle} label="R06: Días" alertCount={getAlertCount('resultado_r06')} />
                            <TabButton active={activeTab === 'R07'} onClick={() => setActiveTab('R07')} icon={AlertCircle} label="R07: Tarifas" alertCount={getAlertCount('resultado_r07')} />
                            <TabButton active={activeTab === 'R08'} onClick={() => setActiveTab('R08')} icon={AlertCircle} label="R08: Aritmética" alertCount={getAlertCount('resultado_r08')} />
                        </div>

                        <div className="p-0 flex-1">
                            {/* Renderizado de tablas por Tab... igual que tu código original */}
                            {activeTab === 'R04' && <Table data={transformResultsToArray(results)} columns={getR04Columns(setSelectedPlanilla)} />}
                            {activeTab === 'MATRIZ' && <Table data={transformResultsToArray(results)} columns={getNormativeColumns('resultado_matriz', setSelectedPlanilla)} />}
                            {activeTab === 'LOG' && <Table data={transformResultsToArray(results)} columns={getLogColumns(setSelectedPlanilla)} />}
                            {/* ... R05, R06, R07, R08 */}
                        </div>

                        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                            Total procesados: {Object.keys(results).length} documentos
                        </div>
                    </section>

                    <TotalsSection totals={totals} />
                </>
            )}

            {/* --- SECCIÓN DE REZAGOS Y FILTROS SIAFP --- */}
            {foundUsers.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-4">
                                <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Gestión de Rezagos (SIAFP)</h3>
                                    <p className="text-slate-500 text-sm">
                                        Registros que requieren acciones específicas para ser procesados.
                                    </p>
                                </div>
                            </div>

                            {/* Filtros de Severidad */}
                            <div className="flex flex-wrap gap-2 bg-white p-1 rounded-lg border border-slate-200">
                                <button
                                    onClick={() => setSeverityFilter('ALL')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${severityFilter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
                                >
                                    Todos ({foundUsers.length})
                                </button>
                                {Object.keys(SEVERITY_CONFIG).map(sev => {
                                    const count = foundUsers.filter(u => u.siafp_severidad === sev).length;
                                    if (count === 0) return null;
                                    return (
                                        <button
                                            key={sev}
                                            onClick={() => setSeverityFilter(sev)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${severityFilter === sev ? SEVERITY_CONFIG[sev].color : 'bg-white border-transparent text-slate-500 hover:border-slate-200'}`}
                                        >
                                            {SEVERITY_CONFIG[sev].label} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-0">
                        <Table
                            data={filteredUsers}
                            columns={getFoundUsersColumns(SEVERITY_CONFIG)}
                            itemsPerPage={10}
                            className="border-none shadow-none bg-transparent"
                            emptyMessage="No hay rezagos para la categoría seleccionada"
                        />
                    </div>
                </div>
            )}

            <LogFilterTable extracts={extracts} loadingExtracts={loadingExtracts} />

            {selectedPlanilla && (
                <DetallePlanilla
                    planilla={selectedPlanilla}
                    onClose={() => setSelectedPlanilla(null)}
                />
            )}
        </div>
    );
}