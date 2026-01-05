import React from 'react';
import { X, Mail, Send, User, ChevronRight } from 'lucide-react';
import skandiaLogo from '../assets/skandia.png';

export default function EmailActionModal({ isOpen, onClose, onSend, template, errorCode }) {
    if (!isOpen || !template) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
                {/* Header: Modal Navigation */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Mail size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Nueva Notificación</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Real Email Mockup Header */}
                    <div className="p-6 bg-slate-50/50 space-y-4 border-b border-slate-100">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 w-12 uppercase">De:</span>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-sm shadow-sm">
                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">S</div>
                                    <span className="font-semibold text-slate-700">Skandia Validaciones</span>
                                    <span className="text-slate-400 text-xs italic">&lt;notificaciones@skandia.com.co&gt;</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 w-12 uppercase">Para:</span>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-sm shadow-sm">
                                    <User size={14} className="text-slate-400" />
                                    <span className="font-semibold text-slate-700">Entidad / Aportante</span>
                                    <span className="text-slate-400 text-xs italic">&lt;contacto@tercero.com.co&gt;</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <h2 className="text-xl font-bold text-slate-800 leading-tight">
                                {template.subject}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold border border-red-200 uppercase">
                                    Error SIAFP {errorCode}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Prioridad Alta</span>
                            </div>
                        </div>
                    </div>

                    {/* Email Content Body */}
                    <div className="p-8 space-y-8 bg-white">
                        {/* Skandia Brand Logo */}
                        <div className="flex justify-start">
                            <img src={skandiaLogo} alt="Skandia Logo" className="h-10 object-contain" />
                        </div>

                        <div className="space-y-6 text-slate-700 leading-relaxed font-sans border-l-2 border-slate-100 pl-6">
                            {template.body.split('\n').map((line, i) => (
                                <p key={i} className={line.trim() === "" ? "h-2" : ""}>
                                    {line}
                                </p>
                            ))}
                        </div>

                        {/* Footer Signature */}
                        <div className="pt-8 border-t border-slate-50">
                            <p className="text-sm font-bold text-slate-800">Departamento de Gestión de Rezagos</p>
                            <p className="text-xs text-slate-400 mt-1 italic">Proceso Automatizado de Conciliación Skandia</p>
                        </div>
                    </div>
                </div>

                {/* Footer: Action Buttons */}
                <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/80">
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 text-[11px] font-medium max-w-sm">
                        <span className="font-bold shrink-0">Info:</span>
                        <p>Al confirmar el envío, el registro se marcará como gestionado y se cerrará esta tarea.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all"
                        >
                            Descartar
                        </button>
                        <button
                            onClick={onSend}
                            className="flex-1 md:flex-none px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 transition-all"
                        >
                            <Send size={18} />
                            Enviar Notificación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
