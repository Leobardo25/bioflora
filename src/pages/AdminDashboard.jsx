import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, Menu, X, LogOut, Users, Sun, Moon, ArrowLeftRight, Sliders, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminThemeProvider, useAdminTheme } from '../context/AdminThemeContext';
import AdminAIChat from '../features/admin/AdminAIChat';
import Logo from '../components/ui/Logo';

const NAV_ITEMS = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/inventory', label: 'Catálogo', icon: Package },
    { to: '/admin/movements', label: 'Entradas/Salidas', icon: ArrowLeftRight },
    { to: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    { to: '/admin/customers', label: 'Clientes', icon: Users },
    { to: '/admin/landing', label: 'Configuración', icon: Settings },
];

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('admin_sidebar_collapsed');
        return saved === 'true';
    });
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, logout } = useAuth();
    const { dark, toggle } = useAdminTheme();

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const adminName = userData?.nombre || userData?.email || 'Admin';
    const cleanStoreName = 'BIOFLORA';
    const firstName = adminName.split(' ')[0];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#111113] text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-300">

            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/50 dark:bg-black/70 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-[#1A1A1B] border-r border-gray-200 dark:border-white/5 shadow-xl transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } ${
                sidebarCollapsed ? 'w-64 md:w-20' : 'w-64 md:w-64'
            } md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none`}>

                <div className={`h-16 flex items-center ${
                    sidebarCollapsed ? 'flex-col justify-center gap-1 py-2 px-2' : 'justify-between px-5'
                } border-b border-gray-100 dark:border-white/5`}>
                    {sidebarCollapsed ? (
                        <button
                            type="button"
                            onClick={() => {
                                const newVal = !sidebarCollapsed;
                                setSidebarCollapsed(newVal);
                                localStorage.setItem('admin_sidebar_collapsed', String(newVal));
                            }}
                            className="w-10 h-10 rounded-xl bg-bioflora-verde/10 hover:bg-bioflora-verde/20 flex items-center justify-center font-black text-bioflora-verde transition-all active:scale-95 shadow-sm cursor-pointer"
                            title="Expandir menú"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <>
                            <Link to="/" className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap h-12">
                                <Logo className="h-10 w-auto" />
                                <span className="text-[10px] font-sans tracking-widest text-gray-400 dark:text-gray-500 mt-1 font-bold">ADMIN</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    const newVal = !sidebarCollapsed;
                                    setSidebarCollapsed(newVal);
                                    localStorage.setItem('admin_sidebar_collapsed', String(newVal));
                                }}
                                className="hidden md:flex p-1.5 text-gray-400 hover:text-bioflora-verde hover:bg-bioflora-verde/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                                title="Colapsar menú"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 md:hidden rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto scrollbar-admin px-3 py-5">
                    {!sidebarCollapsed && (
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-3 mb-3 whitespace-nowrap overflow-hidden">Gestión</p>
                    )}
                    <ul className="space-y-1">
                        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    end={end}
                                    title={sidebarCollapsed ? label : undefined}
                                    className={({ isActive }) =>
                                        `flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-bioflora-verde/10 dark:bg-bioflora-verde/15 text-bioflora-verde shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`
                                    }
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="truncate">{label}</span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

            </aside>

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="sticky top-0 z-10 bg-white dark:bg-[#1A1A1B] border-b border-gray-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="hidden sm:block">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Administración
                                </p>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {(() => {
                                        const path = location.pathname;
                                        const item = NAV_ITEMS.find(n => n.to === path || (n.to !== '/admin' && path.startsWith(n.to)));
                                        return item ? item.label : 'Dashboard';
                                    })()}
                                </h1>
                            </div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:hidden">
                                {(() => {
                                    const path = location.pathname;
                                    const item = NAV_ITEMS.find(n => n.to === path || (n.to !== '/admin' && path.startsWith(n.to)));
                                    return item ? item.label : 'Dashboard';
                                })()}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Contenedor dinámico para botones de cada sección */}
                            <div id="global-header-actions" className="flex items-center gap-1.5 sm:gap-2 empty:hidden mr-1 sm:mr-2"></div>

                            {/* Botón del asistente IA */}
                            <button
                                onClick={() => window.dispatchEvent(new Event('open-admin-ai-chat'))}
                                className="p-1.5 sm:p-2 rounded-lg text-bioflora-verde hover:text-bioflora-verde/85 dark:text-bioflora-verde dark:hover:text-bioflora-verde/85 hover:bg-bioflora-verde/10 dark:hover:bg-bioflora-verde/15 transition-colors cursor-pointer"
                                title="Abrir Asistente IA"
                            >
                                <Bot className="w-5 h-5 sm:w-5 sm:h-5" />
                            </button>

                            {/* Perfil unificado (Mobile + Desktop) */}
                            <div className="flex items-center gap-3 sm:pl-3 sm:border-l border-gray-200 dark:border-white/10">
                                <div className="hidden sm:block text-right">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">{getGreeting()},</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{firstName}</p>
                                </div>
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-bioflora-verde/10 dark:bg-bioflora-verde/15 border border-bioflora-verde/20 dark:border-bioflora-verde/30 flex items-center justify-center text-bioflora-verde text-sm font-bold cursor-pointer relative group" title="Perfil">
                                    {firstName.charAt(0).toUpperCase()}
                                    {/* Puente invisible (pt-2) para mantener el hover activo */}
                                    <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-48 z-50 font-sans">
                                        <div className="bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/5 rounded-xl shadow-xl overflow-hidden py-1">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 sm:hidden">
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none mb-1">{getGreeting()},</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{firstName}</p>
                                            </div>
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 hidden sm:block">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Administrador</p>
                                            </div>
                                            <button
                                                onClick={toggle}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left cursor-pointer"
                                            >
                                                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                                {dark ? 'Modo Claro' : 'Modo Oscuro'}
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" /> Cerrar sesión
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto scrollbar-admin p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Asistente IA */}
            <AdminAIChat />
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <AdminThemeProvider>
            <AdminLayout />
        </AdminThemeProvider>
    );
}
