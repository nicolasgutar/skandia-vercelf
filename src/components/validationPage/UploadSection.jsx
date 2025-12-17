import React from 'react';
import { Upload, FileText, XCircle, Loader2, FileCheck } from 'lucide-react';

const UploadSection = ({
    files,
    dragActive,
    handleDrag,
    handleDrop,
    handleChange,
    removeFile,
    loading,
    processFiles
}) => {
    return (
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

                        {/* Process Button Only */}
                        <div className="flex justify-end pt-2">
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
    );
};

export default UploadSection;
