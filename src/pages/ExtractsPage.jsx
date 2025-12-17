import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Loader2, Plus, Calendar, FileSpreadsheet, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function ExtractsPage() {
    const [extracts, setExtracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    
    // Ref to prevent double fetching
    const hasFetched = useRef(false);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        file: null
    });

    useEffect(() => {
        // Prevent double fetch in React Strict Mode
        if (hasFetched.current) return;
        hasFetched.current = true;
        
        fetchExtracts();
    }, []);

    const fetchExtracts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/extractos`);
            if (!response.ok) throw new Error('Error al cargar extractos');
            const data = await response.json();
            setExtracts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.file || !formData.nombre) return;

        setUploading(true);
        setError(null);

        const data = new FormData();
        data.append('file', formData.file);
        data.append('nombre', formData.nombre);
        data.append('descripcion', formData.descripcion);

        try {
            const response = await fetch(`${API_URL}/extractos/upload`, {
                method: 'POST',
                body: data
            });

            if (!response.ok) throw new Error('Error al subir el extracto');

            // Reset the ref to allow fetching updated data
            hasFetched.current = false;
            await fetchExtracts();
            hasFetched.current = true;
            
            setShowForm(false);
            setFormData({ nombre: '', descripcion: '', file: null });
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestión de Extractos</h1>
                    <p className="text-slate-500">Administra los extractos bancarios para conciliación</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                    {showForm ? 'Cancelar' : <><Plus size={20} /> Nuevo Extracto</>}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">Subir Nuevo Extracto</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ej: Extracto Enero 2024"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <input
                                    type="text"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Archivo (.xlsx, .csv)</label>
                            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors text-center">
                                <input
                                    type="file"
                                    accept=".xlsx,.csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <Upload className="text-slate-400" size={24} />
                                    <span className="text-sm text-slate-600">
                                        {formData.file ? formData.file.name : 'Seleccionar archivo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {uploading ? <><Loader2 size={18} className="animate-spin" /> Subiendo...</> : 'Guardar Extracto'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center text-slate-400">
                        <Loader2 size={32} className="animate-spin" />
                    </div>
                ) : extracts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <FileSpreadsheet size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No hay extractos cargados aún.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Nombre</th>
                                    <th className="px-6 py-3 font-medium">Descripción</th>
                                    <th className="px-6 py-3 font-medium">Fecha Creación</th>
                                    <th className="px-6 py-3 font-medium text-right">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {extracts.map((extract) => (
                                    <tr key={extract.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-900 flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded text-blue-600">
                                                <FileText size={16} />
                                            </div>
                                            {extract.nombre}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">{extract.descripcion || '-'}</td>
                                        <td className="px-6 py-3 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(extract.fechaCreacion).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-400 font-mono text-xs">
                                            #{extract.id}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}