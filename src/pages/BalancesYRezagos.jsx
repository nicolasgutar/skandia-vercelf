import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, CheckCircle2, AlertCircle, RefreshCw, Wallet, ArrowRight } from 'lucide-react';

const SALDOS_URL = `${import.meta.env.VITE_API_URL}/saldos-afp`;
const PILAS_URL = `${import.meta.env.VITE_API_URL}/pilas-con-conciliacion`;
const ACREDITAR_URL = `${import.meta.env.VITE_API_URL}/acreditar-cuatrocientos`;

export default function AccreditationPage() {
    const [saldos, setSaldos] = useState([]);
    const [pilas, setPilas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [saldosRes, pilasRes] = await Promise.all([
                fetch(SALDOS_URL),
                fetch(PILAS_URL)
            ]);

            if (!saldosRes.ok || !pilasRes.ok) throw new Error("Error al cargar datos");

            const saldosData = await saldosRes.json();
            const pilasData = await pilasRes.json();

            setSaldos(saldosData);
            // Filter only pending
            setPilas(pilasData.filter(p => p.conciliacion && !p.conciliacion.acreditada));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAcreditar400 = async () => {
        setProcessing(true);
        setError(null);

        // 1. Random delay 3-5 seconds
        const delay = Math.floor(Math.random() * (5000 - 3000 + 1) + 3000);
        await new Promise(resolve => setTimeout(resolve, delay));

        try {
            // 2. Call API
            // Send all pending IDs
            const pendingIds = pilas.map(p => p.id);
            if (pendingIds.length === 0) {
                setProcessing(false);
                return;
            }

            const response = await fetch(ACREDITAR_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pila_ids: pendingIds })
            });

            if (!response.ok) throw new Error("Error al acreditar planillas");

            // 3. Refresh Data
            await fetchData();

        } catch (err) {
            setError(err.message || "Error en acreditación");
        } finally {
            setProcessing(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Panel de Acreditación</h1>
                    <p className="text-slate-500">Gestión de Saldos y Acreditación Masiva</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    title="Recargar datos"
                >
                    <RefreshCw size={20} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle />
                    {error}
                </div>
            )}

            {/* Saldos Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saldos.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet size={64} className="text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{s.fondo}</h3>
                        <div className="text-xs text-slate-400 mb-4">{s.tipo}</div>

                        <div className="space-y-3 relative z-10">
                            <div>
                                <div className="text-xs text-slate-500">Saldo Operacional</div>
                                <div className="text-2xl font-bold text-emerald-600">{formatMoney(s.saldo_operacional)}</div>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                                <div className="text-xs text-slate-500">Rezagos</div>
                                <div className="text-lg font-semibold text-amber-600">{formatMoney(s.saldo_rezagos)}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Planillas Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Pendientes de Acreditación</h2>
                            <p className="text-sm text-slate-500">{pilas.length} planillas validada(s) y pendiente(s)</p>
                        </div>
                    </div>

                    <button
                        onClick={handleAcreditar400}
                        disabled={processing || pilas.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none min-w-[200px] justify-center"
                    >
                        {processing ? (
                            <><Loader2 size={24} className="animate-spin" /> Procesando...</>
                        ) : (
                            <><CheckCircle2 size={24} /> Acreditar con 400</>
                        )}
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {pilas.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-200" />
                            <p>¡Todo al día! No hay planillas pendientes.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Pila ID / Hash</th>
                                    <th className="px-6 py-3">Aportante</th>
                                    <th className="px-6 py-3 text-right">Total Cotización</th>
                                    <th className="px-6 py-3 text-center">Fecha Recepción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pilas.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="font-mono text-xs text-slate-500">{p.hash_pila.substring(0, 16)}...</div>
                                            <div className="text-xs text-slate-400">{p.nombre}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-slate-700">{p.user?.nombre || "N/A"}</div>
                                            <div className="text-xs text-slate-400">{p.userTipoDoc} {p.userNumDoc}</div>
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-medium text-slate-700">
                                            {formatMoney(p.total_cotizacion)}
                                        </td>
                                        <td className="px-6 py-3 text-center text-slate-500">
                                            {new Date(p.fechaCreacion).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pilas.length > 0 && (
                    <div className="bg-slate-50 p-4 text-xs text-center text-slate-500 border-t border-slate-100">
                        Mostrando {pilas.length} registros pendientes
                    </div>
                )}
            </div>
        </div>
    );
}