import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutGrid,
    Users,
    Calendar,
    Settings,
    LogOut,
    Shield,
    UserCircle,
    BarChart2,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionNavLink = motion(NavLink);

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { path: '/admin', label: 'Overview', icon: LayoutGrid },
        { path: '/admin/employees', label: 'Employee Directory', icon: Users },
        { path: '/admin/attendance', label: 'Attendance Log', icon: Calendar },
        { path: '/admin/leaves', label: 'Leave Control', icon: BarChart2 },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const userLinks = [
        { path: '/dashboard', label: 'My Console', icon: Briefcase },
        { path: '/dashboard/attendance', label: 'My Attendance', icon: Calendar },
        { path: '/dashboard/leaves', label: 'My Requests', icon: BarChart2 },
        { path: '/profile', label: 'Profile', icon: UserCircle },
    ];

    const links = user?.role === 'admin' ? adminLinks : userLinks;

    return (
        <>
            {/* Mobile Overlay - Glassmorphism */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={`
                    fixed top-0 left-0 h-full w-64 md:w-72 flex flex-col z-[110] 
                    transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    border-r border-[var(--border-color)]
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{
                    backgroundColor: 'var(--bg-card)',
                    boxShadow: '20px 0 50px -20px var(--shadow-color)'
                }}
            >
                {/* Branding Section */}
                <div className="p-6 md:p-8 flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => { navigate('/admin'); onClose(); }}>
                    <div
                        className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-all duration-500"
                        style={{
                            background: 'linear-gradient(135deg, var(--brand-primary), #4f46e5)',
                        }}
                    >
                        <Shield size={22} className="md:w-6 md:h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-lg md:text-xl tracking-tighter leading-none uppercase text-[var(--text-main)]">
                            Antigravity
                        </span>
                        <span className="text-[8.5px] md:text-[11px] font-black uppercase tracking-[0.3em] mt-1 text-[var(--brand-primary)]">
                            Systems v2.0
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-grow px-4 md:px-6 space-y-1 overflow-y-auto no-scrollbar py-4">
                    <div className="px-4 mb-4">
                        <p className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] opacity-40 text-[var(--text-muted)]">
                            Main Navigation
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        {links.map((link) => (
                            <MotionNavLink
                                key={link.path}
                                to={link.path}
                                onClick={onClose}
                                end={link.path === '/admin' || link.path === '/dashboard'}
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.97 }}
                                className={({ isActive }) => `
                                    group relative flex items-center px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all duration-500
                                    ${isActive
                                        ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-blue-500/20'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <link.icon
                                            size={18}
                                            className={`md:w-5 md:h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                        />
                                        <span className={`ml-3 text-[10px] md:text-[15px] uppercase tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>
                                            {link.label}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                            />
                                        )}
                                    </>
                                )}
                            </MotionNavLink>
                        ))}
                    </div>
                </nav>

                {/* User Profile & Footer */}
                <div className="p-4 md:p-6 mt-auto">
                    <div className="bg-[var(--bg-main)] p-4 md:p-5 rounded-[2rem] border border-[var(--border-color)]">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--brand-primary)] overflow-hidden shadow-sm">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle size={24} md:size={28} />
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] md:text-[15px] font-black truncate leading-none mb-1 uppercase text-[var(--text-main)]">
                                    {user?.username || 'Employee'}
                                </span>
                                <span className="text-[8px] md:text-[12px] font-black uppercase tracking-[0.05em] opacity-80 text-[var(--text-muted)] truncate">
                                    {user?.role === 'admin' ? 'Root Admin' : (user?.position || 'Personnel')}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-3.5 rounded-xl md:rounded-2xl bg-[var(--bg-card)] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 border border-[var(--border-color)] transition-all duration-500 active:scale-95 group shadow-sm"
                        >
                            <LogOut size={14} className="md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

