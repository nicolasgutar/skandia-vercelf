import React, { useState, useCallback } from 'react';
import { Upload, FileText, Activity, Loader2, FileCheck, XCircle, AlertTriangle, LayoutList, DollarSign, AlertCircle, Grid, FileSpreadsheet } from 'lucide-react';
import DetallePlanilla from './components/DetallePlanilla';
import TabButton from './components/TabButton';
import R04Table from './components/R04Table';
import LogTable from './components/LogTable';
import NormativeTable from './components/NormativeTable';
import LogFilterTable from './components/LogFilterTable';

const API_URL = "https://pila-validator-api-103266832139.us-central1.run.app/procesar-planilla";
const EXPORT_URL = "https://pila-validator-api-103266832139.us-central1.run.app/exportar-excel";

export default function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('R04');
  const [selectedPlanilla, setSelectedPlanilla] = useState(null);

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
    setLoading(true); setError(null); setResults(null);
    const formData = new FormData();
    files.forEach(file => formData.append('archivos', file));

    try {
      const response = await fetch(API_URL, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);
      const data = await response.json();
      setResults(data);
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

  // --- Tab Calculation ---
  const getAlertCount = (key) => {
    if (!results) return 0;
    return Object.values(results).reduce((acc, curr) => {
      if (key === 'LOG') return acc + (!curr.match_log?.valido ? 1 : 0);
      return acc + (!curr[key]?.valido ? 1 : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-200 shadow-lg">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Validador PILA</h1>
            <p className="text-xs text-slate-500">Validación financiera y normativa detallada</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Upload Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
              <Upload size={20} className="text-blue-600" />
              Cargar Planillas
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
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Archivos ({files.length})</div>
                  <div className="flex gap-2">
                    <button
                      onClick={exportExcel}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <FileSpreadsheet size={18} /> Exportar Excel
                    </button>
                    <button
                      onClick={processFiles}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <><Loader2 size={18} className="animate-spin" /> Procesando...</> : <><FileCheck size={18} /> Procesar</>}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-100 pl-3 pr-2 py-1.5 rounded-full border border-slate-200 text-sm">
                      <span className="truncate max-w-[150px] text-slate-700">{file.name}</span>
                      <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" />
            <div><h3 className="font-bold">Error</h3><p>{error}</p></div>
          </div>
        )}

        {/* Detailed Results Section */}
        {results && (
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

        {/* Log Filter Table */}
        <LogFilterTable />

        {selectedPlanilla && (
          <DetallePlanilla
            planilla={selectedPlanilla}
            onClose={() => setSelectedPlanilla(null)}
          />
        )}
      </main>
    </div>
  );
}
