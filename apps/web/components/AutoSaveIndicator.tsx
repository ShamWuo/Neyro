'use client';

import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function AutoSaveIndicator({ show }: { show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="fixed bottom-6 right-6 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 flex items-center gap-2 z-50 backdrop-blur-sm"
                >
                    <CheckCircle2 className="size-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Saved</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
