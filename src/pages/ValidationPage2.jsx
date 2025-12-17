import React, { useState, useCallback, useEffect } from 'react';
import {
    AlertTriangle, LayoutList, DollarSign, AlertCircle, Grid
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
import { getFoundUsersColumns } from '../utils/ValidationPage2Utils';
import ExtractSection from '../components/validationPage/ExtractSection';
import UploadSection from '../components/validationPage/UploadSection';
import TotalsSection from '../components/validationPage/TotalsSection';
import UserAlertModal from '../components/validationPage/UserAlertModal';
import DetallePlanilla from '../components/DetallePlanilla';
import ResultsSummary from '../components/validationPage/ResultsSummary';
// --- ENDPOINTS ---
const PROCESS_URL = `${import.meta.env.VITE_API_URL}/procesar-planilla-2`; // MIGRATED TO V2
const EXPORT_URL = `${import.meta.env.VITE_API_URL}/exportar-excel`;
const EXTRACTS_URL = `${import.meta.env.VITE_API_URL}/extractos/`; // Unused but maybe good to keep reference? No, remove if unused.
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
    // --- STATE: Missing Users & Totals ---
    const [foundUsers, setFoundUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [totals, setTotals] = useState({ acreditar: 0, rezagos: 0 }); // NEW STATE FOR TOTALS
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
        setLoading(true);
        setError(null);
        setResults(null);
        setFoundUsers([]);
        setShowUserModal(false);
        setTotals({ acreditar: 0, rezagos: 0 });
        const formDataProcess = new FormData();
        files.forEach(file => formDataProcess.append('archivos', file));

        // Match the backend definition: extractoIds (camelCase)
        // Sending as JSON string is robust for the new backend parser
        formDataProcess.append('extractoIds', JSON.stringify(selectedExtracts));
        try {
            // Single Request to PROCESS_URL
            const processResponse = await fetch(PROCESS_URL, { method: 'POST', body: formDataProcess });
            if (!processResponse.ok) {
                throw new Error(`Error en validación: ${processResponse.statusText}`);
            }
            const processDataRaw = await processResponse.json();
            console.log(processDataRaw, "processDataRaw");
            // Extract logic from V2 response
            // The backend now populates match_log within 'results' when extractoIds are provided
            const processDataDict = processDataRaw.results || {};
            const missingUsersList = processDataRaw.missing_users || [];
            const totalAcreditar = processDataRaw.total_acreditar || 0;
            const totalRezagos = processDataRaw.total_rezagos || 0;
            // Set Totals
            setTotals({ acreditar: totalAcreditar, rezagos: totalRezagos });
            // Handle Missing Users (from API)
            if (missingUsersList.length > 0) {
                setFoundUsers(missingUsersList);
                setShowUserModal(true);
            }
            // No need to merge separate match results anymore
            setResults(processDataDict);


        } catch (err) {
            console.error(err);
            setError(err.message || "Error al conectar con la API");
        } finally {
            setLoading(false);

            // --- BLOCKCHAIN UPLOAD (Async) ---
            // Trigger upload to blockchain endpoint without blocking UI or waiting for it
            // User requested "on a finally block" style but "user doesn't wait".
            // We do it here on success of the main process.
            const formDataBlockchain = new FormData();
            files.forEach(file => formDataBlockchain.append('archivos', file));

            fetch(BLOCKCHAIN_UPLOAD_URL, {
                method: 'POST',
                body: formDataBlockchain
            }).then(resp => {
                if (!resp.ok) console.warn("Blockchain upload failed:", resp.statusText);
                else console.log("Blockchain upload initiated successfully");
            }).catch(err => {
                console.error("Blockchain upload error:", err);
            });
        }
    };
    const handleConfirmUsers = () => {
        // Just close the modal since we can't create them in DB or the logic is not fully specified for creation flow here
        setShowUserModal(false);
    };
    const exportJSON = async () => {
        if (files.length === 0 || !results) return;
        setLoading(true); setError(null);

        // Filter files that passed ALL validations
        const validFilenames = Object.entries(results).filter(([filename, val]) => {
            // Check all validation keys provided in 'val'
            // Assuming 'valido' property on each result object implies pass
            // We need to check: R04, Matriz, LogMatch, R05, R06, R07, R08?
            // Let's check the structure. Usually 'valido' is on the top-level of specific result objects
            // Looking at utils/ValidationPageUtils.jsx, we access row.resultado_r04?.valido, row.resultado_matriz?.valido, etc.
            // Also row.match_log?.valido.

            // List of keys to check for validity:
            const keysToCheck = [
                'resultado_r04',
                'resultado_matriz',
                'match_log',
                'resultado_r05',
                'resultado_r06',
                'resultado_r07',
                'resultado_r08'
            ];

            // If any key exists and is NOT valid, then fail.
            // If key is missing, is it valid or invalid? Assume missing key = skip or passed?
            // Usually if result exists it returns the key.
            return keysToCheck.every(key => {
                if (!val[key]) return true; // If validation not present, ignore? Or maybe it wasn't run?
                // For log match, key is match_log
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
            // Create a blob from the JSON data and trigger download
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "extraccion_400_validos.json";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            setError(err.message || "Error al exportar JSON");
        } finally {
            setLoading(false);
        }
    };
    const exportExcel = async () => {
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
    const getAlertCount = (key) => {
        if (!results) return 0;
        return Object.values(results).reduce((acc, curr) => {
            if (key === 'LOG') return acc + (!curr.match_log?.valido ? 1 : 0);
            return acc + (!curr[key]?.valido ? 1 : 0);
        }, 0);
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
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Validación de Planillas</h1>
                    <p className="text-slate-500">Carga planillas PILA y selecciona extractos para conciliar</p>
                </div>
            </div>
            {/* --- USER ALERT MODAL --- */}
            {/* --- USER ALERT MODAL --- */}
            <UserAlertModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                users={foundUsers}
            />
            {/* --- SECTIONS --- */}
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
                    <TotalsSection totals={totals} />
                </>
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