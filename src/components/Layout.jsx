import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutList, FileSpreadsheet, Activity, Blocks, Users, AlertCircle, DollarSign } from 'lucide-react';

export default function Layout() {
    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-3">
                                <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-200 shadow-lg">
                                    <Activity size={20} />
                                </div>
                                <span className="font-bold text-slate-800 text-lg">Validador</span>
                            </div>
                            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <LayoutList size={18} className="mr-2" />
                                    Validación Planillas
                                </NavLink>
                                <NavLink
                                    to="/extractos"
                                    className={({ isActive }) =>
                                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <FileSpreadsheet size={18} className="mr-2" />
                                    Gestión Extractos
                                </NavLink>
                                <NavLink
                                    to="/blockchain"
                                    className={({ isActive }) =>
                                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <Blocks size={18} className="mr-2" />
                                    Blockchain
                                </NavLink>
                                <NavLink
                                    to="/rezagos"
                                    className={({ isActive }) =>
                                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <AlertCircle size={18} className="mr-2" />
                                    Correccion Errores
                                </NavLink>
                                <NavLink
                                    to="/conciliaciones"
                                    className={({ isActive }) =>
                                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <DollarSign size={18} className="mr-2" />
                                    Acreditable
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
                <Outlet />
            </main>
        </div>
    );
}
