import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const Card = ({ className, children, delay = 0, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                'glass-card rounded-2xl p-6 overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
