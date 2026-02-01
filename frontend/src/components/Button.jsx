import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = { primary: 'btn-primary', secondary: 'btn-secondary', outline: 'border-2 border-primary/20 hover:border-primary/50 text-primary bg-transparent', ghost: 'hover:bg-primary/10 text-primary bg-transparent', danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20', };
    const sizes = { sm: 'px-4 py-1.5 text-sm', md: 'px-6 py-2.5 text-base', lg: 'px-8 py-3 text-lg', };
    return (
        <motion.button ref={ref} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={cn(
            'relative inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none', variants[variant], sizes[size], className)}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}
        </motion.button>
    );
});
Button.displayName = 'Button';
export default Button;
