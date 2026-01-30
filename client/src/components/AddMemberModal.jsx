import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Mail, Hash, Shield, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddMemberModal = ({ isOpen, onClose, onAdd, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        department: 'Sales',
        position: '',
        contact: '',
        status: 'active',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                id: initialData.employee_id || initialData.id || '',
                department: initialData.department || 'Sales',
                position: initialData.position || '',
                contact: initialData.contact || '',
                status: initialData.status || 'active',
                password: '' // Don't pre-fill password for security
            });
        } else {
            setFormData({
                name: '',
                id: '',
                department: 'Sales',
                position: '',
                contact: '',
                status: 'active',
                password: ''
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
        // Reset form is handled by useEffect when isOpen changes or onAdd completes if needed
        // but adding a manual reset on close is better
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-[var(--bg-card)] rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-[var(--border-color)]"
                >
                    {/* Header */}
                    <div className="px-6 md:px-10 py-5 md:py-8 flex justify-between items-center border-b border-[var(--border-color)] bg-[var(--bg-main)]/30">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight uppercase">
                                {initialData ? 'Update Record' : 'Enroll New Member'}
                            </h3>
                            <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                                {initialData ? 'Personnel Management Console' : 'Personnel Registration System'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[var(--bg-card)] shadow-sm border border-[var(--border-color)] rounded-xl md:rounded-2xl text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-100 transition-all duration-300"
                        >
                            <X size={18} md:size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <InputField
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                icon={<User size={14} md:size={16} />}
                                placeholder="E.g. John Wick"
                            />
                            <InputField
                                label="Employee ID"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                icon={<Hash size={14} md:size={16} />}
                                placeholder="EMP-000"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Briefcase size={12} md:size={14} className="text-[var(--brand-primary)]" /> Department
                                </label>
                                <div className="relative">
                                    <select
                                        name="department"
                                        className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/50 focus:bg-[var(--bg-card)] focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/5 font-bold text-xs md:text-sm text-[var(--text-main)] outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.department}
                                        onChange={handleChange}
                                    >
                                        <option value="Sales">Sales Operations</option>
                                        <option value="IT">IT Infrastructure</option>
                                        <option value="HR">Human Resources</option>
                                        <option value="Management">Global Management</option>
                                        <option value="Marketing">Growth & Marketing</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                                        <Shield size={14} />
                                    </div>
                                </div>
                            </div>
                            <InputField
                                label="Designation"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                icon={<Shield size={14} md:size={16} />}
                                placeholder="Senior Executive"
                            />
                        </div>

                        <InputField
                            label="Email / Contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            icon={<Mail size={14} md:size={16} />}
                            placeholder="john@organization.com"
                        />

                        <div className="space-y-3 md:space-y-4">
                            <InputField
                                label="Access Credentials"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                icon={<Lock size={14} md:size={16} />}
                                placeholder="••••••••"
                                isPassword={true}
                                showPassword={showPassword}
                                onToggle={() => setShowPassword(!showPassword)}
                            />
                            <p className="text-[8px] md:text-[9px] text-slate-400 font-bold px-1 uppercase tracking-widest leading-none">* Member must update credentials upon initial entry.</p>
                        </div>

                        <div className="pt-4 md:pt-6 flex gap-3 md:gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-50 transition-all duration-300 active:scale-95"
                            >
                                DISCARD
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-blue-600 text-white font-bold text-[10px] md:text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-blue-100 transition-all duration-300 transform active:scale-95"
                            >
                                {initialData ? 'UPDATE RECORD' : 'CREATE MEMBER'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const InputField = ({ label, name, value, onChange, icon, placeholder, type = "text", isPassword, showPassword, onToggle }) => (
    <div className="space-y-1.5 md:space-y-2 group">
        <label className="text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2 px-1 group-focus-within:text-[var(--brand-primary)] transition-colors text-left">
            {icon && <span className="opacity-70">{icon}</span>} {label}
        </label>
        <div className="relative">
            <input
                type={type}
                name={name}
                required
                className="w-full px-4 md:px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/50 focus:bg-[var(--bg-card)] focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/5 font-bold text-xs md:text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/30 outline-none transition-all"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors p-1"
                >
                    {showPassword ? <EyeOff size={16} md:size={18} /> : <Eye size={16} md:size={18} />}
                </button>
            )}
        </div>
    </div>
);

export default AddMemberModal;
