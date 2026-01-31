import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        if (window.location.hostname === 'localhost') {
            console.log(`[Toast Suppressed on Localhost] ${type}: ${message}`);
            return;
        }

        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.8, transition: { duration: 0.2 } }}
                            className={cn(
                                "pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl min-w-[320px] max-w-md",
                                toast.type === 'success' && "bg-green-500/10 border-green-500/20 text-green-500",
                                toast.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-500",
                                toast.type === 'info' && "bg-primary/10 border-primary/20 text-primary"
                            )}
                        >
                            <div className="flex-shrink-0">
                                {toast.type === 'success' && <CheckCircle size={24} />}
                                {toast.type === 'error' && <AlertCircle size={24} />}
                                {toast.type === 'info' && <Info size={24} />}
                            </div>
                            <p className="flex-1 font-bold text-sm leading-tight text-text">
                                {toast.message}
                            </p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="opacity-50 hover:opacity-100 transition-opacity p-1"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
