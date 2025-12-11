import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, Loader2, FileCheck, XCircle, AlertTriangle, LayoutList, DollarSign, AlertCircle, Grid, FileSpreadsheet, CheckSquare, Square, UserPlus } from 'lucide-react';
import DetallePlanilla from '../components/DetallePlanilla';
import TabButton from '../components/TabButton';
import R04Table from '../components/R04Table';
import LogTable from '../components/LogTable';
import NormativeTable from '../components/NormativeTable';
import LogFilterTable from '../components/LogFilterTable';

// --- ENDPOINTS ---
const MATCH_URL = `${import.meta.env.VITE_API_URL}/log-match-bd`;
const PROCESS_URL = `${import.meta.env.VITE_API_URL}/procesar-planilla`; // Original endpoint
const EXTRACTS_URL = `${import.meta.env.VITE_API_URL}/extractos/`;
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

    // --- STATE: Missing Users (Simulated) ---
    const [foundUsers, setFoundUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);

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

        setLoading(true); setError(null); setResults(null);
        setFoundUsers([]); setShowUserModal(false);

        const formDataMatch = new FormData();
        files.forEach(file => formDataMatch.append('archivos', file));
        formDataMatch.append('extracto_ids', selectedExtracts.join(','));

        const formDataProcess = new FormData();
        files.forEach(file => formDataProcess.append('archivos', file));

        try {
            // Parallel Fetch
            const [matchResponse, processResponse] = await Promise.all([
                fetch(MATCH_URL, { method: 'POST', body: formDataMatch }),
                fetch(PROCESS_URL, { method: 'POST', body: formDataProcess }),
            ]);

            if (!matchResponse.ok) throw new Error(`Error en validación financiera: ${matchResponse.statusText}`);
            if (!processResponse.ok) throw new Error(`Error en validación normativa: ${processResponse.statusText}`);

            const matchData = await matchResponse.json(); // Dict: { filename: { match_log: ... } }
            const processData = await processResponse.json(); // Dict: { filename: { parsing_exitoso: ... } }

            // --- SIMULATE User Detection from Parser Results ---
            const detectedUsers = [];
            const resultKeys = Object.keys(processData);

            resultKeys.forEach(filename => {
                const item = processData[filename];
                if (item.parsing_exitoso && item.raw_parser_output && item.raw_parser_output.tipo1) {
                    const t1 = item.raw_parser_output.tipo1;
                    if (t1.num_doc_aportante && t1.razon_social_aportante) {
                        // Avoid duplicates if needed, or show per file
                        detectedUsers.push({
                            num_documento: t1.num_doc_aportante,
                            tipo_documento: t1.tipo_doc_aportante,
                            nombre: t1.razon_social_aportante,
                            filename: filename
                        });
                    }
                }
            });

            // Logic: Always show modal if users found (per user request)
            if (detectedUsers.length > 0) {
                setFoundUsers(detectedUsers);
                setShowUserModal(true);
            }

            // Merge results
            const mergedResults = {};
            const allFiles = new Set([...Object.keys(matchData), ...Object.keys(processData)]);

            allFiles.forEach(filename => {
                mergedResults[filename] = {
                    ...(processData[filename] || {}), // Parsing/Validation results
                    match_log: matchData[filename]?.match_log || null // Financial match
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

    const handleConfirmUsers = () => {
        // Just close the modal since we can't create them in DB
        setShowUserModal(false);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Validación de Planillas</h1>
                    <p className="text-slate-500">Carga planillas PILA y selecciona extractos para conciliar</p>
                </div>
            </div>

            {/* --- USER INFO MODAL (Simulated) --- */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 text-blue-600 mb-4">
                            <AlertTriangle size={32} />
                            <h2 className="text-xl font-bold text-slate-800">Usuarios No Registrados Detectados</h2>
                        </div>

                        <p className="text-slate-600 mb-4">
                            Se han encontrado usuarios en las planillas que aun no estaban registrados en base de datos. ¿Desea crearlos y proceder?
                        </p>

                        <div className="bg-slate-50 rounded-lg border border-slate-200 max-h-[300px] overflow-y-auto mb-6">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-2">Documento</th>
                                        <th className="px-4 py-2">Razón Social / Nombre</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {foundUsers.map((u, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 font-mono text-slate-600">{u.tipo_documento} {u.num_documento}</td>
                                            <td className="px-4 py-2 font-medium text-slate-800">{u.nombre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                            >
                                Denegar
                            </button>
                            <button
                                onClick={handleConfirmUsers}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm"
                            >
                                <UserPlus size={18} />
                                Aceptar y Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-6">
                {/* Extract Selection */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <DollarSign size={20} className="text-blue-600" />
                            Seleccionar Extractos
                        </h2>
                        <button
                            onClick={toggleAllExtracts}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                            {selectedExtracts.length === extracts.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </button>
                    </div>

                    <div className="p-4 max-h-[300px] overflow-y-auto">
                        {loadingExtracts ? (
                            <div className="p-8 flex justify-center text-slate-400">
                                <Loader2 size={24} className="animate-spin" />
                            </div>
                        ) : extracts.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No hay extractos disponibles.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {extracts.map(extract => (
                                    <div
                                        key={extract.id}
                                        onClick={() => toggleExtract(extract.id)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3
                      ${selectedExtracts.includes(extract.id)
                                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                            }
                    `}
                                    >
                                        <div className={`mt-0.5 ${selectedExtracts.includes(extract.id) ? 'text-blue-600' : 'text-slate-300'}`}>
                                            {selectedExtracts.includes(extract.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-base text-slate-900 truncate">{extract.nombre}</div>
                                            <div className="text-sm text-slate-500 truncate">{extract.descripcion || 'Sin descripción'}</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {new Date(extract.fecha_creacion).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-sm text-center text-slate-500 font-medium">
                        {selectedExtracts.length} extractos seleccionados
                    </div>
                </section>

                {/* Upload Section */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                            <Upload size={20} className="text-blue-600" />
                            Cargar Archivos PILA
                        </h2>

                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 transition-colors text-center ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                                }`}
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        >
                            <input type="file" multiple accept=".txt" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-3 pointer-events-none">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700">Arrastra archivos aquí o haz clic</p>
                                    <p className="text-sm text-slate-500 mt-1">Soporta múltiples archivos .txt</p>
                                </div>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Archivos ({files.length})</div>
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-slate-100 pl-3 pr-2 py-1.5 rounded-full border border-slate-200 text-sm">
                                            <span className="truncate max-w-[150px] text-slate-700">{file.name}</span>
                                            <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={exportExcel}
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <FileSpreadsheet size={18} /> Exportar
                                    </button>
                                    <button
                                        onClick={() => processFiles()}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <><Loader2 size={18} className="animate-spin" /> Procesando...</> : <><FileCheck size={18} /> Conciliar</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="shrink-0 mt-0.5" />
                    <div><h3 className="font-bold">Error</h3><p>{error}</p></div>
                </div>
            )}

            {results && (
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
                        {activeTab === 'R04' && <R04Table results={results} onViewDetail={setSelectedPlanilla} />}
                        {activeTab === 'MATRIZ' && <NormativeTable results={results} validationKey="resultado_matriz" onViewDetail={setSelectedPlanilla} />}
                        {activeTab === 'LOG' && <LogTable results={results} onViewDetail={setSelectedPlanilla} />}
                        {activeTab === 'R05' && <NormativeTable results={results} validationKey="resultado_r05" onViewDetail={setSelectedPlanilla} />}
                        {activeTab === 'R06' && <NormativeTable results={results} validationKey="resultado_r06" onViewDetail={setSelectedPlanilla} />}
                        {activeTab === 'R07' && <NormativeTable results={results} validationKey="resultado_r07" onViewDetail={setSelectedPlanilla} />}
                        {activeTab === 'R08' && <NormativeTable results={results} validationKey="resultado_r08" onViewDetail={setSelectedPlanilla} />}
                    </div>

                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                        Total procesados: {Object.keys(results).length} documentos
                    </div>
                </section>
            )}

            <LogFilterTable />

            {selectedPlanilla && (
                <DetallePlanilla
                    planilla={selectedPlanilla}
                    onClose={() => setSelectedPlanilla(null)}
                />
            )}
        </div>
    );
}