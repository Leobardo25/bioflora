import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, Menu, X, LogOut, Users, Sun, Moon, ArrowLeftRight, Layers, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminThemeProvider, useAdminTheme } from '../context/AdminThemeContext';
import AdminAIChat from '../features/admin/AdminAIChat';

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

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#111113] text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-300">

            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/30 dark:bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

                <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white dark:bg-[#1A1A1B] border-r border-gray-200 dark:border-white/5 shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none`}>

                    <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-white/5">
                        <Link to="/" className="flex items-baseline gap-1.5">
                            <span className="font-bold text-lg tracking-[0.15em] text-indigo-700 dark:text-indigo-400" style={{ fontFamily: '"Montserrat", sans-serif' }}>VALEX</span>
                            <span className="text-[10px] font-sans tracking-widest text-gray-400 dark:text-gray-500 mt-0.5">ADMIN</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 md:hidden rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto scrollbar-admin px-3 py-5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-3 mb-3">Gestión</p>
                        <ul className="space-y-0.5">
                            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                                <li key={to}>
                                    <NavLink
                                        to={to}
                                        end={end}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'}`
                                        }
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        {label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="p-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-3 px-1">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-sm font-bold flex-shrink-0">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{adminName}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Administrador</p>
                            </div>
                            <button
                                onClick={toggle}
                                className="p-2 rounded-lg text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                title={dark ? 'Modo claro' : 'Modo oscuro'}
                            >
                                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </aside>

                <div className="flex flex-1 flex-col overflow-hidden">
                    <header className="md:hidden sticky top-0 z-10 bg-white dark:bg-[#1A1A1B] border-b border-gray-200 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between h-14 px-4">
                            <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                                <Menu className="w-5 h-5" />
                            </button>
                            <Link to="/" className="flex items-baseline gap-1">
                                <span className="font-bold text-base tracking-[0.15em] text-indigo-700 dark:text-indigo-400" style={{ fontFamily: '"Montserrat", sans-serif' }}>VALEX</span>
                                <span className="text-[10px] tracking-widest text-gray-400 dark:text-gray-500">ADMIN</span>
                            </Link>
                            <button
                                onClick={toggle}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400"
                                title={dark ? 'Modo claro' : 'Modo oscuro'}
                            >
                                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
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
