import React, { useState, useCallback, useEffect } from 'react';
import { AlertTriangle, LayoutList, DollarSign, AlertCircle, Grid } from 'lucide-react';
import DetallePlanilla from '../components/DetallePlanilla';
import TabButton from '../components/TabButton';
import Table from '../components/Table';
import LogFilterTable from '../components/LogFilterTable';
import {
    transformResultsToArray,
    getR04Columns,
    getNormativeColumns,
    getLogColumns
} from '../utils/ValidationPageUtils';
import ExtractSection from '../components/validationPage/ExtractSection';
import UploadSection from '../components/validationPage/UploadSection';
import ResultsSummary from '../components/validationPage/ResultsSummary';

const PROCESS_URL = `${import.meta.env.VITE_API_URL}/procesar-planilla`;
const EXTRACTS_URL = `${import.meta.env.VITE_API_URL}/extractos/`; // Unused but maybe good to keep reference? No, remove if unused.
const EXPORT_URL = `${import.meta.env.VITE_API_URL}/exportar-excel`;

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
            // Default to selecting all or none? Let's select none by default or maybe the most recent.
            // User said: "The user must select at least one extract (or you can default to "All" or the most recent)."
            // Let's default to empty and require selection.
        } catch (err) {
            console.error("Error fetching extracts:", err);
            // Don't block the whole app, just show empty list or error in that section
        } finally {
            setLoadingExtracts(false);
        }
    };

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

    // --- File Handling Handlers ---
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

    // --- API Handler ---
    const processFiles = async () => {
        if (files.length === 0) return;
        if (selectedExtracts.length === 0) {
            setError("Debes seleccionar al menos un extracto para la conciliación.");
            return;
        }

        setLoading(true); setError(null); setResults(null);

        // Prepare FormData for both requests
        const formDataMatch = new FormData();
        files.forEach(file => formDataMatch.append('archivos', file));
        formDataMatch.append('extracto_ids', selectedExtracts.join(','));

        const formDataProcess = new FormData();
        files.forEach(file => formDataProcess.append('archivos', file));

        try {
            // Execute both requests in parallel
            console.log(PROCESS_URL, formDataProcess);
            const [matchResponse, processResponse] = await Promise.all([
                fetch(MATCH_URL, { method: 'POST', body: formDataMatch }),
                fetch(PROCESS_URL, { method: 'POST', body: formDataProcess }),
            ]);

            if (!matchResponse.ok) throw new Error(`Error en validación financiera: ${matchResponse.statusText}`);
            if (!processResponse.ok) throw new Error(`Error en validación normativa: ${processResponse.statusText}`);

            const matchData = await matchResponse.json();
            const processData = await processResponse.json();

            // Merge results
            // Assuming both return objects keyed by filename
            const mergedResults = {};

            // Get all unique filenames from both responses
            const allFiles = new Set([...Object.keys(matchData), ...Object.keys(processData)]);

            allFiles.forEach(filename => {
                mergedResults[filename] = {
                    ...(processData[filename] || {}), // Base validations
                    match_log: matchData[filename]?.match_log || null // Override/Add match_log from match endpoint
                };
            });

            setResults(mergedResults);
        } catch (err) {
            console.error(err);
            setError(err.message || "Error al conectar con la API");
        } finally {
            setLoading(false);
        }
    };

    const exportExcel = async () => {
        if (files.length === 0) return;
        setLoading(true); setError(null);
        const formData = new FormData();
        files.forEach(file => formData.append('archivos', file));
        // Export might not need extracts if it's just exporting the validation results which we already have? 
        // Or does it re-process? The original code re-sent files. 
        // Assuming export endpoint handles it. If it needs extracts, we might need to update it too.
        // For now, leaving as is, but if export depends on the new validation logic, it might need update.
        // The user didn't specify changes to export, so I'll leave it.

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

    // Calculate Stats
    const totalTransactions = results ? Object.keys(results).length : 0;
    const validTransactions = results ? Object.values(results).filter(val => {
        const keysToCheck = [
            'resultado_r04', 'resultado_matriz', 'match_log',
            'resultado_r05', 'resultado_r06', 'resultado_r07', 'resultado_r08'
        ];
        return keysToCheck.every(key => !val[key] || val[key].valido === true);
    }).length : 0;

    // --- Tab Calculation ---
    const getAlertCount = (key) => {
        if (!results) return 0;
        return Object.values(results).reduce((acc, curr) => {
            if (key === 'LOG') return acc + (!curr.match_log?.valido ? 1 : 0);
            return acc + (!curr[key]?.valido ? 1 : 0);
        }, 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Validación de Planillas</h1>
                    <p className="text-slate-500">Carga planillas PILA y selecciona extractos para conciliar</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Extract Selection */}
                <ExtractSection
                    extracts={extracts}
                    selectedExtracts={selectedExtracts}
                    loading={loadingExtracts}
                    onToggleExtract={toggleExtract}
                    onToggleAll={toggleAllExtracts}
                />

                {/* Upload Section */}
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

            {/* Detailed Results Section */}
            {/* Detailed Results Section */}
            {results && (
                <>
                    <ResultsSummary
                        validCount={validTransactions}
                        totalCount={totalTransactions}
                        onExportExcel={exportExcel}
                        loading={loading}
                    />
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
                        {/* Tabs */}
                        <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide">
                            <TabButton
                                active={activeTab === 'R04'}
                                onClick={() => setActiveTab('R04')}
                                icon={LayoutList}
                                label="R04: Consistencia"
                                alertCount={getAlertCount('resultado_r04')}
                            />
                            <TabButton
                                active={activeTab === 'MATRIZ'}
                                onClick={() => setActiveTab('MATRIZ')}
                                icon={Grid}
                                label="Matriz"
                                alertCount={getAlertCount('resultado_matriz')}
                            />
                            <TabButton
                                active={activeTab === 'LOG'}
                                onClick={() => setActiveTab('LOG')}
                                icon={DollarSign}
                                label="Cruce Financiero"
                                alertCount={getAlertCount('LOG')}
                            />
                            <TabButton
                                active={activeTab === 'R05'}
                                onClick={() => setActiveTab('R05')}
                                icon={AlertCircle}
                                label="R05: Límites IBC"
                                alertCount={getAlertCount('resultado_r05')}
                            />
                            <TabButton
                                active={activeTab === 'R06'}
                                onClick={() => setActiveTab('R06')}
                                icon={AlertCircle}
                                label="R06: Días Cotizados"
                                alertCount={getAlertCount('resultado_r06')}
                            />
                            <TabButton
                                active={activeTab === 'R07'}
                                onClick={() => setActiveTab('R07')}
                                icon={AlertCircle}
                                label="R07: Tarifas"
                                alertCount={getAlertCount('resultado_r07')}
                            />
                            <TabButton
                                active={activeTab === 'R08'}
                                onClick={() => setActiveTab('R08')}
                                icon={AlertCircle}
                                label="R08: Aritmética"
                                alertCount={getAlertCount('resultado_r08')}
                            />
                        </div>

                        {/* Table Content */}
                        <div className="p-0 flex-1">
                            {activeTab === 'R04' && <Table
                                data={transformResultsToArray(results)}
                                columns={getR04Columns(setSelectedPlanilla)}
                                emptyMessage="No hay resultados de consistencia R04"
                            />}
                            {activeTab === 'MATRIZ' && <Table
                                data={transformResultsToArray(results)}
                                columns={getNormativeColumns('resultado_matriz', setSelectedPlanilla)}
                                emptyMessage="No hay resultados normativos"
                            />}
                            {activeTab === 'LOG' && <Table
                                data={transformResultsToArray(results)}
                                columns={getLogColumns(setSelectedPlanilla)}
                                emptyMessage="No hay resultados de cruce financiero"
                            />}
                            {activeTab === 'R05' && <Table
                                data={transformResultsToArray(results)}
                                columns={getNormativeColumns('resultado_r05', setSelectedPlanilla)}
                            />}
                            {activeTab === 'R06' && <Table
                                data={transformResultsToArray(results)}
                                columns={getNormativeColumns('resultado_r06', setSelectedPlanilla)}
                            />}
                            {activeTab === 'R07' && <Table
                                data={transformResultsToArray(results)}
                                columns={getNormativeColumns('resultado_r07', setSelectedPlanilla)}
                            />}
                            {activeTab === 'R08' && <Table
                                data={transformResultsToArray(results)}
                                columns={getNormativeColumns('resultado_r08', setSelectedPlanilla)}
                            />}
                        </div>

                        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                            Total procesados: {Object.keys(results).length} documentos
                        </div>
                    </section>
                </>
            )
            }

            {/* Log Filter Table */}
            <LogFilterTable extracts={extracts} loadingExtracts={loadingExtracts} />

            {
                selectedPlanilla && (
                    <DetallePlanilla
                        planilla={selectedPlanilla}
                        onClose={() => setSelectedPlanilla(null)}
                    />
                )
            }
        </div >
    );
}
