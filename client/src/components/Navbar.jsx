import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, LayoutDashboard, Menu as MenuIcon, X, Palette } from 'lucide-react';

const Navbar = ({ title, subtitle, badge, status, onMenuClick, isSidebarOpen }) => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleThemeToggle = () => {
        const themes = ['light', 'slate', 'indigo', 'midnight', 'emerald'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    return (
        <nav
            className="fixed md:relative top-0 left-0 w-full z-[200] px-3 md:px-8 h-14 md:h-18 flex items-center justify-between transition-none md:transition-all duration-500"
            style={{
                backgroundColor: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
                boxShadow: '0 4px 30px var(--shadow-color)',
                touchAction: 'none' // Prevent pull-to-refresh or gestures on the navbar itself
            }}
        >
            {/* Left Section: Logo & Brand */}
            <div className="flex items-center gap-3 md:gap-5">
                <div
                    className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-all cursor-pointer group shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, var(--brand-primary), #4f46e5)',
                    }}
                    onClick={() => navigate('/admin')}
                >
                    <LayoutDashboard size={16} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                </div>
                {title && (
                    <div className="hidden sm:flex flex-col">
                        <div className="flex items-center gap-2">
                            {badge && (
                                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md shrink-0">
                                    {badge}
                                </span>
                            )}
                            <h1 className="text-[12px] md:text-[17px] font-black tracking-tighter uppercase text-[var(--text-main)] truncate leading-none">
                                {title}
                            </h1>
                        </div>
                        {subtitle && (
                            <p className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] truncate mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 md:gap-6">
                {/* Status Indicator */}
                {status && (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/20 shadow-sm">
                        <div className="relative flex items-center justify-center w-2 h-2">
                            <div className="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        </div>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{status}</span>
                    </div>
                )}

                {/* User Profile Badge */}
                <div
                    className="flex items-center gap-1.5 md:gap-3 pl-1 md:pl-1.5 pr-2.5 md:pr-5 py-0.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-500 group cursor-default"
                    style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                    }}
                >
                    <div
                        className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 border-2"
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--brand-primary)'
                        }}
                    >
                        <UserCircle size={18} className="md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-[9px] md:text-[14px] tracking-tight uppercase text-[var(--text-main)] leading-none mb-0.5">
                            {user?.username || "Admin"}
                        </span>
                        <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.12em] text-[var(--brand-primary)] opacity-90 leading-none">
                            {user?.role === 'admin' ? 'System Root' : 'Personnel'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-2.5">
                    {/* Theme Toggle */}
                    <button
                        onClick={handleThemeToggle}
                        className="w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all active:scale-90 border hover:bg-[var(--bg-card)] shadow-sm"
                        style={{
                            borderColor: 'var(--border-color)',
                            color: 'var(--brand-primary)',
                            backgroundColor: 'transparent'
                        }}
                        title={`Toggle Theme [${theme}]`}
                    >
                        <Palette size={14} className="md:w-5 md:h-5" />
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all active:scale-90 border hover:bg-rose-50 hover:text-rose-600 shadow-sm"
                        style={{
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-muted)',
                            backgroundColor: 'transparent'
                        }}
                        title="Sign Out"
                    >
                        <LogOut size={14} className="md:w-5 md:h-5" />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 border shadow-sm"
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-main)'
                        }}
                    >
                        {isSidebarOpen ? <X size={16} /> : <MenuIcon size={16} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
