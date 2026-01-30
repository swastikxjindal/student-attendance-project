import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-rose-50',
            text: 'text-rose-500',
            border: 'border-rose-100',
            button: 'bg-rose-500 shadow-rose-200',
            icon: 'text-rose-500'
        },
        warning: {
            bg: 'bg-amber-50',
            text: 'text-amber-500',
            border: 'border-amber-100',
            button: 'bg-amber-500 shadow-amber-200',
            icon: 'text-amber-500'
        },
        info: {
            bg: 'bg-blue-50',
            text: 'text-blue-500',
            border: 'border-blue-100',
            button: 'bg-blue-600 shadow-blue-200',
            icon: 'text-blue-500'
        }
    };

    const style = colors[type] || colors.info;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-50"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="p-8 md:p-10 flex flex-col items-center text-center">
                        {/* Icon */}
                        <div className={`w-16 h-16 ${style.bg} rounded-full flex items-center justify-center mb-6`}>
                            <AlertCircle size={32} className={style.icon} />
                        </div>

                        {/* Text */}
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 leading-tight">
                            {title}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10 px-4 opacity-70">
                            {message}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`w-full py-4 rounded-full ${style.button} text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95`}
                            >
                                {confirmText}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-full bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95"
                            >
                                {cancelText}
                            </button>
                        </div>
                    </div>

                    {/* Footer Accent */}
                    <div className={`h-1.5 w-full ${style.button} opacity-20`} />
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
