import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutList, FileSpreadsheet, Menu, X, Activity } from 'lucide-react';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col z-20
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          absolute md:relative h-full shadow-lg md:shadow-none
        `}
            >
                <div className="p-4 flex items-center justify-between border-b border-slate-100 h-16">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
                        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-200 shadow-lg shrink-0">
                            <Activity size={20} />
                        </div>
                        {isSidebarOpen && (
                            <span className="font-bold text-slate-800 text-lg truncate">Validador</span>
                        )}
                    </div>
                    {isSidebarOpen && (
                        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLink
                        to="/extractos"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${isActive
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
              ${!isSidebarOpen && 'justify-center'}
              `
                        }
                    >
                        <FileSpreadsheet size={20} className="shrink-0" />
                        {isSidebarOpen && <span>Gestión Extractos</span>}
                    </NavLink>

                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${isActive
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
              ${!isSidebarOpen && 'justify-center'}
              `
                        }
                    >
                        <LayoutList size={20} className="shrink-0" />
                        {isSidebarOpen && <span>Validación Planillas</span>}
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={toggleSidebar}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors
              ${!isSidebarOpen && 'justify-center'}
            `}
                    >
                        <Menu size={20} />
                        {isSidebarOpen && <span className="text-sm">Colapsar menú</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center gap-3">
                    <button onClick={toggleSidebar} className="text-slate-600">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-slate-800">Validador PILA</span>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/20 z-10"
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
}
