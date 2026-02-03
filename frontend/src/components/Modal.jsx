import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer, className }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={cn(
                        "relative w-full max-w-lg glass rounded-3xl shadow-2xl overflow-hidden border-white/10",
                        className
                        )}>
                        <div className="px-6 py-4 flex items-center justify-between border-b border-border/50">
                            <h3 className="text-xl font-bold">{title}</h3>
                            <button onClick={onClose} className="p-2 glass-hover rounded-xl text-text-muted hover:text-text transition-colors" title="Close"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            {children}
                        </div>
                        {footer && (
                            <div className="px-6 py-4 bg-surface/50 border-t border-border/50 flex justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
export default Modal;
