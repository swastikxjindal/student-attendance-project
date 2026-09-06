import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import PieChart from '../components/PieChart';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    Layout,
    ShieldCheck,
    TrendingUp,
    MapPin,
    Search,
    PieChart as PieIcon,
    Camera,
    Briefcase,
    Lock,
    Globe,
    Palette,
    Mail,
    FileText,
    History,
    ChevronRight,
    Users
} from 'lucide-react';

import { toast } from 'react-toastify';


const UserDashboard = () => {

    const location = useLocation();

    // =========================
    // STATES
    // =========================

    const [employees, setEmployees] = useState([]);

    const [attendanceMap, setAttendanceMap] = useState({});

    const [attendanceSummary, setAttendanceSummary] = useState(null);

    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');

    const [isLoading, setIsLoading] = useState(true);

    const [selectedUserId, setSelectedUserId] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [showLeaveForm, setShowLeaveForm] = useState(false);

    const [leaves, setLeaves] = useState([]);

    const [leaveFormData, setLeaveFormData] = useState({
        type: 'Annual Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });


    // =========================
    // ACTIVE TAB
    // =========================

    const activeTab = useMemo(() => {

        const path = location.pathname;

        if (path.includes('/profile')) {
            return 'profile';
        }

        if (path.includes('/attendance')) {
            return 'attendance';
        }

        if (path.includes('/leaves')) {
            return 'leaves';
        }

        return 'dashboard';

    }, [location.pathname]);


    // =========================
    // FETCH ALL DATA
    // =========================

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {

        setIsLoading(true);

        try {

            // -------------------------
            // EMPLOYEES
            // -------------------------

            const empRes = await API.get('/employees');

            setEmployees(empRes.data);

            if (empRes.data.length > 0) {
                setSelectedUserId(empRes.data[0].id);
            }


            // -------------------------
            // ATTENDANCE
            // -------------------------

            const attRes = await API.get('/attendance');

            // Save all attendance records
            setAttendanceRecords(attRes.data);


            // Today's attendance map
            const today = new Date()
                .toISOString()
                .split('T')[0];

            const map = {};

            attRes.data.forEach(record => {

                const recordDate =
                    new Date(record.date)
                        .toISOString()
                        .split('T')[0];

                if (recordDate === today) {

                    map[record.employee_id] =
                        record.status;

                }

            });

            setAttendanceMap(map);


            // -------------------------
            // LEAVES
            // -------------------------

            const leaveRes = await API.get('/leaves');

            setLeaves(leaveRes.data);

        }

        catch (error) {

            console.error('Fetch error:', error);

            toast.error(
                error.response?.data?.message ||
                'Failed to load dashboard data'
            );

        }

        finally {

            setIsLoading(false);

        }

    };


    // =========================
    // ATTENDANCE SUMMARY
    // =========================

    const fetchAttendanceSummary = async (employeeId) => {

        if (!employeeId) {
            return;
        }

        try {

            const res = await API.get(
                `/attendance/summary/${employeeId}`
            );

            setAttendanceSummary(res.data);

        }

        catch (error) {

            console.error(
                'Attendance summary error:',
                error
            );

            setAttendanceSummary(null);

        }

    };


    // =========================
    // FETCH SUMMARY WHEN
    // STUDENT CHANGES
    // =========================

    useEffect(() => {

        if (selectedUserId) {

            fetchAttendanceSummary(
                selectedUserId
            );

        }

    }, [selectedUserId]);


    // =========================
    // MARK ATTENDANCE
    // =========================

    const handleMarkAttendance = async (
        employeeId,
        status
    ) => {

        try {

            const today = new Date()
                .toISOString()
                .split('T')[0];


            // Send to MySQL
            await API.post(
                '/attendance',
                {
                    employeeId,
                    date: today,
                    status
                }
            );


            // Update today's status
            setAttendanceMap(prev => ({
                ...prev,
                [employeeId]: status
            }));


            // Get latest attendance records
            const attRes =
                await API.get('/attendance');

            setAttendanceRecords(
                attRes.data
            );


            // Refresh selected student's summary
            if (
                employeeId === selectedUserId
            ) {

                await fetchAttendanceSummary(
                    employeeId
                );

            }


            toast.success(
                `Marked as ${status}`
            );

        }

        catch (error) {

            console.error(
                'Attendance error:',
                error
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to sync attendance'
            );

        }

    };


    // =========================
    // LEAVE SUBMIT
    // =========================

    const handleLeaveSubmit = async (e) => {

        if (e) {
            e.preventDefault();
        }


        if (!selectedUserId) {

            toast.error(
                'Please select an employee first'
            );

            return;

        }


        if (
            !leaveFormData.startDate ||
            !leaveFormData.endDate ||
            !leaveFormData.reason
        ) {

            toast.error(
                'Please fill all required fields'
            );

            return;

        }


        try {

            const res = await API.post(
                '/leaves',
                {
                    employeeId: selectedUserId,
                    ...leaveFormData
                }
            );


            if (res.data.success) {

                toast.success(
                    'Leave request submitted successfully'
                );


                setShowLeaveForm(false);


                setLeaveFormData({
                    type: 'Annual Leave',
                    startDate: '',
                    endDate: '',
                    reason: ''
                });


                // Refresh leaves
                const leaveRes =
                    await API.get('/leaves');

                setLeaves(
                    leaveRes.data
                );

            }

        }

        catch (error) {

            console.error(
                'Leave error:',
                error
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to submit request'
            );

        }

    };


    // =========================
    // SEARCH AUTO SCROLL
    // =========================

    useEffect(() => {

        const perfectMatch =
            employees.find(
                emp =>
                    emp.name.toLowerCase() ===
                    searchTerm.toLowerCase()
            );


        if (
            perfectMatch &&
            searchTerm
        ) {

            const timer =
                setTimeout(() => {

                    const element =
                        document.getElementById(
                            `emp-card-${perfectMatch.id}`
                        );


                    if (element) {

                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });

                    }

                }, 100);


            return () =>
                clearTimeout(timer);

        }

    }, [
        searchTerm,
        employees
    ]);


    // =========================
    // FILTERED EMPLOYEES
    // =========================

    const filteredEmployees = useMemo(() => {

        return employees.filter(emp =>

            emp.name
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )

            ||

            emp.position
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )

            ||

            emp.department
                ?.toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )

        );

    }, [
        employees,
        searchTerm
    ]);


    // =========================
    // FILTERED LEAVES
    // =========================

    const filteredLeaves = useMemo(() => {

        return leaves.filter(
            leave =>
                leave.employee_id ===
                selectedUserId
        );

    }, [
        leaves,
        selectedUserId
    ]);


    // =========================
    // SELECTED USER
    // =========================

    const selectedUser = useMemo(() => {

        return (
            employees.find(
                emp =>
                    emp.id === selectedUserId
            )
            ||
            employees[0]
        );

    }, [
        employees,
        selectedUserId
    ]);


    // =========================
    // LOADING SCREEN
    // =========================

    if (isLoading) {

        return (

            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">

                <div className="flex flex-col items-center gap-4">

                    <div
                        className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"
                    />

                    <p
                        className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] animate-pulse"
                    >
                        Initializing Console...
                    </p>

                </div>

            </div>

        );

    }


    // =========================
    // MAIN UI
    // =========================

    return (

        <div className="flex min-h-screen bg-[var(--bg-main)] selection:bg-[var(--brand-primary)]/20 selection:text-[var(--brand-primary)] text-left relative">


            {/* SIDEBAR */}

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />


            <div
                className={`flex-grow transition-all duration-300 ${
                    isSidebarOpen
                        ? 'lg:ml-72'
                        : 'ml-0 lg:ml-72'
                }`}
            >


                {/* BACKGROUND EFFECT */}

                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden text-left">

                    <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-[var(--brand-primary)]/10 rounded-full blur-[140px]" />

                    <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[var(--brand-secondary)]/10 rounded-full blur-[140px]" />

                </div>


                {/* NAVBAR */}

                <Navbar

                    title={
                        activeTab === 'profile'
                            ? 'Personnel Detail'
                            : 'Console Operations'
                    }

                    badge="Personnel Console"

                    subtitle={
                        activeTab === 'profile'
                            ? 'Employee Information Feed'
                            : 'Management Mode Active'
                    }

                    onMenuClick={() =>
                        setIsSidebarOpen(
                            !isSidebarOpen
                        )
                    }

                    isSidebarOpen={
                        isSidebarOpen
                    }

                />


                {/* MAIN */}

                <main className="max-w-full mx-auto px-4 pt-16 md:pt-4 pb-4 flex flex-col">

                    <AnimatePresence mode="wait">

                        <div className="flex-grow flex flex-col gap-4 overflow-hidden">


                            {/* =====================================================
                                PROFILE
                            ===================================================== */}

                            {activeTab === 'profile' ? (

                                <motion.div

                                    key="personnel"

                                    initial={{
                                        opacity: 0
                                    }}

                                    animate={{
                                        opacity: 1
                                    }}

                                    className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden"

                                >

                                    {/* PERSONNEL LIST */}

                                    <div className="lg:col-span-1 h-full flex flex-col gap-4">

                                        <div
                                            className="backdrop-blur-3xl rounded-[2.5rem] p-4 border h-full flex flex-col"

                                            style={{
                                                backgroundColor:
                                                    'var(--bg-card)',

                                                borderColor:
                                                    'var(--border-color)'
                                            }}
                                        >

                                            <div className="flex items-center gap-3 mb-6 px-2 shrink-0">

                                                <div className="w-8 h-8 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl flex items-center justify-center">

                                                    <Users size={14} />

                                                </div>

                                                <h3
                                                    className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80"

                                                    style={{
                                                        color:
                                                            'var(--text-main)'
                                                    }}
                                                >
                                                    Personnel List
                                                </h3>

                                            </div>


                                            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto flex-grow pb-4 lg:pb-0 custom-scrollbar pr-1">

                                                {employees.map(emp => (

                                                    <button

                                                        key={emp.id}

                                                        onClick={() =>
                                                            setSelectedUserId(
                                                                emp.id
                                                            )
                                                        }

                                                        className={`lg:w-full flex-shrink-0 flex items-center justify-between px-5 py-3 rounded-full transition-all duration-700 group hover:-translate-y-0.5 ${
                                                            selectedUserId ===
                                                            emp.id

                                                                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 ring-4 ring-blue-600/10'

                                                                : 'hover:bg-blue-50/10 border border-transparent'
                                                        }`}

                                                        style={
                                                            selectedUserId !==
                                                            emp.id

                                                                ? {
                                                                    color:
                                                                        'var(--text-muted)'
                                                                }

                                                                : {}
                                                        }
                                                    >

                                                        <div className="flex items-center gap-3 min-w-0">

                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] transition-colors shrink-0 ${
                                                                    selectedUserId ===
                                                                    emp.id

                                                                        ? 'bg-white/20'

                                                                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)] group-hover:bg-blue-100 group-hover:text-blue-600'
                                                                }`}
                                                            >
                                                                {emp.name.charAt(
                                                                    0
                                                                )}
                                                            </div>


                                                            <div className="text-left min-w-0">

                                                                <p className="text-[10px] md:text-[12px] font-black uppercase tracking-tight leading-tight">

                                                                    {emp.name}

                                                                </p>


                                                                <p
                                                                    className={`text-[7px] md:text-[8px] font-bold uppercase tracking-[0.05em] hidden md:block leading-none mt-1 ${
                                                                        selectedUserId ===
                                                                        emp.id
                                                                            ? 'text-white/60'
                                                                            : 'text-[var(--text-muted)]'
                                                                    }`}
                                                                >

                                                                    {
                                                                        emp.position
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>


                                                        {
                                                            selectedUserId ===
                                                            emp.id &&

                                                            <ChevronRight
                                                                size={12}
                                                                className="opacity-60 hidden lg:block shrink-0"
                                                            />
                                                        }

                                                    </button>

                                                ))}

                                            </div>

                                        </div>

                                    </div>


                                    {/* PROFILE */}

                                    <div className="lg:col-span-3 overflow-y-auto pb-10">

                                        <AnimatePresence mode="wait">

                                            <motion.div

                                                key={
                                                    selectedUserId
                                                }

                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.98
                                                }}

                                                animate={{
                                                    opacity: 1,
                                                    scale: 1
                                                }}

                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.98
                                                }}

                                                transition={{
                                                    duration: 0.3
                                                }}
                                            >

                                                <ProfileView
                                                    user={
                                                        selectedUser
                                                    }
                                                />

                                            </motion.div>

                                        </AnimatePresence>

                                    </div>

                                </motion.div>


                            ) : activeTab === 'attendance' ? (


                                /* =====================================================
                                   ATTENDANCE STREAM
                                ===================================================== */

                                <motion.div

                                    key="attendance"

                                    initial={{
                                        opacity: 0,
                                        y: 10
                                    }}

                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}

                                    className="backdrop-blur-3xl rounded-[2.5rem] p-3 md:p-8 border h-full overflow-hidden flex flex-col"

                                    style={{
                                        backgroundColor:
                                            'var(--bg-card)',

                                        borderColor:
                                            'var(--border-color)'
                                    }}
                                >

                                    <div className="flex items-center justify-between mb-4 md:mb-8">

                                        <div className="flex items-center gap-2.5 md:gap-4">

                                            <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-600/10 text-blue-500 rounded-[14px] md:rounded-2xl flex items-center justify-center border border-blue-500/20">

                                                <History
                                                    size={16}
                                                    className="md:w-5 md:h-5"
                                                />

                                            </div>


                                            <div>

                                                <h2
                                                    className="text-sm md:text-xl font-black uppercase tracking-tighter"

                                                    style={{
                                                        color:
                                                            'var(--text-main)'
                                                    }}
                                                >
                                                    Attendance Stream
                                                </h2>


                                                <p
                                                    className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest mt-0.5 md:mt-1"

                                                    style={{
                                                        color:
                                                            'var(--text-muted)'
                                                    }}
                                                >
                                                    Real-time status tracking
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    <div className="flex-grow overflow-auto">


                                        {/* DESKTOP */}

                                        <div className="hidden md:block min-w-[800px]">

                                            <table className="w-full text-left border-collapse">

                                                <thead>

                                                    <tr
                                                        className="border-b"

                                                        style={{
                                                            borderColor:
                                                                'var(--border-color)'
                                                        }}
                                                    >

                                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em]"
                                                            style={{
                                                                color:
                                                                    'var(--text-muted)'
                                                            }}
                                                        >
                                                            Date / Time
                                                        </th>


                                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em]"
                                                            style={{
                                                                color:
                                                                    'var(--text-muted)'
                                                            }}
                                                        >
                                                            Employee
                                                        </th>


                                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em]"
                                                            style={{
                                                                color:
                                                                    'var(--text-muted)'
                                                            }}
                                                        >
                                                            Status
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody
                                                    className="divide-y"

                                                    style={{
                                                        borderColor:
                                                            'var(--border-color)'
                                                    }}
                                                >

                                                    {attendanceRecords.length > 0 ? (

                                                        attendanceRecords.map(
                                                            record => (

                                                                <tr

                                                                    key={
                                                                        record.id
                                                                    }

                                                                    className="group hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                                                >

                                                                    <td className="px-6 py-4">

                                                                        <div className="flex items-center gap-3">

                                                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">

                                                                                <Clock
                                                                                    size={14}
                                                                                />

                                                                            </div>


                                                                            <div>

                                                                                <p
                                                                                    className="text-[11px] font-black uppercase tracking-tight"

                                                                                    style={{
                                                                                        color:
                                                                                            'var(--text-main)'
                                                                                    }}
                                                                                >

                                                                                    {
                                                                                        new Date(
                                                                                            record.date
                                                                                        ).toLocaleDateString()
                                                                                    }

                                                                                </p>


                                                                                <p
                                                                                    className="text-[9px] font-bold uppercase tracking-widest opacity-60"

                                                                                    style={{
                                                                                        color:
                                                                                            'var(--text-muted)'
                                                                                    }}
                                                                                >

                                                                                    {
                                                                                        record.timestamp
                                                                                            ? new Date(
                                                                                                record.timestamp
                                                                                            ).toLocaleTimeString(
                                                                                                [],
                                                                                                {
                                                                                                    hour: '2-digit',
                                                                                                    minute: '2-digit'
                                                                                                }
                                                                                            )
                                                                                            : '--'
                                                                                    }

                                                                                </p>

                                                                            </div>

                                                                        </div>

                                                                    </td>


                                                                    <td className="px-6 py-4">

                                                                        <div className="flex items-center gap-2">

                                                                            <User
                                                                                size={14}
                                                                                className="text-blue-500"
                                                                            />

                                                                            <span
                                                                                className="text-[11px] font-bold uppercase tracking-tight"

                                                                                style={{
                                                                                    color:
                                                                                        'var(--text-main)'
                                                                                }}
                                                                            >

                                                                                {
                                                                                    record.employee_name
                                                                                }

                                                                            </span>

                                                                        </div>

                                                                    </td>


                                                                    <td className="px-6 py-4">

                                                                        <AttendanceStatus
                                                                            status={
                                                                                record.status
                                                                            }
                                                                        />

                                                                    </td>

                                                                </tr>

                                                            )
                                                        )

                                                    ) : (

                                                        <tr>

                                                            <td
                                                                colSpan="3"
                                                                className="text-center py-10 text-[10px] font-black uppercase tracking-widest"

                                                                style={{
                                                                    color:
                                                                        'var(--text-muted)'
                                                                }}
                                                            >
                                                                No attendance records found
                                                            </td>

                                                        </tr>

                                                    )}

                                                </tbody>

                                            </table>

                                        </div>


                                        {/* MOBILE */}

                                        <div className="md:hidden space-y-2.5 pb-6">

                                            {attendanceRecords.length > 0 ? (

                                                attendanceRecords.map(
                                                    record => (

                                                        <div

                                                            key={
                                                                record.id
                                                            }

                                                            className="p-3 rounded-xl border"

                                                            style={{
                                                                backgroundColor:
                                                                    'var(--bg-main)',

                                                                borderColor:
                                                                    'var(--border-color)'
                                                            }}
                                                        >

                                                            <div className="flex justify-between items-start mb-2">

                                                                <div className="flex items-center gap-2.5">

                                                                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">

                                                                        <Clock
                                                                            size={12}
                                                                        />

                                                                    </div>


                                                                    <div>

                                                                        <p
                                                                            className="text-[9px] font-black uppercase tracking-tight"

                                                                            style={{
                                                                                color:
                                                                                    'var(--text-main)'
                                                                            }}
                                                                        >

                                                                            {
                                                                                new Date(
                                                                                    record.date
                                                                                ).toLocaleDateString()
                                                                            }

                                                                        </p>


                                                                        <p
                                                                            className="text-[7px] font-bold uppercase tracking-widest opacity-60"

                                                                            style={{
                                                                                color:
                                                                                    'var(--text-muted)'
                                                                            }}
                                                                        >

                                                                            {
                                                                                record.employee_name
                                                                            }

                                                                        </p>

                                                                    </div>

                                                                </div>


                                                                <AttendanceStatus
                                                                    status={
                                                                        record.status
                                                                    }
                                                                    mobile
                                                                />

                                                            </div>


                                                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">

                                                                <Clock
                                                                    size={9}
                                                                    className="text-blue-500 shrink-0"
                                                                />


                                                                <span
                                                                    className="text-[8px] font-bold uppercase tracking-tight truncate"

                                                                    style={{
                                                                        color:
                                                                            'var(--text-main)'
                                                                    }}
                                                                >

                                                                    {
                                                                        record.timestamp
                                                                            ? new Date(
                                                                                record.timestamp
                                                                            ).toLocaleTimeString(
                                                                                [],
                                                                                {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                }
                                                                            )
                                                                            : '--'
                                                                    }

                                                                </span>

                                                            </div>

                                                        </div>

                                                    )
                                                )

                                            ) : (

                                                <div className="text-center py-10">

                                                    <p
                                                        className="text-[10px] font-black uppercase tracking-widest"

                                                        style={{
                                                            color:
                                                                'var(--text-muted)'
                                                        }}
                                                    >
                                                        No attendance records found
                                                    </p>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </motion.div>


                            ) : activeTab === 'leaves' ? (


                                /* =====================================================
                                   LEAVES
                                ===================================================== */

                                <motion.div

                                    key="leaves"

                                    initial={{
                                        opacity: 0
                                    }}

                                    animate={{
                                        opacity: 1
                                    }}

                                    className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden text-left"
                                >

                                    {/* PERSONNEL SIDEBAR */}

                                    <div className="lg:col-span-1 h-full flex flex-col gap-4">

                                        <div
                                            className="backdrop-blur-3xl rounded-[2.5rem] p-4 border h-full flex flex-col"

                                            style={{
                                                backgroundColor:
                                                    'var(--bg-card)',

                                                borderColor:
                                                    'var(--border-color)'
                                            }}
                                        >

                                            <div className="flex items-center gap-3 mb-6 px-2 shrink-0">

                                                <div className="w-8 h-8 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl flex items-center justify-center">

                                                    <Users
                                                        size={14}
                                                    />

                                                </div>


                                                <h3
                                                    className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80"

                                                    style={{
                                                        color:
                                                            'var(--text-main)'
                                                    }}
                                                >
                                                    Select Member
                                                </h3>

                                            </div>


                                            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto flex-grow pb-4 lg:pb-0 custom-scrollbar pr-1">

                                                {employees.map(
                                                    emp => (

                                                        <button

                                                            key={
                                                                emp.id
                                                            }

                                                            onClick={() =>
                                                                setSelectedUserId(
                                                                    emp.id
                                                                )
                                                            }

                                                            className={`lg:w-full flex-shrink-0 flex items-center justify-between px-5 py-3 rounded-full transition-all duration-700 group hover:-translate-y-0.5 ${
                                                                selectedUserId ===
                                                                emp.id

                                                                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 ring-4 ring-blue-600/10'

                                                                    : 'hover:bg-blue-50/10 border border-transparent'
                                                            }`}

                                                            style={
                                                                selectedUserId !==
                                                                emp.id
                                                                    ? {
                                                                        color:
                                                                            'var(--text-muted)'
                                                                    }
                                                                    : {}
                                                            }
                                                        >

                                                            <div className="flex items-center gap-3 min-w-0">

                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] transition-colors shrink-0 ${
                                                                        selectedUserId ===
                                                                        emp.id

                                                                            ? 'bg-white/20'

                                                                            : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)] group-hover:bg-blue-100 group-hover:text-blue-600'
                                                                    }`}
                                                                >

                                                                    {
                                                                        emp.name.charAt(
                                                                            0
                                                                        )
                                                                    }

                                                                </div>


                                                                <div className="text-left min-w-0">

                                                                    <p className="text-[10px] md:text-[12px] font-black uppercase tracking-tight leading-tight">

                                                                        {
                                                                            emp.name
                                                                        }

                                                                    </p>

                                                                </div>

                                                            </div>


                                                            {
                                                                selectedUserId ===
                                                                emp.id &&

                                                                <ChevronRight
                                                                    size={12}
                                                                    className="opacity-60 hidden lg:block shrink-0"
                                                                />
                                                            }

                                                        </button>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    </div>


                                    {/* LEAVES CONTENT */}

                                    <div className="lg:col-span-3 overflow-y-auto pb-10">

                                        <div
                                            className="backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 border min-h-full flex flex-col relative"

                                            style={{
                                                backgroundColor:
                                                    'var(--bg-card)',

                                                borderColor:
                                                    'var(--border-color)'
                                            }}
                                        >

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">

                                                <div className="flex items-center gap-4">

                                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20">

                                                        <Calendar
                                                            size={20}
                                                        />

                                                    </div>


                                                    <div>

                                                        <h2
                                                            className="text-lg md:text-xl font-black uppercase tracking-tighter"

                                                            style={{
                                                                color:
                                                                    'var(--text-main)'
                                                            }}
                                                        >
                                                            Leave Registry
                                                        </h2>


                                                        <p
                                                            className="text-[9px] font-bold uppercase tracking-widest mt-1"

                                                            style={{
                                                                color:
                                                                    'var(--text-muted)'
                                                            }}
                                                        >

                                                            {
                                                                selectedUser
                                                                    ? `MANAGING: ${selectedUser.name}`
                                                                    : 'Manage your time off'
                                                            }

                                                        </p>

                                                    </div>

                                                </div>


                                                {!showLeaveForm && (

                                                    <button

                                                        onClick={() =>
                                                            setShowLeaveForm(
                                                                true
                                                            )
                                                        }

                                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                                                    >

                                                        <span>
                                                            New Request
                                                        </span>

                                                        <ChevronRight
                                                            size={12}
                                                            className="group-hover:translate-x-1 transition-transform"
                                                        />

                                                    </button>

                                                )}

                                            </div>


                                            <div className="flex-grow overflow-y-auto relative">

                                                <AnimatePresence mode="wait">

                                                    {showLeaveForm ? (

                                                        <motion.div

                                                            key="form"

                                                            initial={{
                                                                opacity: 0,
                                                                x: 20
                                                            }}

                                                            animate={{
                                                                opacity: 1,
                                                                x: 0
                                                            }}

                                                            exit={{
                                                                opacity: 0,
                                                                x: -20
                                                            }}

                                                            className="max-w-2xl mx-auto py-4"
                                                        >

                                                            <div className="space-y-6">

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                                    <div className="space-y-2">

                                                                        <label
                                                                            className="text-[9px] font-black uppercase tracking-widest ml-1"

                                                                            style={{
                                                                                color:
                                                                                    'var(--text-muted)'
                                                                            }}
                                                                        >
                                                                            Type
                                                                        </label>


                                                                        <select

                                                                            value={
                                                                                leaveFormData.type
                                                                            }

                                                                            onChange={e =>
                                                                                setLeaveFormData({
                                                                                    ...leaveFormData,
                                                                                    type: e.target.value
                                                                                })
                                                                            }

                                                                            className="w-full px-4 py-3 rounded-xl border bg-transparent text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"

                                                                            style={{
                                                                                borderColor:
                                                                                    'var(--border-color)',

                                                                                color:
                                                                                    'var(--text-main)'
                                                                            }}
                                                                        >

                                                                            <option className="bg-[var(--bg-card)]">
                                                                                Annual Leave
                                                                            </option>

                                                                            <option className="bg-[var(--bg-card)]">
                                                                                Sick Leave
                                                                            </option>

                                                                            <option className="bg-[var(--bg-card)]">
                                                                                Casual Leave
                                                                            </option>

                                                                        </select>

                                                                    </div>


                                                                    <div className="space-y-2">

                                                                        <label
                                                                            className="text-[9px] font-black uppercase tracking-widest ml-1"

                                                                            style={{
                                                                                color:
                                                                                    'var(--text-muted)'
                                                                            }}
                                                                        >
                                                                            Duration
                                                                        </label>


                                                                        <div className="flex flex-col sm:flex-row items-center gap-2">

                                                                            <input

                                                                                type="date"

                                                                                value={
                                                                                    leaveFormData.startDate
                                                                                }

                                                                                onChange={e =>
                                                                                    setLeaveFormData({
                                                                                        ...leaveFormData,
                                                                                        startDate: e.target.value
                                                                                    })
                                                                                }

                                                                                className="w-full px-4 py-3 rounded-xl border bg-transparent text-xs font-bold outline-none"

                                                                                style={{
                                                                                    borderColor:
                                                                                        'var(--border-color)',

                                                                                    color:
                                                                                        'var(--text-main)'
                                                                                }}
                                                                            />


                                                                            <span className="text-[var(--text-muted)] hidden sm:block">
                                                                                -
                                                                            </span>


                                                                            <input

                                                                                type="date"

                                                                                value={
                                                                                    leaveFormData.endDate
                                                                                }

                                                                                onChange={e =>
                                                                                    setLeaveFormData({
                                                                                        ...leaveFormData,
                                                                                        endDate: e.target.value
                                                                                    })
                                                                                }

                                                                                className="w-full px-4 py-3 rounded-xl border bg-transparent text-xs font-bold outline-none"

                                                                                style={{
                                                                                    borderColor:
                                                                                        'var(--border-color)',

                                                                                    color:
                                                                                        'var(--text-main)'
                                                                                }}
                                                                            />

                                                                        </div>

                                                                    </div>

                                                                </div>


                                                                <div className="space-y-2">

                                                                    <label
                                                                        className="text-[9px] font-black uppercase tracking-widest ml-1"

                                                                        style={{
                                                                            color:
                                                                                'var(--text-muted)'
                                                                        }}
                                                                    >
                                                                        Reason
                                                                    </label>


                                                                    <textarea

                                                                        rows="4"

                                                                        value={
                                                                            leaveFormData.reason
                                                                        }

                                                                        onChange={e =>
                                                                            setLeaveFormData({
                                                                                ...leaveFormData,
                                                                                reason: e.target.value
                                                                            })
                                                                        }

                                                                        placeholder="Describe your request..."

                                                                        className="w-full px-4 py-3 rounded-xl border bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"

                                                                        style={{
                                                                            borderColor:
                                                                                'var(--border-color)',

                                                                            color:
                                                                                'var(--text-main)'
                                                                        }}

                                                                    />

                                                                </div>


                                                                <div className="flex items-center gap-4 pt-4">

                                                                    <button

                                                                        onClick={
                                                                            handleLeaveSubmit
                                                                        }

                                                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        Submit Request
                                                                    </button>


                                                                    <button

                                                                        onClick={() =>
                                                                            setShowLeaveForm(
                                                                                false
                                                                            )
                                                                        }

                                                                        className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border hover:bg-[var(--bg-main)] transition-colors"

                                                                        style={{
                                                                            borderColor:
                                                                                'var(--border-color)',

                                                                            color:
                                                                                'var(--text-muted)'
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </button>

                                                                </div>

                                                            </div>

                                                        </motion.div>

                                                    ) : (

                                                        <motion.div

                                                            key="list"

                                                            initial={{
                                                                opacity: 0,
                                                                x: -20
                                                            }}

                                                            animate={{
                                                                opacity: 1,
                                                                x: 0
                                                            }}

                                                            exit={{
                                                                opacity: 0,
                                                                x: 20
                                                            }}

                                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                                        >

                                                            {filteredLeaves.length > 0

                                                                ? filteredLeaves.map(
                                                                    leave => (

                                                                        <div

                                                                            key={
                                                                                leave.id
                                                                            }

                                                                            className="p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden"

                                                                            style={{
                                                                                backgroundColor:
                                                                                    'var(--bg-main)',

                                                                                borderColor:
                                                                                    'var(--border-color)'
                                                                            }}
                                                                        >

                                                                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-10 translate-x-10 blur-xl group-hover:bg-blue-500/10 transition-colors" />


                                                                            <div className="flex justify-between items-start mb-4 relative z-10">

                                                                                <div className="flex flex-col pr-2">

                                                                                    <span
                                                                                        className="text-[10px] font-black opacity-40 uppercase tracking-wider mb-1"

                                                                                        style={{
                                                                                            color:
                                                                                                'var(--text-main)'
                                                                                        }}
                                                                                    >
                                                                                        #LR-
                                                                                        {leave.id
                                                                                            .toString()
                                                                                            .padStart(
                                                                                                3,
                                                                                                '0'
                                                                                            )}
                                                                                    </span>


                                                                                    <h4
                                                                                        className="text-[11px] md:text-sm font-black uppercase tracking-tight leading-tight"

                                                                                        style={{
                                                                                            color:
                                                                                                'var(--text-main)'
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            leave.type
                                                                                        }
                                                                                    </h4>


                                                                                    <p className="text-[8px] font-bold text-blue-500 uppercase mt-0.5">

                                                                                        {
                                                                                            leave.employee_name
                                                                                        }

                                                                                    </p>

                                                                                </div>


                                                                                <span
                                                                                    className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${
                                                                                        leave.status ===
                                                                                        'approved'

                                                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'

                                                                                            : leave.status ===
                                                                                              'rejected'

                                                                                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'

                                                                                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                                    }`}
                                                                                >

                                                                                    {
                                                                                        leave.status
                                                                                    }

                                                                                </span>

                                                                            </div>


                                                                            <div className="mb-4 relative z-10 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-inner">

                                                                                <div className="flex items-center justify-between gap-2">

                                                                                    <div className="min-w-0">

                                                                                        <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-0.5">
                                                                                            Start
                                                                                        </p>


                                                                                        <p
                                                                                            className="text-[9px] md:text-[10px] font-black uppercase truncate"

                                                                                            style={{
                                                                                                color:
                                                                                                    'var(--text-main)'
                                                                                            }}
                                                                                        >

                                                                                            {
                                                                                                new Date(
                                                                                                    leave.start_date
                                                                                                ).toLocaleDateString(
                                                                                                    'en-US',
                                                                                                    {
                                                                                                        month: 'short',
                                                                                                        day: 'numeric'
                                                                                                    }
                                                                                                )
                                                                                            }

                                                                                        </p>

                                                                                    </div>


                                                                                    <div className="h-px flex-grow bg-slate-200/50" />


                                                                                    <div className="text-right min-w-0">

                                                                                        <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-0.5">
                                                                                            End
                                                                                        </p>


                                                                                        <p
                                                                                            className="text-[9px] md:text-[10px] font-black uppercase truncate"

                                                                                            style={{
                                                                                                color:
                                                                                                    'var(--text-main)'
                                                                                            }}
                                                                                        >

                                                                                            {
                                                                                                new Date(
                                                                                                    leave.end_date
                                                                                                ).toLocaleDateString(
                                                                                                    'en-US',
                                                                                                    {
                                                                                                        month: 'short',
                                                                                                        day: 'numeric'
                                                                                                    }
                                                                                                )
                                                                                            }

                                                                                        </p>

                                                                                    </div>

                                                                                </div>

                                                                            </div>


                                                                            <p
                                                                                className="text-[10px] font-medium leading-relaxed opacity-80 relative z-10 line-clamp-3 italic"

                                                                                style={{
                                                                                    color:
                                                                                        'var(--text-muted)'
                                                                                }}
                                                                            >

                                                                                "
                                                                                {
                                                                                    leave.reason
                                                                                }
                                                                                "

                                                                            </p>

                                                                        </div>

                                                                    )
                                                                )

                                                                : (

                                                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-40">

                                                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">

                                                                            <FileText
                                                                                size={32}
                                                                            />

                                                                        </div>


                                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                                                                            No Active Requests
                                                                        </p>

                                                                    </div>

                                                                )}

                                                        </motion.div>

                                                    )}

                                                </AnimatePresence>

                                            </div>

                                        </div>

                                    </div>

                                </motion.div>


                            ) : (


                                /* =====================================================
                                   MAIN DASHBOARD
                                ===================================================== */

                                <motion.div

                                    key="dashboard"

                                    initial={{
                                        opacity: 0
                                    }}

                                    animate={{
                                        opacity: 1
                                    }}

                                    exit={{
                                        opacity: 0
                                    }}

                                    transition={{
                                        duration: 0.3
                                    }}

                                    className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-full"
                                >


                                    {/* LEFT SIDE */}

                                    <div className="xl:col-span-3 h-full flex flex-col gap-4 overflow-y-auto pr-2 pb-20">


                                        {/* SEARCH + STATS */}

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 sticky top-0 z-20 backdrop-blur-xl py-2">

                                            <div className="relative w-full md:w-[400px]">

                                                <Search
                                                    className="absolute left-4 top-1/2 -translate-y-1/2"
                                                    size={14}
                                                    style={{
                                                        color:
                                                            'var(--text-muted)'
                                                    }}
                                                />


                                                <input

                                                    type="text"

                                                    placeholder="Search registry..."

                                                    value={
                                                        searchTerm
                                                    }

                                                    onChange={e =>
                                                        setSearchTerm(
                                                            e.target.value
                                                        )
                                                    }

                                                    className="w-full pl-12 pr-6 py-3 border rounded-full text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 transition-all"

                                                    style={{
                                                        backgroundColor:
                                                            'var(--bg-card)',

                                                        borderColor:
                                                            'var(--border-color)',

                                                        color:
                                                            'var(--text-main)',

                                                        boxShadow:
                                                            '0 4px 20px var(--shadow-color)'
                                                    }}
                                                />

                                            </div>


                                            <div className="flex gap-2">

                                                <MiniStat
                                                    label="Personnel"
                                                    value={
                                                        employees.length
                                                    }
                                                    icon={
                                                        <Layout
                                                            size={12}
                                                        />
                                                    }
                                                />


                                                <MiniStat
                                                    label="Live"
                                                    value={
                                                        Object.values(
                                                            attendanceMap
                                                        ).filter(
                                                            s =>
                                                                s ===
                                                                'present'
                                                        ).length
                                                    }
                                                    icon={
                                                        <ShieldCheck
                                                            size={12}
                                                        />
                                                    }
                                                />

                                            </div>

                                        </div>


                                        {/* =====================================================
                                           ATTENDANCE ANALYTICS
                                        ===================================================== */}

                                        {attendanceSummary &&
                                            selectedUser && (

                                                <motion.div

                                                    initial={{
                                                        opacity: 0,
                                                        y: 10
                                                    }}

                                                    animate={{
                                                        opacity: 1,
                                                        y: 0
                                                    }}

                                                    className="mb-2"
                                                >

                                                    <div
                                                        className="rounded-[2rem] p-6 md:p-8 border shadow-sm"

                                                        style={{
                                                            backgroundColor:
                                                                'var(--bg-card)',

                                                            borderColor:
                                                                'var(--border-color)'
                                                        }}
                                                    >


                                                        {/* HEADER */}

                                                        <div className="flex items-center justify-between mb-6">

                                                            <div>

                                                                <p
                                                                    className="text-[8px] font-black uppercase tracking-[0.3em]"

                                                                    style={{
                                                                        color:
                                                                            'var(--text-muted)'
                                                                    }}
                                                                >
                                                                    Attendance Analytics
                                                                </p>


                                                                <h2
                                                                    className="text-lg md:text-xl font-black uppercase tracking-tight mt-1"

                                                                    style={{
                                                                        color:
                                                                            'var(--text-main)'
                                                                    }}
                                                                >
                                                                    {
                                                                        selectedUser.name
                                                                    }
                                                                </h2>

                                                            </div>


                                                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">

                                                                <TrendingUp
                                                                    size={18}
                                                                />

                                                            </div>

                                                        </div>


                                                        {/* STATISTICS */}

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">


                                                            {/* CURRENT */}

                                                            <div
                                                                className="p-4 rounded-2xl border"

                                                                style={{
                                                                    backgroundColor:
                                                                        'var(--bg-main)',

                                                                    borderColor:
                                                                        'var(--border-color)'
                                                                }}
                                                            >

                                                                <p
                                                                    className="text-[8px] font-black uppercase tracking-widest"

                                                                    style={{
                                                                        color:
                                                                            'var(--text-muted)'
                                                                    }}
                                                                >
                                                                    Current
                                                                </p>


                                                                <p className="text-2xl font-black text-blue-600 mt-2">

                                                                    {
                                                                        attendanceSummary.percentage
                                                                    }
                                                                    %

                                                                </p>

                                                            </div>


                                                            {/* ATTENDED */}

                                                            <div
                                                                className="p-4 rounded-2xl border"

                                                                style={{
                                                                    backgroundColor:
                                                                        'var(--bg-main)',

                                                                    borderColor:
                                                                        'var(--border-color)'
                                                                }}
                                                            >

                                                                <p
                                                                    className="text-[8px] font-black uppercase tracking-widest"

                                                                    style={{
                                                                        color:
                                                                            'var(--text-muted)'
                                                                    }}
                                                                >
                                                                    Attended
                                                                </p>


                                                                <p className="text-2xl font-black text-emerald-600 mt-2">

                                                                    {
                                                                        attendanceSummary.present
                                                                    }

                                                                </p>

                                                            </div>


                                                            {/* CONDUCTED */}

                                                            <div
                                                                className="p-4 rounded-2xl border"

                                                                style={{
                                                                    backgroundColor:
                                                                        'var(--bg-main)',

                                                                    borderColor:
                                                                        'var(--border-color)'
                                                                }}
                                                            >

                                                                <p
                                                                    className="text-[8px] font-black uppercase tracking-widest"

                                                                    style={{
                                                                        color:
                                                                            'var(--text-muted)'
                                                                    }}
                                                                >
                                                                    Conducted
                                                                </p>


                                                                <p
                                                                    className="text-2xl font-black mt-2"

                                                                    style={{
                                                                        color:
                                                                            'var(--text-main)'
                                                                    }}
                                                                >

                                                                    {
                                                                        attendanceSummary.conducted
                                                                    }

                                                                </p>

                                                            </div>


                                                            {/* ABSENT */}

                                                            <div
                                                                className="p-4 rounded-2xl border"

                                                                style={{
                                                                    backgroundColor:
                                                                        'var(--bg-main)',

                                                                    borderColor:
                                                                        'var(--border-color)'
                                                                }}
                                                            >

                                                                <p
                                                                    className="text-[8px] font-black uppercase tracking-widest"

                                                                    style={{
                                                                        color:
                                                                            'var(--text-muted)'
                                                                    }}
                                                                >
                                                                    Absent
                                                                </p>


                                                                <p className="text-2xl font-black text-rose-600 mt-2">

                                                                    {
                                                                        attendanceSummary.absent
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>


                                                        {/* NEXT LECTURE */}

                                                        <div className="mt-6">

                                                            <p
                                                                className="text-[8px] font-black uppercase tracking-[0.3em] mb-3"

                                                                style={{
                                                                    color:
                                                                        'var(--text-muted)'
                                                                }}
                                                            >
                                                                Next Lecture Simulation
                                                            </p>


                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                                                                {/* ATTEND */}

                                                                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">

                                                                    <div className="flex items-center justify-between">

                                                                        <div>

                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                                                                If I Attend
                                                                            </p>


                                                                            <p className="text-3xl font-black text-emerald-600 mt-2">

                                                                                {
                                                                                    attendanceSummary.nextLectureAttend
                                                                                }
                                                                                %

                                                                            </p>


                                                                            <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600/60 mt-1">
                                                                                Next lecture
                                                                            </p>

                                                                        </div>


                                                                        <CheckCircle
                                                                            size={28}
                                                                            className="text-emerald-500"
                                                                        />

                                                                    </div>

                                                                </div>


                                                                {/* MISS */}

                                                                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">

                                                                    <div className="flex items-center justify-between">

                                                                        <div>

                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-600">
                                                                                If I Miss
                                                                            </p>


                                                                            <p className="text-3xl font-black text-rose-600 mt-2">

                                                                                {
                                                                                    attendanceSummary.nextLectureMiss
                                                                                }
                                                                                %

                                                                            </p>


                                                                            <p className="text-[8px] font-bold uppercase tracking-wider text-rose-600/60 mt-1">
                                                                                Next lecture
                                                                            </p>

                                                                        </div>


                                                                        <XCircle
                                                                            size={28}
                                                                            className="text-rose-500"
                                                                        />

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>

                                                </motion.div>

                                            )}


                                        {/* EMPLOYEE CARDS */}

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                            <AnimatePresence mode="popLayout">

                                                {filteredEmployees.map(
                                                    emp => {

                                                        const isExactMatch =
                                                            searchTerm
                                                                .toLowerCase() ===
                                                            emp.name.toLowerCase();


                                                        return (

                                                            <motion.div

                                                                key={
                                                                    emp.id
                                                                }

                                                                initial={{
                                                                    opacity: 0,
                                                                    scale: 0.95
                                                                }}

                                                                animate={{
                                                                    opacity: 1,
                                                                    scale:
                                                                        isExactMatch
                                                                            ? 1.02
                                                                            : 1
                                                                }}

                                                                className={`bg-white rounded-[2rem] p-4 md:p-6 shadow-sm border transition-all duration-300 relative overflow-hidden ${
                                                                    isExactMatch
                                                                        ? 'border-blue-600 ring-4 ring-blue-600/5'
                                                                        : 'border-slate-50 hover:border-blue-400/30'
                                                                }`}

                                                                id={`emp-card-${emp.id}`}
                                                            >

                                                                {/* EMPLOYEE HEADER */}

                                                                <div className="flex items-start justify-between relative z-10">

                                                                    <div className="flex items-center gap-4 md:gap-6 overflow-hidden">

                                                                        <div
                                                                            className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-lg md:text-2xl transition-all shadow-md shrink-0 ${
                                                                                isExactMatch
                                                                                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                                                                                    : 'bg-slate-50 text-blue-600 border border-slate-100'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                emp.name.charAt(
                                                                                    0
                                                                                )
                                                                            }
                                                                        </div>


                                                                        <div className="overflow-hidden">

                                                                            <h3 className="text-sm md:text-xl font-black text-slate-800 tracking-tighter uppercase truncate leading-none mb-1">

                                                                                {
                                                                                    emp.name
                                                                                }

                                                                            </h3>


                                                                            <div className="flex items-center gap-1.5 md:gap-2">

                                                                                <span className="px-2 py-0.5 bg-blue-50 text-[7px] md:text-[9px] font-black uppercase tracking-widest text-blue-600 rounded-lg">

                                                                                    {
                                                                                        emp.position
                                                                                    }

                                                                                </span>


                                                                                <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">

                                                                                    {
                                                                                        emp.department
                                                                                    }

                                                                                </span>

                                                                            </div>

                                                                        </div>

                                                                    </div>


                                                                    {attendanceMap[
                                                                        emp.id
                                                                    ] && (

                                                                        <div
                                                                            className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.15em] border ${
                                                                                attendanceMap[
                                                                                    emp.id
                                                                                ] ===
                                                                                'present'

                                                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'

                                                                                    : attendanceMap[
                                                                                        emp.id
                                                                                    ] ===
                                                                                      'absent'

                                                                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'

                                                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                                            }`}
                                                                        >

                                                                            {
                                                                                attendanceMap[
                                                                                    emp.id
                                                                                ]
                                                                            }

                                                                        </div>

                                                                    )}

                                                                </div>


                                                                {/* ACTION BUTTONS */}

                                                                <div className="mt-8 grid grid-cols-3 gap-4 relative z-10">

                                                                    <AttendanceAction

                                                                        isActive={
                                                                            attendanceMap[
                                                                                emp.id
                                                                            ] ===
                                                                            'present'
                                                                        }

                                                                        onClick={() =>
                                                                            handleMarkAttendance(
                                                                                emp.id,
                                                                                'present'
                                                                            )
                                                                        }

                                                                        label="Register"

                                                                        color="emerald"

                                                                        icon={
                                                                            <CheckCircle
                                                                                size={18}
                                                                            />
                                                                        }

                                                                    />


                                                                    <AttendanceAction

                                                                        isActive={
                                                                            attendanceMap[
                                                                                emp.id
                                                                            ] ===
                                                                            'absent'
                                                                        }

                                                                        onClick={() =>
                                                                            handleMarkAttendance(
                                                                                emp.id,
                                                                                'absent'
                                                                            )
                                                                        }

                                                                        label="Absent"

                                                                        color="rose"

                                                                        icon={
                                                                            <XCircle
                                                                                size={18}
                                                                            />
                                                                        }

                                                                    />


                                                                    <AttendanceAction

                                                                        isActive={
                                                                            attendanceMap[
                                                                                emp.id
                                                                            ] ===
                                                                            'leave'
                                                                        }

                                                                        onClick={() =>
                                                                            handleMarkAttendance(
                                                                                emp.id,
                                                                                'leave'
                                                                            )
                                                                        }

                                                                        label="Off-Duty"

                                                                        color="amber"

                                                                        icon={
                                                                            <Clock
                                                                                size={18}
                                                                            />
                                                                        }

                                                                    />

                                                                </div>

                                                            </motion.div>

                                                        );

                                                    }
                                                )}

                                            </AnimatePresence>

                                        </div>

                                    </div>


                                    {/* =====================================================
                                       PIE CHART
                                    ===================================================== */}

                                    <div className="xl:col-span-1">

                                        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] shadow-sm border border-[var(--border-color)] sticky top-28">

                                            <div className="flex items-center gap-3 mb-8">

                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">

                                                    <PieIcon
                                                        size={16}
                                                    />

                                                </div>


                                                <h3
                                                    className="text-xs font-bold uppercase tracking-widest"

                                                    style={{
                                                        color:
                                                            'var(--text-main)'
                                                    }}
                                                >
                                                    Attendance Insights
                                                </h3>

                                            </div>


                                            <div className="scale-90 origin-top">

                                                <PieChart

                                                    data={[
                                                        {
                                                            label: 'Present',

                                                            value:
                                                                attendanceSummary
                                                                    ?.present ||
                                                                0,

                                                            color:
                                                                'var(--brand-primary)'
                                                        },

                                                        {
                                                            label: 'Absent',

                                                            value:
                                                                attendanceSummary
                                                                    ?.absent ||
                                                                0,

                                                            color:
                                                                '#f43f5e'
                                                        },

                                                        {
                                                            label: 'Leave',

                                                            value:
                                                                attendanceSummary
                                                                    ?.leave ||
                                                                0,

                                                            color:
                                                                '#f59e0b'
                                                        }
                                                    ]}

                                                />

                                            </div>


                                            {/* CURRENT PERCENTAGE */}

                                            <div className="mt-4 text-center">

                                                <p
                                                    className="text-[8px] font-black uppercase tracking-[0.3em]"

                                                    style={{
                                                        color:
                                                            'var(--text-muted)'
                                                    }}
                                                >
                                                    Current Attendance
                                                </p>


                                                <p className="text-3xl font-black text-blue-600 mt-2">

                                                    {
                                                        attendanceSummary
                                                            ?.percentage ??
                                                        0
                                                    }
                                                    %

                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </motion.div>

                            )}

                        </div>

                    </AnimatePresence>

                </main>

            </div>

        </div>

    );

};


// =====================================================
// ATTENDANCE STATUS
// =====================================================

const AttendanceStatus = ({
    status,
    mobile = false
}) => {

    const styles = {

        present:
            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',

        absent:
            'bg-rose-500/10 text-rose-600 border-rose-500/20',

        leave:
            'bg-amber-500/10 text-amber-600 border-amber-500/20'

    };


    return (

        <span
            className={`inline-flex items-center gap-1.5 ${
                mobile
                    ? 'px-1.5 py-0.5 text-[6px]'
                    : 'px-3 py-1 text-[9px]'
            } font-black uppercase tracking-widest rounded-full border ${
                styles[status] ||
                'bg-slate-500/10 text-slate-500 border-slate-500/20'
            }`}
        >

            <span
                className={`${
                    mobile
                        ? 'w-1 h-1'
                        : 'w-1.5 h-1.5'
                } rounded-full bg-current`}
            />

            {status}

        </span>

    );

};


// =====================================================
// PROFILE VIEW
// =====================================================

const ProfileView = ({
    user
}) => {

    const { theme } = useTheme();


    const activity = [

        {
            id: 1,
            type: 'Security',
            detail: 'Password changed successfully',
            time: '2h ago',
            icon: (
                <Lock
                    size={12}
                    className="text-amber-500"
                />
            )
        },

        {
            id: 2,
            type: 'Login',
            detail: 'Login from Chrome/Windows',
            time: '5h ago',
            icon: (
                <Globe
                    size={12}
                    className="text-blue-500"
                />
            )
        },

        {
            id: 3,
            type: 'Settings',
            detail: `Theme set to "${theme}"`,
            time: 'Yesterday',
            icon: (
                <Palette
                    size={12}
                    className="text-emerald-500"
                />
            )
        }

    ];


    const documents = [

        {
            name: 'Identity_Proof_2026.pdf',
            size: '1.2 MB',
            date: 'Jan 10'
        },

        {
            name: 'Contract.docx',
            size: '450 KB',
            date: 'Jan 01'
        }

    ];


    if (!user) {
        return null;
    }


    return (

        <div className="space-y-6">


            {/* HEADER */}

            <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 shadow-sm border border-[var(--border-color)] relative overflow-hidden group transition-colors duration-300">

                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />


                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">

                    <div className="relative shrink-0">

                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-8 ring-white transition-all">

                            {
                                user.name.charAt(
                                    0
                                )
                            }

                        </div>


                        <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--bg-card)] rounded-lg shadow-lg border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-all hover:scale-105 active:scale-95">

                            <Camera
                                size={14}
                            />

                        </button>

                    </div>


                    <div className="text-center md:text-left space-y-3 flex-grow">

                        <div>

                            <h1
                                className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-1"

                                style={{
                                    color:
                                        'var(--text-main)'
                                }}
                            >

                                {
                                    user.name
                                }

                            </h1>


                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">

                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md">

                                    <Mail
                                        size={10}
                                    />

                                    <span className="text-[9px] font-bold uppercase tracking-widest">

                                        {
                                            user.name
                                                .toLowerCase()
                                                .replace(
                                                    ' ',
                                                    '.'
                                                )
                                        }
                                        @organization.pro

                                    </span>

                                </div>


                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border shadow-sm"

                                    style={{
                                        backgroundColor:
                                            'var(--bg-main)',

                                        borderColor:
                                            'var(--border-color)',

                                        color:
                                            'var(--text-muted)'
                                    }}
                                >

                                    <MapPin
                                        size={10}
                                    />

                                    <span className="text-[9px] font-bold uppercase tracking-widest">
                                        San Francisco
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* PROFILE DETAILS */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">


                    {/* WORK CONTEXT */}

                    <div className="bg-[var(--bg-card)] rounded-[1.5rem] border border-[var(--border-color)] p-5 shadow-sm transition-colors duration-300">

                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">

                                <Briefcase
                                    size={14}
                                />

                            </div>


                            <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
                                Work Context
                            </h3>

                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {[

                                {
                                    label: 'Joined Date',
                                    value:
                                        user.joinDate ||
                                        'Jan 01, 2024',
                                    sub: '2.5Y Exp'
                                },

                                {
                                    label: 'Department',
                                    value:
                                        user.department,
                                    sub: 'Internal'
                                },

                                {
                                    label: 'Reporting',
                                    value:
                                        'Sarah Miller',
                                    sub: 'CTO'
                                }

                            ].map(
                                (
                                    item,
                                    i
                                ) => (

                                    <div
                                        key={i}
                                        className="space-y-1"
                                    >

                                        <p
                                            className="text-[8px] font-bold uppercase tracking-[0.25em]"

                                            style={{
                                                color:
                                                    'var(--text-muted)'
                                            }}
                                        >
                                            {
                                                item.label
                                            }
                                        </p>


                                        <p
                                            className="text-sm font-bold uppercase"

                                            style={{
                                                color:
                                                    'var(--text-main)'
                                            }}
                                        >
                                            {
                                                item.value
                                            }
                                        </p>


                                        <p
                                            className="text-[8px] font-bold opacity-60 uppercase"

                                            style={{
                                                color:
                                                    'var(--text-muted)'
                                            }}
                                        >
                                            {
                                                item.sub
                                            }
                                        </p>

                                    </div>

                                )
                            )}

                        </div>

                    </div>


                    {/* SECURITY + PREFERENCES */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                        {/* SECURITY */}

                        <div className="bg-[var(--bg-card)] rounded-[1.5rem] border border-[var(--border-color)] p-5 shadow-sm transition-colors duration-300">

                            <div className="flex items-center justify-between mb-5">

                                <div className="flex items-center gap-3">

                                    <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">

                                        <Lock
                                            size={14}
                                        />

                                    </div>


                                    <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
                                        Security
                                    </h3>

                                </div>


                                <ShieldCheck
                                    size={16}
                                    className="text-emerald-500"
                                />

                            </div>


                            <div className="space-y-3">

                                {[

                                    {
                                        label:
                                            'Password',
                                        value:
                                            'Strong',
                                        color:
                                            'text-emerald-500'
                                    },

                                    {
                                        label:
                                            '2-Factor',
                                        value:
                                            'Active',
                                        color:
                                            'text-[var(--brand-primary)]'
                                    },

                                    {
                                        label:
                                            'Lock',
                                        value:
                                            'Always',
                                        color:
                                            'text-rose-500'
                                    }

                                ].map(
                                    (
                                        s,
                                        i
                                    ) => (

                                        <div
                                            key={i}
                                            className="flex justify-between items-center py-1.5 border-b last:border-0"

                                            style={{
                                                borderColor:
                                                    'var(--border-color)'
                                            }}
                                        >

                                            <span
                                                className="text-[9px] font-bold uppercase tracking-[0.2em]"

                                                style={{
                                                    color:
                                                        'var(--text-muted)'
                                                }}
                                            >
                                                {
                                                    s.label
                                                }
                                            </span>


                                            <span
                                                className={`text-[9px] font-bold uppercase ${s.color}`}
                                            >
                                                {
                                                    s.value
                                                }
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>


                        {/* PREFERENCES */}

                        <div className="bg-[var(--bg-card)] rounded-[1.5rem] border border-[var(--border-color)] p-5 shadow-sm transition-colors duration-300">

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-8 h-8 bg-sky-500/10 text-sky-500 rounded-lg flex items-center justify-center">

                                    <Palette
                                        size={14}
                                    />

                                </div>


                                <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
                                    Preferences
                                </h3>

                            </div>


                            <div className="space-y-3">

                                {[

                                    {
                                        label:
                                            'Theme',
                                        value:
                                            theme,
                                        color:
                                            'text-[var(--text-main)]'
                                    },

                                    {
                                        label:
                                            'Alerts',
                                        value:
                                            'Enabled',
                                        color:
                                            'text-emerald-500'
                                    },

                                    {
                                        label:
                                            'Saver',
                                        value:
                                            'Off',
                                        color:
                                            'text-[var(--text-muted)]'
                                    }

                                ].map(
                                    (
                                        p,
                                        i
                                    ) => (

                                        <div
                                            key={i}
                                            className="flex justify-between items-center py-1.5 border-b last:border-0"

                                            style={{
                                                borderColor:
                                                    'var(--border-color)'
                                            }}
                                        >

                                            <span
                                                className="text-[9px] font-bold uppercase tracking-[0.2em]"

                                                style={{
                                                    color:
                                                        'var(--text-muted)'
                                                }}
                                            >
                                                {
                                                    p.label
                                                }
                                            </span>


                                            <span
                                                className={`text-[9px] font-bold uppercase ${p.color}`}
                                            >
                                                {
                                                    p.value
                                                }
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                </div>


                {/* ASSETS */}

                <div className="bg-[var(--bg-card)] rounded-[1.5rem] border border-[var(--border-color)] p-6 shadow-sm transition-colors duration-300">

                    <div className="flex items-center gap-4 mb-6">

                        <div className="w-8 h-8 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center">

                            <FileText
                                size={14}
                            />

                        </div>


                        <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
                            Assets
                        </h3>

                    </div>


                    <div className="space-y-3">

                        {documents.map(
                            (
                                doc,
                                idx
                            ) => (

                                <div
                                    key={idx}
                                    className="p-3 bg-[var(--bg-main)]/50 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card)] hover:shadow-lg transition-all"
                                >

                                    <div className="flex items-center gap-3 mb-3">

                                        <div className="w-8 h-8 bg-[var(--bg-card)] rounded-lg flex items-center justify-center text-rose-500 shadow-sm border border-[var(--border-color)]">

                                            <FileText
                                                size={12}
                                            />

                                        </div>


                                        <div className="overflow-hidden">

                                            <p
                                                className="text-[9px] font-bold uppercase truncate"

                                                style={{
                                                    color:
                                                        'var(--text-main)'
                                                }}
                                            >
                                                {
                                                    doc.name
                                                }
                                            </p>


                                            <p
                                                className="text-[7px] font-bold uppercase"

                                                style={{
                                                    color:
                                                        'var(--text-muted)'
                                                }}
                                            >
                                                {
                                                    doc.size
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        className="w-full py-2 text-[8px] font-bold uppercase tracking-widest border rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"

                                        style={{
                                            backgroundColor:
                                                'var(--bg-card)',

                                            color:
                                                'var(--text-muted)',

                                            borderColor:
                                                'var(--border-color)'
                                        }}
                                    >
                                        Get File
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>

            </div>

        </div>

    );

};


// =====================================================
// MINI STAT
// =====================================================

const MiniStat = ({
    label,
    value,
    icon
}) => {

    return (

        <div
            className="px-5 py-4 md:px-6 md:py-5 rounded-[1.5rem] md:rounded-[2.5rem] border flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group"

            style={{
                backgroundColor:
                    'var(--bg-card)',

                borderColor:
                    'var(--border-color)'
            }}
        >

            <div>

                <p
                    className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 md:mb-1 group-hover:text-blue-600 transition-colors"

                    style={{
                        color:
                            'var(--text-muted)'
                    }}
                >
                    {
                        label
                    }
                </p>


                <p
                    className="text-lg md:text-2xl font-black tracking-tighter uppercase"

                    style={{
                        color:
                            'var(--text-main)'
                    }}
                >
                    {
                        value
                    }
                </p>

            </div>


            <div
                className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full border group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 shadow-sm transition-all duration-300 shrink-0"

                style={{
                    backgroundColor:
                        'var(--bg-main)',

                    borderColor:
                        'var(--border-color)'
                }}
            >

                {
                    React.cloneElement(
                        icon,
                        {
                            size: 18,
                            className:
                                'md:w-6 md:h-6'
                        }
                    )
                }

            </div>

        </div>

    );

};


// =====================================================
// ATTENDANCE ACTION
// =====================================================

const AttendanceAction = ({
    isActive,
    onClick,
    label,
    color,
    icon
}) => {

    const activeStyles = {

        emerald:
            'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10 border-emerald-600',

        rose:
            'bg-rose-600 text-white shadow-lg shadow-rose-500/20 ring-4 ring-rose-500/10 border-rose-600',

        amber:
            'bg-amber-500 text-white shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10 border-amber-500'

    };


    return (

        <button

            onClick={
                onClick
            }

            className={`flex flex-col items-center justify-center gap-1.5 md:gap-2 py-3 md:py-4 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 active:scale-95 ${
                isActive

                    ? activeStyles[
                        color
                    ]

                    : 'bg-[var(--bg-main)]/50 border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--brand-primary)]/30 hover:bg-[var(--bg-card)] hover:text-[var(--brand-primary)]'
            }`}
        >

            {
                React.cloneElement(
                    icon,
                    {
                        size: 18,
                        className:
                            'md:w-5 md:h-5'
                    }
                )
            }


            <span
                className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${
                    isActive
                        ? 'text-white'
                        : 'text-slate-400'
                }`}
            >
                {
                    label
                }
            </span>

        </button>

    );

};


export default UserDashboard;