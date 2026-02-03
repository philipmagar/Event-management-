import React from 'react';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, theme, onToggleTheme }) => {
    return (
        <div className="min-h-screen bg-mesh text-text selection:bg-primary/30 selection:text-primary">
            <Navbar theme={theme} onToggleTheme={onToggleTheme} />
            <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
            </div>
        </div>
    );
};

export default Layout;
