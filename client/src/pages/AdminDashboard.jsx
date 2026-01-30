import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import AddMemberModal from '../components/AddMemberModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Calendar,
    TrendingUp,
    CheckCircle,
    BarChart2,
    Plus,
    Eye,
    ArrowLeft,
    Briefcase,
    Phone,
    Hash,
    Search,
    Filter,
    MoreVertical,
    Mail,
    User,
    UserCircle,
    Shield,
    PieChart as PieIcon,
    Settings as SettingsIcon,
    Bell,
    Lock,
    Clock,
    Palette,
    FileText,
    ShieldCheck,
    EyeOff,
    Trash2,
    XCircle,
    Pencil
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const activeTab = useMemo(() => {
        const path = location.pathname;
        if (path.includes('/employees')) return 'employees';
        if (path.includes('/attendance')) return 'attendance';
        if (path.includes('/leaves')) return 'leaves';
        if (path.includes('/settings')) return 'settings';
        return 'dashboard';
    }, [location.pathname]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const empRes = await API.get('/employees');
            setEmployees(empRes.data);

            const attRes = await API.get('/attendance');
            setAttendance(attRes.data);

            const leaveRes = await API.get('/leaves');
            setLeaves(leaveRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
            // In a real app we would check for 401/403 and redirect or show error
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async (newMember) => {
        try {
            const payload = {
                name: newMember.name,
                employee_id: newMember.id,
                department: newMember.department,
                position: newMember.position,
                contact: newMember.contact,
                password: newMember.password
            };

            if (editingEmployee) {
                const response = await API.put(`/employees/${editingEmployee.id}`, payload);
                if (response.data.success) {
                    toast.success("Personnel record updated successfully");
                    fetchData();
                    setEditingEmployee(null);
                    setIsAddMemberOpen(false);
                }
            } else {
                const response = await API.post('/employees', payload);
                if (response.data.success) {
                    toast.success("New personnel enrolled successfully");
                    fetchData();
                    setIsAddMemberOpen(false);
                }
            }
        } catch (error) {
            console.error('Action failed:', error);
            const message = error.response?.data?.message || (editingEmployee ? "Update attempt failed" : "Registration attempt failed");
            toast.error(message);
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!id) return;
        try {
            await API.delete(`/employees/${id}`);
            setEmployees(employees.filter(emp => emp.id !== id));
            toast.success('Member removed successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to remove member');
        }
    };

    const handleUpdateLeaveStatus = async (id, status) => {
        try {
            await API.put(`/leaves/${id}`, { status });
            toast.success(`Leave request ${status}`);

            // Refresh leaves
            const leaveRes = await API.get('/leaves');
            setLeaves(leaveRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    // Calculate Stats
    const totalEmployees = employees.length;
    const uniqueDepartments = [...new Set(employees.map(e => e.department))].length;
    const presentToday = attendance.filter(a =>
        a.status === 'present' &&
        new Date(a.date).toDateString() === new Date().toDateString()
    ).length;
    const attendanceRate = totalEmployees ? Math.round((presentToday / totalEmployees) * 100) : 0;

    // Filtered Data
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const filteredAttendance = useMemo(() => {
        return attendance.filter(record =>
            record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [attendance, searchTerm]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-brand-100 selection:text-brand-700 transition-colors duration-300 relative scroll-smooth">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0 lg:ml-72'}`}>
                {/* Modern Gradient Background */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" />
                </div>

                <Navbar
                    title="System Overview"
                    badge="Control Center"
                    subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · LIVE FEED`}
                    status="System Online"
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                />

                <main className="max-w-full mx-auto px-4 md:px-6 pt-16 md:pt-4 pb-4 overflow-visible">
                    {/* Elements follow immediately after Navbar now */}

                    <div className="flex flex-col gap-3.5 md:gap-4">
                        {activeTab === 'dashboard' ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-3.5 md:space-y-4 text-left"
                            >
                                {/* Statistics Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                                    <StatCard
                                        title="Total Workforce"
                                        value={totalEmployees}
                                        icon={<Users className="w-6 h-6" />}
                                        color="bg-brand-600"
                                        trend="+12%"
                                        isPositive={true}
                                    />
                                    <StatCard
                                        title="Departments"
                                        value={uniqueDepartments}
                                        icon={<BarChart2 className="w-6 h-6" />}
                                        color="bg-blue-600"
                                        trend="Static"
                                        isNeutral={true}
                                    />
                                    <StatCard
                                        title="Active Presence"
                                        value={presentToday}
                                        icon={<CheckCircle className="w-6 h-6" />}
                                        color="bg-emerald-600"
                                        trend={`On Track`}
                                        isPositive={true}
                                    />
                                    <StatCard
                                        title="Attendance Rate"
                                        value={`${attendanceRate}%`}
                                        icon={<TrendingUp className="w-6 h-6" />}
                                        color="bg-amber-500"
                                        trend="-2%"
                                        isPositive={false}
                                    />
                                </div>

                                {/* Analytics Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-2.5 items-start">
                                    <div className="lg:col-span-1 h-full">
                                        <div className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-xl p-2.5 md:p-4 border border-[var(--border-color)] shadow-md hover:shadow-lg h-full flex flex-col items-center justify-center text-center transition-all duration-300">
                                            <div className="flex items-center gap-1.5 mb-2.5 md:mb-4 w-full justify-start text-left">
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                                    <PieIcon size={14} />
                                                </div>
                                                <h3 className="text-[8px] md:text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Status Analytics</h3>
                                            </div>
                                            <PieChart
                                                data={[
                                                    { label: 'Present', value: presentToday, color: '#10b981' },
                                                    { label: 'Absent', value: totalEmployees - presentToday - attendance.filter(a => a.status === 'leave').length, color: '#f43f5e' },
                                                    { label: 'Leave', value: attendance.filter(a => a.status === 'leave').length, color: '#f59e0b' }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-1 h-full">
                                        <div className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-[var(--border-color)] shadow-md hover:shadow-lg h-full transition-all duration-300">
                                            <div className="flex items-center gap-1.5 mb-2 md:mb-4 text-left">
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                                                    <TrendingUp size={14} />
                                                </div>
                                                <h3 className="text-[8px] md:text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Weekly Participation</h3>
                                            </div>
                                            <BarChart
                                                data={[
                                                    { label: 'Mon', value: 45, color: 'var(--brand-primary)' },
                                                    { label: 'Tue', value: 52, color: 'var(--brand-primary)' },
                                                    { label: 'Wed', value: 48, color: 'var(--brand-primary)' },
                                                    { label: 'Thu', value: 61, color: 'var(--brand-primary)' },
                                                    { label: 'Fri', value: 55, color: 'var(--brand-primary)' },
                                                    { label: 'Sat', value: 20, color: 'var(--text-muted)' },
                                                    { label: 'Sun', value: 15, color: 'var(--text-muted)' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            /* Sub-Pages Area */
                            <div className="bg-[var(--bg-card)] rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-[var(--border-color)] flex flex-col text-left overflow-hidden">
                                {/* Toolbar - Compact Sticky below Navbar */}
                                {['employees', 'attendance', 'leaves'].includes(activeTab) && (
                                    <div className="sticky top-16 md:relative md:top-0 z-30 pt-0 pb-2 px-2 md:p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-6 bg-[var(--bg-card)]/95 backdrop-blur-2xl">
                                        <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100 overflow-x-auto max-w-full no-scrollbar shadow-inner">
                                            <button
                                                onClick={() => navigate('/admin')}
                                                className={`px-3 md:px-10 py-2 md:py-4 rounded-full text-[9.5px] md:text-[15px] font-black transition-all duration-700 flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'employees' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                                            >
                                                <Users size={14} md:size={19} />
                                                Directory
                                            </button>
                                            <button
                                                onClick={() => navigate('/admin/attendance')}
                                                className={`px-3 md:px-10 py-2 md:py-4 rounded-full text-[9.5px] md:text-[15px] font-black transition-all duration-700 flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                                            >
                                                <Calendar size={14} md:size={19} />
                                                Attendance
                                            </button>
                                            <button
                                                onClick={() => navigate('/admin/leaves')}
                                                className={`px-3 md:px-10 py-2 md:py-4 rounded-full text-[9.5px] md:text-[15px] font-black transition-all duration-700 flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'leaves' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                                            >
                                                <BarChart2 size={14} md:size={19} />
                                                Leaves
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                                            <div className="relative flex-grow md:w-80 group">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={14} md:size={18} />
                                                <input
                                                    type="text"
                                                    placeholder={
                                                        activeTab === 'employees' ? 'Search personnel...' :
                                                            activeTab === 'attendance' ? 'Filter records...' : 'Filter leaves...'
                                                    }
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-8 md:pl-12 pr-4 md:pr-6 py-2 md:py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-full focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 shadow-sm transition-all text-[10px] md:text-[15px] font-black text-slate-800 placeholder:text-slate-400 placeholder:uppercase placeholder:tracking-widest outline-none uppercase tracking-widest"
                                                />
                                            </div>
                                            {activeTab === 'employees' && (
                                                <button
                                                    onClick={() => setIsAddMemberOpen(true)}
                                                    className="w-8 h-8 md:w-auto md:px-8 md:py-3 bg-blue-600 text-white rounded-full font-black text-sm flex items-center justify-center md:gap-2 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-700 shrink-0"
                                                >
                                                    <Plus size={16} md:size={20} />
                                                    <span className="hidden md:inline uppercase tracking-[0.2em] text-[10px]">Add Personnel</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Content Section - Dynamic Padding */}
                                <div className={`p-0 ${activeTab === 'settings' ? 'pt-0' : 'pt-14'} md:pt-4 pb-4`}>
                                    <AnimatePresence mode="wait">
                                        {selectedEmployee ? (
                                            <EmployeeProfile
                                                employee={selectedEmployee}
                                                onBack={() => setSelectedEmployee(null)}
                                            />
                                        ) : (
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="overflow-x-auto text-left"
                                            >
                                                {activeTab === 'employees' ? (
                                                    <EmployeeTable
                                                        data={filteredEmployees}
                                                        onView={setSelectedEmployee}
                                                        onEdit={(emp) => {
                                                            setEditingEmployee(emp);
                                                            setIsAddMemberOpen(true);
                                                        }}
                                                        onDelete={(id) => setConfirmDelete({ open: true, id })}
                                                    />
                                                ) : activeTab === 'attendance' ? (
                                                    <AttendanceTable
                                                        data={filteredAttendance}
                                                    />
                                                ) : activeTab === 'leaves' ? (
                                                    <LeaveTable
                                                        data={leaves.filter(l => (l.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()))}
                                                        onUpdate={handleUpdateLeaveStatus}
                                                    />
                                                ) : (
                                                    <SettingsView />
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <AddMemberModal
                    isOpen={isAddMemberOpen}
                    initialData={editingEmployee}
                    onClose={() => {
                        setIsAddMemberOpen(false);
                        setEditingEmployee(null);
                    }}
                    onAdd={handleAddMember}
                />

                <ConfirmationModal
                    isOpen={confirmDelete.open}
                    onClose={() => setConfirmDelete({ open: false, id: null })}
                    onConfirm={() => handleDeleteEmployee(confirmDelete.id)}
                    title="Terminate Access"
                    message="Are you sure you want to remove this member from the system? This action cannot be undone."
                    confirmText="Permanently Remove"
                    type="danger"
                />
            </div>
        </div>
    );
};

/* --- Sub-Components --- */

const StatCard = ({ title, value, icon, color, trend, isPositive, isNeutral }) => {
    const cardColors = {
        'bg-brand-600': 'bg-indigo-600 shadow-indigo-200/50',
        'bg-blue-600': 'bg-blue-600 shadow-blue-200/50',
        'bg-emerald-600': 'bg-emerald-600 shadow-emerald-200/50',
        'bg-amber-500': 'bg-amber-500 shadow-amber-200/50',
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
            }}
            whileHover={{ y: -3, transition: { duration: 0.3 } }}
            className="relative overflow-hidden bg-[var(--bg-card)] rounded-[1.5rem] p-3.5 md:p-5 border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-all duration-500 group"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-primary)]/5 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:bg-[var(--brand-primary)]/10 transition-colors" />

            <div className="flex items-start justify-between relative z-10 mb-3 md:mb-5">
                <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl ${cardColors[color] || color} group-hover:rotate-6 transition-all duration-500`}>
                    {React.cloneElement(icon, { size: 18, className: "md:w-5 md:h-5" })}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isNeutral ? 'bg-[var(--bg-main)] text-[var(--text-muted)]' :
                        isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                        <TrendingUp size={10} className={!isPositive && !isNeutral ? 'rotate-180' : ''} />
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-[8px] md:text-[13px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5 group-hover:text-[var(--brand-primary)] transition-colors">{title}</p>
                <div className="flex items-baseline gap-1.5">
                    <h3 className="text-[16px] md:text-3xl font-black tracking-tighter text-slate-900 uppercase">{value}</h3>
                </div>
            </div>
        </motion.div>
    );
};

const EmployeeTable = ({ data, onView, onEdit, onDelete }) => {
    if (data.length === 0) return <EmptyState label="No employees found" />;

    return (
        <div className="w-full">
            {/* Mobile View: Card-based Layout */}
            <div className="lg:hidden space-y-2.5 px-1.5 pb-4">
                {data.map((emp) => (
                    <div
                        key={emp.id}
                        className="bg-[var(--bg-card)] rounded-[1.5rem] p-4 border border-[var(--border-color)] shadow-sm flex flex-col gap-3 relative overflow-hidden group active:scale-[0.98] transition-all"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-primary)]/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                                {emp.name.charAt(0)}
                            </div>
                            <div className="flex-grow min-w-0">
                                <h4 className="font-black text-[13px] md:text-[15px] uppercase tracking-tight leading-tight mb-0.5" style={{ color: 'var(--text-main)' }}>{emp.name}</h4>
                                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>ID #{emp.employee_id && emp.employee_id !== 'null' ? emp.employee_id : `8271${emp.id}`}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10 pt-3 border-t border-[var(--border-color)]/30 mt-1">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Department</span>
                                <span className="text-[13px] font-black uppercase tracking-tight text-slate-900">{emp.department}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Position</span>
                                <span className="inline-flex px-3 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest rounded-full self-start ring-1 ring-blue-100/50">
                                    {emp.position}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] relative z-10">
                            <div className="flex gap-2">
                                <button onClick={() => onView(emp)} className="w-9 h-9 flex items-center justify-center bg-[var(--bg-main)] rounded-xl text-[var(--text-muted)] hover:text-blue-600 border border-[var(--border-color)] transition-all">
                                    <Eye size={16} />
                                </button>
                                <button onClick={() => onEdit(emp)} className="w-9 h-9 flex items-center justify-center bg-[var(--bg-main)] rounded-xl text-[var(--text-muted)] hover:text-emerald-600 border border-[var(--border-color)] transition-all">
                                    <Pencil size={15} />
                                </button>
                            </div>
                            <button onClick={() => onDelete(emp.id)} className="w-9 h-9 flex items-center justify-center bg-rose-50 rounded-xl text-rose-500 border border-rose-100 transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View: Table */}
            <table className="hidden lg:table w-full border-separate border-spacing-0">
                <thead>
                    <tr className="border-b border-[var(--border-color)]">
                        <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>Member</th>
                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.3em] border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>ID</th>
                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.3em] border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>Department</th>
                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.3em] border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>Position</th>
                        <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.3em] border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>Operations</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                    {data.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/40 transition-all duration-300 group">
                            <td className="px-4 py-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="overflow-hidden">
                                        <p className="text-[12px] md:text-[14.5px] font-black tracking-tight uppercase leading-tight mb-0.5" style={{ color: 'var(--text-main)' }}>{emp.name}</p>
                                        <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: 'var(--text-muted)' }}>ID #{emp.employee_id && emp.employee_id !== 'null' ? emp.employee_id : `8271${emp.id}`}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-2.5">
                                <span className="text-[12px] md:text-[14.5px] font-black uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>{emp.employee_id && emp.employee_id !== 'null' ? emp.employee_id : `8271${emp.id}`}</span>
                            </td>
                            <td className="px-4 py-2.5">
                                <span className="text-[10px] md:text-[12.5px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{emp.department}</span>
                            </td>
                            <td className="px-6 py-3.5">
                                <span className="px-3 py-1 bg-blue-50 text-[10px] md:text-[12px] font-black text-blue-600 uppercase tracking-widest rounded-full border border-blue-100/50">
                                    {emp.position}
                                </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => onView(emp)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 rounded-full transition-all border border-transparent hover:border-blue-100"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        onClick={() => onEdit(emp)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-emerald-50 rounded-full transition-all border border-transparent hover:border-emerald-100"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(emp.id)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AttendanceTable = ({ data }) => {
    if (data.length === 0) return <EmptyState label="No attendance records" />;

    return (
        <div className="w-full">
            {/* Mobile View: Card List */}
            <div className="lg:hidden space-y-3 px-2">
                {data.map((record) => (
                    <div key={record.id} className="p-4 rounded-3xl border shadow-sm flex items-center justify-between group" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-blue-600 shrink-0" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                                {record.employee_name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-black text-xs leading-none mb-1 uppercase tracking-tight truncate" style={{ color: 'var(--text-main)' }}>{record.employee_name}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--border-color)' }} />
                                    <p className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: 'var(--text-muted)' }}>{record.department}</p>
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <StatusBadge status={record.status} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View: Table */}
            <table className="hidden lg:table w-full">
                <thead>
                    <tr className="bg-[var(--bg-main)]/50">
                        <th className="px-8 py-4 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Member</th>
                        <th className="px-8 py-4 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Date & Time</th>
                        <th className="px-8 py-4 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                    {data.map((record) => (
                        <tr key={record.id} className="hover:bg-[var(--bg-main)]/80 transition-colors">
                            <td className="px-8 py-5">
                                <div className="overflow-hidden text-left">
                                    <p className="font-bold text-[var(--text-main)] text-sm leading-none mb-1 truncate">{record.employee_name}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest truncate">{record.department}</p>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-left text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-[var(--text-main)]">
                                        {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                    <span className="w-1 h-1 bg-[var(--border-color)] rounded-full" />
                                    <p className="text-xs text-[var(--text-muted)] font-bold tracking-tight">
                                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </td>
                            <td className="px-8 py-5 flex justify-center">
                                <StatusBadge status={record.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const EmployeeProfile = ({ employee, onBack }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 md:p-12"
    >
        <button
            onClick={onBack}
            className="mb-10 flex items-center gap-2 transition-colors group"
            style={{ color: 'var(--text-muted)' }}
        >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--bg-main)' }}>
                <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Back to Directory</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="relative mb-4 md:mb-6">
                    <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-tr from-blue-500 to-indigo-500 p-1 md:p-1.5 shadow-xl md:shadow-2xl shadow-blue-200">
                        <div className="w-full h-full rounded-[1.8rem] md:rounded-[2.3rem] flex items-center justify-center text-3xl md:text-5xl font-bold tracking-tighter overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
                            {employee.name.charAt(0)}
                        </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl md:rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                        <CheckCircle size={14} md:size={18} />
                    </div>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 leading-tight" style={{ color: 'var(--text-main)' }}>{employee.name}</h2>
                <div className="px-3 py-1 md:px-4 md:py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest inline-block ring-1 ring-blue-100">
                    {employee.position}
                </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileItem label="Department" value={employee.department} icon={<Briefcase className="text-indigo-400" size={16} />} />
                <ProfileItem label="Employee ID" value={employee.employee_id || `#${employee.id}`} icon={<Hash className="text-indigo-400" size={16} />} />
                <ProfileItem label="Contact Method" value={employee.contact || "No Email Provided"} icon={<Mail className="text-indigo-400" size={16} />} />
                <ProfileItem label="Status" value="Active Employment" icon={<User className="text-emerald-400" size={16} />} isStatus />
            </div>
        </div>
    </motion.div>
);

const ProfileItem = ({ label, value, icon, isStatus }) => (
    <div className="p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border transition-all duration-500 group" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mb-2 md:mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            {icon}
            {label}
        </p>
        <div className="flex items-center gap-2">
            {isStatus && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
            <p className="text-lg font-bold tracking-tight group-hover:text-blue-600 transition-colors uppercase" style={{ color: 'var(--text-main)' }}>{value}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        present: 'bg-emerald-100 text-emerald-600 ring-emerald-200',
        absent: 'bg-rose-100 text-rose-600 ring-rose-200',
        leave: 'bg-amber-100 text-amber-600 ring-amber-200'
    };

    return (
        <span className={`px-4 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ring-1 ${styles[status] || styles.absent}`}>
            {status}
        </span>
    );
};

const EmptyState = ({ label }) => (
    <div className="py-20 flex flex-col items-center justify-center opacity-50" style={{ color: 'var(--text-muted)' }}>
        <Search size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest">{label}</p>
    </div>
);

const LeaveTable = ({ data, onUpdate }) => {
    const [visibleActions, setVisibleActions] = useState({});

    if (data.length === 0) return <EmptyState label="No leave requests found" />;

    const toggleActions = (id) => {
        setVisibleActions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const calculateDays = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        if (isNaN(s) || isNaN(e)) return 0;
        const diffTime = Math.abs(e - s);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const leaveStatusStyles = {
        approved: 'bg-emerald-50 text-emerald-500 border-emerald-100',
        pending: 'bg-rose-50 text-rose-500 border-rose-100',
        rejected: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
        <div className="w-full">
            {/* Mobile View */}
            <div className="lg:hidden px-2 space-y-2 pb-6">
                {data.map((leave) => {
                    const status = (leave.status || '').toLowerCase();
                    return (
                        <div key={leave.id} className="p-3 md:p-4 rounded-[1.5rem] border shadow-sm flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center justify-between group" onClick={() => toggleActions(leave.id)}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-100 shrink-0">
                                        {leave.employee_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-black text-xs leading-none mb-1.5 uppercase tracking-tighter truncate" style={{ color: 'var(--text-main)' }}>{leave.employee_name}</p>
                                        <div className="flex items-center gap-1.5 text-blue-600">
                                            <Calendar size={10} />
                                            <p className="text-[9px] font-black tracking-widest uppercase">
                                                {new Date(leave.start_date).toLocaleDateString()} — {new Date(leave.end_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${leaveStatusStyles[status] || 'text-[var(--text-muted)]'}`} style={{ backgroundColor: 'var(--bg-main)' }}>
                                        {leave.status}
                                    </span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {visibleActions[leave.id] && status === 'pending' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="pt-2 flex gap-2 border-t border-[var(--border-color)]"
                                    >
                                        <button
                                            onClick={() => onUpdate(leave.id, 'approved')}
                                            className="flex-grow py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => onUpdate(leave.id, 'rejected')}
                                            className="flex-grow py-2.5 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg"
                                        >
                                            Reject
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block w-full p-8 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-slate-400">
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Employee</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Leave Type</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Duration</th>
                                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em]">Days</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Reason</th>
                                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((leave) => {
                                const status = (leave.status || '').toLowerCase();
                                return (
                                    <tr key={leave.id} className="group border rounded-[2rem] hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                        <td className="px-6 py-6 first:rounded-l-[1.5rem] border-y border-l border-[var(--border-color)]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-100 shrink-0">
                                                    {leave.employee_name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="font-black text-sm tracking-tight truncate" style={{ color: 'var(--text-main)' }}>{leave.employee_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-y border-[var(--border-color)]">
                                            <span className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{leave.type}</span>
                                        </td>
                                        <td className="px-6 py-6 border-y border-[var(--border-color)]">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="text-blue-600 shrink-0" size={14} />
                                                <span className="text-xs font-black tracking-tight whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                                                    {new Date(leave.start_date).toLocaleDateString()} — {new Date(leave.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center border-y border-[var(--border-color)]">
                                            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black mx-auto ring-4 ring-blue-50/50">
                                                {calculateDays(leave.start_date, leave.end_date)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 border-y border-[var(--border-color)]">
                                            <p className="text-[11px] font-medium max-w-[200px] line-clamp-1 leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>"{leave.reason}"</p>
                                        </td>
                                        <td className="px-6 py-6 border-y border-[var(--border-color)] text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${leaveStatusStyles[status] || 'text-[var(--text-muted)]'}`} style={{ backgroundColor: 'var(--bg-main)' }}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right last:rounded-r-[1.5rem] border-y border-r border-[var(--border-color)]">
                                            <div className="flex justify-end items-center gap-2">
                                                {status === 'pending' ? (
                                                    <>
                                                        <button onClick={() => onUpdate(leave.id, 'approved')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/10 flex items-center gap-1.5 transition-all active:scale-95">
                                                            <CheckCircle size={12} /> Approve
                                                        </button>
                                                        <button onClick={() => onUpdate(leave.id, 'rejected')} className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-500/10 flex items-center gap-1.5 transition-all active:scale-95">
                                                            <XCircle size={12} /> Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-main)]/50 border border-[var(--border-color)] text-[var(--text-muted)] opacity-60">
                                                        <CheckCircle size={12} className="text-emerald-500" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Done</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SettingsView = () => {
    const { theme, setTheme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [discardKey, setDiscardKey] = useState(0);

    const [profile, setProfile] = useState({ name: 'Admin User', email: 'admin@ems.pro', visibility: true });
    const [security, setSecurity] = useState({ current: '', new: '', confirm: '' });
    const [roles, setRoles] = useState({
        selected: 'Admin',
        permissions: {
            Admin: { view: true, edit: true, delete: true, approve: true, manage: true },
            Manager: { view: true, edit: true, delete: false, approve: true, manage: false },
            employee: { view: true, edit: false, delete: false, approve: false, manage: false },
            Guest: { view: true, edit: false, delete: false, approve: false, manage: false }
        }
    });
    const [leavePolicy, setLeavePolicy] = useState({
        limits: { sick: 12, casual: 10, paid: 15, unpaid: 30 },
        carryForward: true,
        approvalRequired: true,
        halfDay: true,
        emergency: true
    });
    const [notifications, setNotifications] = useState({
        channels: { email: true, sms: false, app: true },
        triggers: { leave: true, approvals: true, reminders: true },
        frequency: 'Instant',
        sound: true,
        vibration: false
    });

    const [lastSavedProfile, setLastSavedProfile] = useState({ name: 'Admin User', email: 'admin@ems.pro', visibility: true });
    const [lastSavedRoles, setLastSavedRoles] = useState({ ...roles });
    const [lastSavedLeave, setLastSavedLeave] = useState({ ...leavePolicy });
    const [lastSavedNotif, setLastSavedNotif] = useState({ ...notifications });

    const handleDiscard = () => {
        setProfile({ ...lastSavedProfile });
        setSecurity({ current: '', new: '', confirm: '' });
        setRoles({ ...lastSavedRoles });
        setLeavePolicy({ ...lastSavedLeave });
        setNotifications({ ...lastSavedNotif });
        setDiscardKey(prev => prev + 1);
        toast.info("Changes discarded", {
            icon: "🔄",
            className: "rounded-2xl font-bold bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] shadow-xl"
        });
    };

    const handleSave = () => {
        setLastSavedProfile({ ...profile });
        setLastSavedRoles({ ...roles });
        setLastSavedLeave({ ...leavePolicy });
        setLastSavedNotif({ ...notifications });
        toast.success("Preferences updated", {
            icon: "✨",
            className: "rounded-2xl font-bold bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] shadow-xl"
        });
    };

    const categories = [
        { id: 'profile', label: 'Profile Settings', icon: UserCircle },
        { id: 'security', label: 'Change Password', icon: Lock },
        { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
        { id: 'working', label: 'Working Hours', icon: Clock },
        { id: 'leave', label: 'Leave Policy', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'theme', label: 'Theme Preferences', icon: Palette },
    ];

    const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);

    const inputClasses = `
            w-full px-3.5 md:px-4 py-2.5 md:py-3 bg-[var(--bg-main)] border border-[var(--border-color)]
            rounded-lg text-xs md:text-sm font-medium text-[var(--text-main)] placeholder:text-[var(--text-muted)]
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:shadow-sm
            transition-all outline-none
            `;

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-[500px] md:min-h-[600px] border-t border-[var(--border-color)]">
            {/* Mobile Toggle Bar */}
            {/* Mobile Toggle Bar - Sticky below Navbar */}
            <div className="lg:hidden sticky top-16 z-30 flex items-center justify-between p-4 backdrop-blur-3xl border-b shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                        {React.createElement(categories.find(c => c.id === selectedCategory)?.icon || UserCircle, { size: 20 })}
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 leading-none">Settings</span>
                        <h2 className="text-sm font-black uppercase tracking-tight leading-none mt-1" style={{ color: 'var(--text-main)' }}>
                            {categories.find(c => c.id === selectedCategory)?.label}
                        </h2>
                    </div>
                </div>
                <button
                    onClick={() => setIsCatMenuOpen(!isCatMenuOpen)}
                    className="p-3 rounded-2xl border transition-all shadow-sm"
                    style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                    <Filter size={18} className={isCatMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
            </div>

            {/* Settings Sidebar - Dropdown positioning fix */}
            <div className={`${isCatMenuOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-72 bg-[var(--bg-main)] border-r border-[var(--border-color)] p-4 md:p-6 flex-col gap-1.5 md:gap-2 absolute lg:relative z-40 top-[73px] lg:top-0 left-0 right-0 shadow-2xl lg:shadow-none`}>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 md:mb-4 px-4 opacity-50">Preference Categories</p>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setSelectedCategory(cat.id);
                            setIsCatMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl text-[11px] md:text-sm font-bold transition-all duration-300 ${selectedCategory === cat.id ? 'bg-[var(--bg-card)] text-[var(--brand-primary)] shadow-xl shadow-indigo-100/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50 hover:text-[var(--text-main)]'
                            }`}
                    >
                        <cat.icon size={16} md:size={18} />
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Settings Content Area - Smooth Scrolling */}
            <div className="flex-grow p-4 pt-10 md:p-12 bg-[var(--bg-card)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${selectedCategory}-${discardKey}`}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <div className="mb-8 md:mb-14 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-blue-600/5 text-blue-600 border border-blue-600/10 flex items-center justify-center shadow-inner shrink-0 scale-90 md:scale-100">
                                {React.createElement(categories.find(c => c.id === selectedCategory)?.icon || UserCircle, { size: 28 })}
                            </div>
                            <div>
                                <h2 className="text-xl md:text-4xl font-black tracking-tighter mb-2 uppercase leading-none" style={{ color: 'var(--text-main)' }}>
                                    {categories.find(c => c.id === selectedCategory)?.label}
                                </h2>
                                <p className="text-[9px] md:text-sm font-black uppercase tracking-widest opacity-80 leading-tight" style={{ color: 'var(--text-muted)' }}>Configure your system preferences and details.</p>
                            </div>
                        </div>

                        {selectedCategory === 'profile' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] pl-6" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                            className={inputClasses}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] pl-6" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                            className={inputClasses}
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="p-5 md:p-8 bg-[var(--bg-main)]/30 rounded-2xl md:rounded-[2.5rem] border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm group hover:border-[var(--brand-primary)]/30 transition-all">
                                    <div className="flex items-center gap-4 md:gap-6 w-full">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--brand-primary)] shadow-md border border-[var(--border-color)] group-hover:scale-105 transition-transform duration-500 shrink-0">
                                            <User size={22} md:size={28} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-base md:text-lg font-bold tracking-tight truncate" style={{ color: 'var(--text-main)' }}>Profile Visibility</p>
                                            <p className="text-[10px] md:text-xs font-medium tracking-wide truncate" style={{ color: 'var(--text-muted)' }}>
                                                {profile.visibility ? "Public to all department members" : "Hidden from system directory"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end w-full sm:w-auto">
                                        <button
                                            onClick={() => setProfile(prev => ({ ...prev, visibility: !prev.visibility }))}
                                            className={`w-16 h-8 rounded-full relative transition-all duration-500 shadow-inner overflow-hidden ${profile.visibility ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-main)] border border-[var(--border-color)]'}`}
                                        >
                                            <motion.div
                                                animate={{ x: profile.visibility ? 34 : 4 }}
                                                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center`}
                                            >
                                                <div className={`w-1 h-1 rounded-full ${profile.visibility ? 'bg-[var(--brand-primary)]' : 'bg-slate-300'}`} />
                                            </motion.div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedCategory === 'security' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide pl-1" style={{ color: 'var(--text-muted)' }}>Current Authorization Key</label>
                                    <div className="relative group">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={security.current}
                                            onChange={(e) => setSecurity(prev => ({ ...prev, current: e.target.value }))}
                                            className={inputClasses}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            type="button"
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1.5 rounded-md hover:bg-slate-100 ${showCurrentPassword ? 'text-blue-600' : 'text-slate-500'}`}
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide pl-1" style={{ color: 'var(--text-muted)' }}>New Password</label>
                                        <div className="relative group">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={security.new}
                                                onChange={(e) => setSecurity(prev => ({ ...prev, new: e.target.value }))}
                                                className={inputClasses}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                type="button"
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1.5 rounded-md hover:bg-slate-100 ${showNewPassword ? 'text-blue-600' : 'text-slate-500'}`}
                                            >
                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide pl-1" style={{ color: 'var(--text-muted)' }}>Confirm Key</label>
                                        <div className="relative group">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={security.confirm}
                                                onChange={(e) => setSecurity(prev => ({ ...prev, confirm: e.target.value }))}
                                                className={inputClasses}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                type="button"
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1.5 rounded-md hover:bg-slate-100 ${showConfirmPassword ? 'text-blue-600' : 'text-slate-500'}`}
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-slate-900 text-white rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-wide shadow-md hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all group">
                                        <Shield size={14} className="group-hover:rotate-6 transition-transform" />
                                        Secure Change
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedCategory === 'working' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-7 gap-3">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                        <div key={i} className="flex flex-col items-center gap-3">
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{day}</span>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all ${i < 5 ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/20' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)]'}`}>
                                                {i < 5 ? 'ON' : 'OFF'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Shift Start</label>
                                        <input type="time" defaultValue="09:00" className={inputClasses} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Shift End</label>
                                        <input type="time" defaultValue="18:00" className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedCategory === 'theme' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div
                                    onClick={() => setTheme('light')}
                                    className={`p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer ${theme === 'light' ? 'border-[var(--brand-primary)] bg-white ring-8 ring-[var(--brand-primary)]/10 shadow-xl shadow-[var(--brand-primary)]/20' : 'border-[var(--border-color)] bg-white opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="h-24 bg-[var(--bg-main)] rounded-2xl mb-4 border border-[var(--border-color)] flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 to-transparent" />
                                        <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] shadow-lg relative z-10" />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${theme === 'light' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>Modern Light</p>
                                </div>

                                <div
                                    onClick={() => setTheme('slate')}
                                    className={`p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer ${theme === 'slate' ? 'border-[var(--brand-primary)] bg-slate-900 ring-8 ring-slate-800 shadow-xl shadow-slate-900/50' : 'border-[var(--border-color)] bg-slate-900 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="h-24 bg-slate-800 rounded-2xl mb-4 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] shadow-lg" />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${theme === 'slate' ? 'text-white' : 'text-slate-400'}`}>Slate Dark</p>
                                </div>

                                <div
                                    onClick={() => setTheme('indigo')}
                                    className={`p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer ${theme === 'indigo' ? 'border-[var(--brand-primary)] bg-indigo-950 ring-8 ring-indigo-900 shadow-xl shadow-indigo-900/50' : 'border-slate-100 bg-indigo-900 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="h-24 bg-indigo-900 rounded-2xl mb-4 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-amber-400 shadow-lg" />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${theme === 'indigo' ? 'text-white' : 'text-indigo-300'}`}>Royal Indigo</p>
                                </div>

                                <div
                                    onClick={() => setTheme('midnight')}
                                    className={`p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer ${theme === 'midnight' ? 'border-[var(--brand-primary)] bg-slate-950 ring-8 ring-sky-900/50 shadow-xl shadow-sky-900/40' : 'border-slate-800 bg-slate-950 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="h-24 bg-slate-900 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent" />
                                        <div className="w-10 h-10 rounded-full bg-sky-400 shadow-lg relative z-10" />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${theme === 'midnight' ? 'text-white' : 'text-slate-500'}`}>Midnight Mode</p>
                                </div>

                                <div
                                    onClick={() => setTheme('emerald')}
                                    className={`p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border-2 transition-all duration-700 cursor-pointer ${theme === 'emerald' ? 'border-emerald-500 bg-emerald-950 ring-[12px] ring-emerald-500/10 shadow-2xl shadow-emerald-500/30' : 'border-slate-50 bg-emerald-950 opacity-40 hover:opacity-100 hover:scale-[1.02]'}`}
                                >
                                    <div className="h-28 bg-emerald-900 rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden shadow-inner font-black text-emerald-400 text-[8px] uppercase tracking-[0.4em]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent" />
                                        <div className="w-12 h-12 rounded-full bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)] relative z-10 animate-pulse" />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] text-center ${theme === 'emerald' ? 'text-white' : 'text-emerald-500/60'}`}>Botanical Emerald</p>
                                </div>
                            </div>
                        )}

                        {selectedCategory === 'roles' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.keys(roles.permissions).map((roleName) => (
                                        <button
                                            key={roleName}
                                            onClick={() => setRoles(prev => ({ ...prev, selected: roleName }))}
                                            className={`py-6 rounded-[2rem] border-2 transition-all font-black text-[10px] uppercase tracking-[0.2em] ${roles.selected === roleName ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-xl shadow-[var(--brand-primary)]/20' : 'bg-[var(--bg-main)]/50 border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--brand-primary)]/30'}`}
                                        >
                                            {roleName}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6 md:p-10 bg-[var(--bg-main)]/30 rounded-3xl md:rounded-[3.5rem] border border-[var(--border-color)] space-y-6 md:space-y-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border-color)] pb-4 md:pb-6 gap-3">
                                        <h4 className="text-[11px] md:text-sm font-black text-[var(--text-main)] uppercase tracking-[0.2em]">Matrix: {roles.selected}</h4>
                                        <span className="self-start md:self-auto px-3 py-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[8px] font-black rounded-lg">LIVE TOGGLE</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        {Object.entries(roles.permissions[roles.selected]).map(([perm, val]) => (
                                            <div key={perm} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-2 rounded-full ${val ? 'bg-emerald-500' : 'bg-rose-500'} transition-colors`} />
                                                    <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest opacity-80 group-hover:opacity-100">{perm} Access</span>
                                                </div>
                                                <SettingToggle
                                                    active={val}
                                                    onToggle={() => setRoles(prev => ({
                                                        ...prev,
                                                        permissions: {
                                                            ...prev.permissions,
                                                            [prev.selected]: {
                                                                ...prev.permissions[prev.selected],
                                                                [perm]: !val
                                                            }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedCategory === 'leave' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.entries(leavePolicy.limits).map(([type, limit]) => (
                                        <div key={type} className="p-8 bg-[var(--bg-main)]/30 rounded-[2.5rem] border border-[var(--border-color)] flex items-center justify-between">
                                            <div>
                                                <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-1">{type} Leave</p>
                                                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Maximum Limit (Annual)</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-black text-[var(--brand-primary)]">{limit}</span>
                                                <div className="flex flex-col gap-1">
                                                    <button onClick={() => setLeavePolicy(prev => ({ ...prev, limits: { ...prev.limits, [type]: limit + 1 } }))} className="p-1 hover:text-[var(--brand-primary)] text-[var(--text-muted)]"><Plus size={12} /></button>
                                                    <button onClick={() => setLeavePolicy(prev => ({ ...prev, limits: { ...prev.limits, [type]: Math.max(0, limit - 1) } }))} className="p-1 hover:text-[var(--brand-primary)] text-[var(--text-muted)]"><TrendingUp className="rotate-180" size={12} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 md:p-10 bg-[var(--bg-main)]/30 rounded-3xl md:rounded-[3.5rem] border border-[var(--border-color)] space-y-5 md:space-y-6">
                                    <h4 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6">Policy Governance</h4>
                                    {[
                                        { id: 'carryForward', label: 'Carry Forward Balance', desc: 'Allow unused leaves to roll over to next year' },
                                        { id: 'approvalRequired', label: 'Admin Approval Required', desc: 'All requests must be reviewed by management' },
                                        { id: 'halfDay', label: 'Half-Day Application', desc: 'Enable 0.5 day leave duration selection' },
                                        { id: 'emergency', label: 'Emergency Override', desc: 'Bypass notice period for critical cases' }
                                    ].map((policy) => (
                                        <div key={policy.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--bg-card)]/50 transition-colors">
                                            <div>
                                                <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest">{policy.label}</p>
                                                <p className="text-[9px] text-[var(--text-muted)] font-medium">{policy.desc}</p>
                                            </div>
                                            <SettingToggle
                                                active={leavePolicy[policy.id]}
                                                onToggle={() => setLeavePolicy(prev => ({ ...prev, [policy.id]: !prev[policy.id] }))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedCategory === 'notifications' && (
                            <div className="space-y-12">
                                <section>
                                    <h4 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6 pl-4">Delivery Channels</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { id: 'email', label: 'Email Alerts', icon: Mail },
                                            { id: 'sms', label: 'SMS Gateway', icon: Phone },
                                            { id: 'app', label: 'App Push', icon: Bell }
                                        ].map((channel) => (
                                            <div key={channel.id} className={`p-8 rounded-[2.5rem] border-2 transition-all ${notifications.channels[channel.id] ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]' : 'bg-[var(--bg-main)]/30 border-[var(--border-color)]'}`}>
                                                <channel.icon size={24} className={notifications.channels[channel.id] ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'} />
                                                <p className="mt-4 text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest">{channel.label}</p>
                                                <div className="mt-6 flex justify-end">
                                                    <SettingToggle
                                                        active={notifications.channels[channel.id]}
                                                        onToggle={() => setNotifications(prev => ({ ...prev, channels: { ...prev.channels, [channel.id]: !prev.channels[channel.id] } }))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="p-10 bg-[var(--bg-main)]/30 rounded-[3.5rem] border border-[var(--border-color)]">
                                    <h4 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-8">Event Triggers & System Preferences</h4>
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest">Alert Frequency</p>
                                                <p className="text-[9px] text-[var(--text-muted)] font-medium tracking-tight">How often should we ping you?</p>
                                            </div>
                                            <select
                                                value={notifications.frequency}
                                                onChange={(e) => setNotifications(prev => ({ ...prev, frequency: e.target.value }))}
                                                className="bg-white border border-slate-100 text-slate-800 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-full px-8 py-3 outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 shadow-sm transition-all cursor-pointer appearance-none hover:border-blue-200"
                                            >
                                                <option>Instant</option>
                                                <option>Daily Digest</option>
                                                <option>Weekly Report</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest">System Sounds</p>
                                                <p className="text-[9px] text-[var(--text-muted)] font-medium tracking-tight">Play audio cues for new events</p>
                                            </div>
                                            <SettingToggle
                                                active={notifications.sound}
                                                onToggle={() => setNotifications(prev => ({ ...prev, sound: !prev.sound }))}
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {selectedCategory !== 'theme' && (
                            <div className="mt-16 md:mt-24 flex flex-col sm:flex-row items-center justify-end gap-4 md:gap-8 border-t border-slate-50 pt-12">
                                <button
                                    onClick={handleDiscard}
                                    className="w-full sm:w-auto px-10 py-4.5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-300"
                                >
                                    Discard All
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="w-full sm:w-auto px-12 py-4.5 bg-blue-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-500"
                                >
                                    Keep Changes
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const SettingToggle = ({ active, onToggle }) => (
    <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner overflow-hidden ${active ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-main)]/80 border border-[var(--border-color)]'}`}
    >
        <motion.div
            animate={{ x: active ? 26 : 2 }}
            className={`absolute top-1 w-4 h-4 rounded-full shadow-lg`}
            style={{ backgroundColor: 'white' }}
        />
    </button>
);

export default AdminDashboard;
